import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import os from "node:os";
import path from "node:path";
import type { HardhatUserConfig } from "hardhat/config";

const privateKey = process.env.PRIVATE_KEY;
const generatedFilesRoot = path.join(os.tmpdir(), "ethers-mat-hardhat");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 1337
    },
    // BSC Testnet
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "",
      chainId: 97,
      accounts: privateKey ? [privateKey] : [],
    },
    // BSC Mainnet
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC_URL || "",
      chainId: 56,
      accounts: privateKey ? [privateKey] : [],
      gasPrice: 5000000000, // 5 gwei
    }
  },
  paths: {
    artifacts: path.join(generatedFilesRoot, "artifacts"),
    cache: path.join(generatedFilesRoot, "cache"),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY || "",
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
    ],
  },
};

export default config;
