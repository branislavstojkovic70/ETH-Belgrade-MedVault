import "@oasisprotocol/sapphire-hardhat"; // OBAVEZNO prvi import!
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@oasisprotocol/sapphire-hardhat";
import "@typechain/hardhat";
import * as dotenv from "dotenv";
import "./tasks/MedVault";

dotenv.config();


const TEST_HDWALLET = {
  mnemonic: "test test test test test test test test test test test junk",
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 20,
};

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY]: TEST_HDWALLET;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    'sapphire-localnet': {
      url: "http://localhost:8545",
      accounts: accounts,
      chainId: 0x5afd,
    },
    sapphire: {
      url: "https://sapphire.oasis.io/",
      accounts: accounts,
      chainId: 0x5afe,
    },
    'sapphire-1rpc': {
      url: "https://1rpc.io/oasis/sapphire",
      accounts: accounts,
      chainId: 0x5afe,
    },
    'sapphire-testnet': {
      url: "https://testnet.sapphire.oasis.dev",
      accounts: accounts,
      chainId: 0x5aff,
    },
  },
};

export default config;