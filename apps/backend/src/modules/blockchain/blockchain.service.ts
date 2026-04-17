import { Contract, JsonRpcProvider, Wallet, type TransactionReceipt } from "ethers";
import { env } from "../../config/env.js";
import abi from "../../lib/lab-report-registry.abi.json";
import { AppError } from "../../utils/app-error.js";
import type { OnChainDocument, VerifyHashResult } from "./blockchain.types.js";

const provider = new JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
const signer = new Wallet(env.BLOCKCHAIN_PRIVATE_KEY, provider);
// ABI is checked into backend so the API can run independently from Hardhat artifact folders.
const contract = new Contract(env.BLOCKCHAIN_CONTRACT_ADDRESS, abi, signer);

const toBytes32Hash = (hexHash: string) => {
  const normalized = hexHash.startsWith("0x") ? hexHash : `0x${hexHash}`;
  if (!/^0x[a-fA-F0-9]{64}$/.test(normalized)) {
    throw new AppError("Invalid SHA-256 hash format", 400, "INVALID_HASH_FORMAT");
  }
  return normalized;
};

const toDateFromUnix = (unixSeconds: bigint) => new Date(Number(unixSeconds) * 1000);

const mapDocumentTuple = (tuple: {
  documentId: string;
  fileHash: string;
  fileName: string;
  documentType: string;
  uploader: string;
  institutionName: string;
  registeredAt: bigint;
  isRevoked: boolean;
  revokedReason: string;
}): OnChainDocument => ({
  documentId: tuple.documentId,
  fileHash: tuple.fileHash.toLowerCase().replace(/^0x/, ""),
  fileName: tuple.fileName,
  documentType: tuple.documentType,
  uploader: tuple.uploader,
  institutionName: tuple.institutionName,
  registeredAt: toDateFromUnix(tuple.registeredAt),
  isRevoked: tuple.isRevoked,
  revokedReason: tuple.revokedReason
});

const parseBlockchainError = (error: unknown) => {
  if (error && typeof error === "object" && "shortMessage" in error) {
    return String((error as { shortMessage: unknown }).shortMessage);
  }
  if (error && typeof error === "object" && "reason" in error) {
    return String((error as { reason: unknown }).reason);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown blockchain error";
};

const waitForReceipt = async (tx: { hash: string; wait: () => Promise<TransactionReceipt | null> }) => {
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) {
    throw new AppError("Blockchain transaction reverted", 502, "BLOCKCHAIN_TX_REVERTED", {
      txHash: tx.hash
    });
  }
  return receipt;
};

export const blockchainService = {
  registerDocument: async (input: {
    documentId: string;
    fileHash: string;
    fileName: string;
    documentType: string;
    institutionName?: string;
  }) => {
    try {
      const tx = await contract.registerDocument(
        input.documentId,
        toBytes32Hash(input.fileHash),
        input.fileName,
        input.documentType,
        input.institutionName ?? ""
      );
      const receipt = await waitForReceipt(tx);
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new AppError("Failed to register document on blockchain", 502, "BLOCKCHAIN_REGISTER_FAILED", {
        cause: parseBlockchainError(error)
      });
    }
  },
  revokeDocument: async (documentId: string, reason: string) => {
    try {
      const tx = await contract.revokeDocument(documentId, reason);
      const receipt = await waitForReceipt(tx);
      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      throw new AppError("Failed to revoke document on blockchain", 502, "BLOCKCHAIN_REVOKE_FAILED", {
        cause: parseBlockchainError(error)
      });
    }
  },
  getDocumentById: async (documentId: string): Promise<OnChainDocument | null> => {
    try {
      const result = await contract.getDocumentById(documentId);
      if (!result.documentId) {
        return null;
      }
      return mapDocumentTuple(result);
    } catch (error) {
      throw new AppError("Failed to read document by ID from blockchain", 502, "BLOCKCHAIN_READ_FAILED", {
        cause: parseBlockchainError(error)
      });
    }
  },
  getDocumentByHash: async (fileHash: string): Promise<OnChainDocument | null> => {
    try {
      const result = await contract.getDocumentByHash(toBytes32Hash(fileHash));
      if (!result.documentId) {
        return null;
      }
      return mapDocumentTuple(result);
    } catch (error) {
      throw new AppError("Failed to read document by hash from blockchain", 502, "BLOCKCHAIN_READ_FAILED", {
        cause: parseBlockchainError(error)
      });
    }
  },
  verifyDocumentHash: async (fileHash: string): Promise<VerifyHashResult> => {
    try {
      const response = await contract.verifyDocumentHash.staticCall(toBytes32Hash(fileHash));
      return {
        exists: response[0],
        isRevoked: response[1],
        documentId: response[2]
      };
    } catch (error) {
      throw new AppError("Failed to verify document hash on blockchain", 502, "BLOCKCHAIN_VERIFY_FAILED", {
        cause: parseBlockchainError(error)
      });
    }
  }
};
