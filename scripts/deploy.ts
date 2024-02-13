import { config } from "dotenv";
import { ethers } from "hardhat";

config();

const { USDT_ADDRESS, USDC_ADDRESS } = process.env;

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = ethers.parseEther("0.001");

  const lock = await ethers.deployContract(
    "BoostPrivateSaleUpgradeable",
    [
      USDT_ADDRESS, //usdt
      USDC_ADDRESS, //usdc
    ],
    {
      value: lockedAmount,
      gasLimit: 1500000,
    }
  );

  await lock.waitForDeployment();

  console.log(
    `Lock with ${ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
