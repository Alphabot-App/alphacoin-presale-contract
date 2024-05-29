import { config } from "dotenv";
import { ethers, upgrades } from "hardhat";

config();

async function main() {
  const factory = await ethers.getContractFactory(
    "BoostPrivateSaleUpgradeable"
  );
  const contract = await upgrades.deployProxy(factory, [
    String(process.env.USDT_ADDRESS).toLocaleLowerCase(),
    String(process.env.USDC_ADDRESS).toLocaleLowerCase(),
    process.env.OUT_ADDRESS,
  ]);

  console.log("BoostPrivateSaleUpgradeable deployed to:", await contract.getAddress());

  await contract.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
