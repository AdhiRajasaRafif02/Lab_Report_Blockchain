import { PrismaClient } from "@prisma/client";
import { blockchainService } from "../src/modules/blockchain/blockchain.service.js";

const prisma = new PrismaClient();

const main = async () => {
  const documents = await prisma.document.findMany({
    include: {
      revocation: true
    },
    orderBy: { createdAt: "asc" }
  });

  console.log(`Found ${documents.length} documents in DB.`);

  let registered = 0;
  let skipped = 0;
  let revoked = 0;
  let mismatched = 0;

  for (const document of documents) {
    const onChain = await blockchainService.getDocumentById(document.id);

    if (onChain) {
      const normalizedDbHash = document.fileHash.toLowerCase().replace(/^0x/, "");
      const normalizedChainHash = onChain.fileHash.toLowerCase().replace(/^0x/, "");
      if (normalizedDbHash !== normalizedChainHash) {
        mismatched += 1;
        console.warn(
          `Hash mismatch for ${document.id}: db=${normalizedDbHash} chain=${normalizedChainHash}. Skipping.`
        );
      } else {
        skipped += 1;
      }
      continue;
    }

    console.log(`Registering missing on-chain record for ${document.id} (${document.documentCode})...`);

    const registerResult = await blockchainService.registerDocument({
      documentId: document.id,
      fileHash: document.fileHash,
      fileName: document.fileName,
      documentType: document.documentType,
      institutionName: document.institutionName ?? undefined
    });

    await prisma.document.update({
      where: { id: document.id },
      data: {
        txHash: registerResult.txHash,
        blockNumber: BigInt(registerResult.blockNumber),
        chainTimestamp: new Date()
      }
    });

    registered += 1;

    if (document.status === "revoked" && document.revocation) {
      console.log(`Re-applying revocation for ${document.id}...`);

      const revokeResult = await blockchainService.revokeDocument(document.id, document.revocation.reason);

      await prisma.revocation.update({
        where: { id: document.revocation.id },
        data: {
          txHash: revokeResult.txHash
        }
      });

      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "revoked",
          txHash: revokeResult.txHash,
          blockNumber: BigInt(revokeResult.blockNumber),
          chainTimestamp: new Date()
        }
      });

      revoked += 1;
    }
  }

  console.log(
    `Done. registered=${registered}, skipped=${skipped}, revoked=${revoked}, mismatched=${mismatched}`
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
