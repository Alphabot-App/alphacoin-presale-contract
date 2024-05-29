import { config } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "tsconfig-paths/register";
import "@nomicfoundation/hardhat-verify";

config();

const {
  API_URL,
  PRIVATE_KEY,
  NETWORK = "hardhat",
  ETHERSCAN_API_KEY,
} = process.env;

const configObj: HardhatUserConfig = {
  solidity: "0.8.20",
  defaultNetwork: NETWORK,
  networks: {
    [NETWORK]: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    hardhat: {},
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
};

export default configObj;
