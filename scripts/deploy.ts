import { config } from "dotenv";
import { ethers, upgrades } from "hardhat";
import {exec as execBase} from 'child_process';
import {promisify} from 'util';

const exec = promisify(execBase);

config();

async function main() {
  const start = Date.now();
  const factory = await ethers.getContractFactory(
    "BoostPrivateSaleUpgradeable"
  );
  const contract = await upgrades.deployProxy(factory, [
    String(process.env.USDT_ADDRESS).toLocaleLowerCase(),
    String(process.env.USDC_ADDRESS).toLocaleLowerCase(),
    process.env.OUT_ADDRESS,
  ]);

  const address = await contract.getAddress()

  console.log("BoostPrivateSaleUpgradeable deployed to:", address);

  await contract.waitForDeployment();
  console.log("BoostPrivateSaleUpgradeable deployment complete", Date.now() - start);

  if (process.env.NO_VERIFY !== 'true') {
    console.log('Verifying on etherscan...')
    const result = await exec(`hardhat verify --network ${process.env.NETWORK} ${address}`);
    console.log('Result: ', result.stdout);
    if (result.stderr) {
      console.log('ERROR:', result.stderr);
    }
  } else {
    console.log('Not verifying contract because NO_VERIFY=true');
    console.log('Run the following in a terminal to verify:')
    console.log(`hardhat verify --network ${process.env.NETWORK} ${address}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
