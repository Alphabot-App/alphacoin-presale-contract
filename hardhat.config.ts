import { config } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "tsconfig-paths/register";

config();

const { API_URL, PRIVATE_KEY, NETWORK = 'hardhat' } = process.env;

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
};

export default configObj;
