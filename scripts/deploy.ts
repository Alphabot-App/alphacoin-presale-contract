import { config } from "dotenv";
import { ethers, upgrades } from "hardhat";

config();

const { USDT_ADDRESS, USDC_ADDRESS } = process.env;

async function main() {
  const factory = await ethers.getContractFactory("BoostPrivateSaleUpgradeable");
  const contract = await upgrades.deployProxy(factory, [
    USDT_ADDRESS,
    USDC_ADDRESS,
  ]);

  console.log("BoostPrivateSaleUpgradeable deployed to:", contract.address);

  await contract.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
