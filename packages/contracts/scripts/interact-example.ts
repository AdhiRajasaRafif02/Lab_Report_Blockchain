import { ethers } from "hardhat";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Set CONTRACT_ADDRESS in packages/contracts/.env");
  }

  const registry = await ethers.getContractAt("LabReportRegistry", CONTRACT_ADDRESS);

  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("sample-lab-report-pdf-content"));
  const tx = await registry.registerDocument(
    "DOC-DEMO-001",
    sampleHash,
    "demo-report.pdf",
    "blood_test",
    "Campus Health Lab"
  );
  await tx.wait();
  console.log("Registered document hash:", sampleHash);

  const byId = await registry.getDocumentById("DOC-DEMO-001");
  console.log("Lookup by ID:", byId);

  const verifyResult = await registry.verifyDocumentHash.staticCall(sampleHash);
  console.log("verifyDocumentHash -> exists, isRevoked, documentId:", verifyResult);

  const revokeTx = await registry.revokeDocument("DOC-DEMO-001", "Demonstration revocation");
  await revokeTx.wait();
  console.log("Document revoked.");

  const status = await registry.getDocumentStatus("DOC-DEMO-001");
  console.log("Status:", status);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
