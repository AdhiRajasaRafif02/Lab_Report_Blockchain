import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const localPrivateKey = process.env.LOCAL_PRIVATE_KEY;
const isValidPrivateKey = (value?: string) => /^0x[0-9a-fA-F]{64}$/.test(value ?? "");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: isValidPrivateKey(localPrivateKey) ? [localPrivateKey!] : undefined
    }
  }
};

export default config;
