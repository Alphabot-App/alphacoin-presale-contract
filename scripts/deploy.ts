import { config } from "dotenv";
import { ethers, upgrades } from "hardhat";

config();

const { USDT_ADDRESS, USDC_ADDRESS } = process.env;

async function main() {
  const factory = await ethers.getContractFactory("BoostPrivateSaleUpgradeable");
  const contract = await upgrades.deployProxy(factory, [
    "0x7169d38820dfd117c3fa1f22a697dba58d90ba06",
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  ]);

  console.log("BoostPrivateSaleUpgradeable deployed to:", contract.address);

  const lock = await ethers.deployContract(
    "BoostPrivateSaleUpgradeable",
    [
      USDT_ADDRESS, //usdt
      USDC_ADDRESS, //usdc
    ]
  );

  await lock.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
