import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { parseEther } from "ethers";

describe("BoostPrivateSaleUpgradeable", function () {
  let privateSale: any;
  let usdc: any;
  let usdt: any;
  let invalidToken: any;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory(
      "BoostPrivateSaleUpgradeable"
    );

    const tokenFactory = await ethers.getContractFactory("MockToken");
    usdc = await tokenFactory.deploy("USDC", "USDC", parseEther("1000"));
    usdt = await tokenFactory.deploy("USDT", "USDT", parseEther("1000"));
    invalidToken = await tokenFactory.deploy(
      "INVALID",
      "INVALID",
      parseEther("1000")
    );

    privateSale = await upgrades.deployProxy(factory, [
      await usdt.getAddress(),
      await usdc.getAddress(),
    ]);
  });

  it("should deploy", async function () {
    expect(privateSale).to.be.ok;
  });

  it("should revert if wrong token is used", async function () {
    await invalidToken.approve(
      await privateSale.getAddress(),
      parseEther("100")
    );
    await expect(
      privateSale.privateSaleWithToken(
        await invalidToken.getAddress(),
        parseEther("100")
      )
    ).to.be.reverted;
  });

  it("should revert if not approved", async function () {
    await expect(
      privateSale.privateSaleWithToken(
        await usdc.getAddress(),
        parseEther("100")
      )
    ).to.be.revertedWithCustomError(usdc, "ERC20InsufficientAllowance");
  });

  it("should not revert if correct token is used", async function () {
    await usdc.approve(await privateSale.getAddress(), parseEther("100"));
    await expect(
      privateSale.privateSaleWithToken(
        await usdc.getAddress(),
        parseEther("100")
      )
    ).to.not.be.reverted;
    expect(await usdc.balanceOf(await privateSale.getAddress())).to.equal(
      parseEther("100")
    );
    expect(
      await usdc.balanceOf((await ethers.provider.getSigner(0)).address)
    ).to.equal(parseEther("900"));
  });

  it("should withdraw", async function () {
    let withdrawTo = (await ethers.getSigners())[1];

    await usdc.approve(await privateSale.getAddress(), parseEther("100"));
    await expect(
      privateSale.privateSaleWithToken(
        await usdc.getAddress(),
        parseEther("100")
      )
    ).to.not.be.reverted;

    expect(await usdc.balanceOf(await privateSale.getAddress())).to.equal(
      parseEther("100")
    );
    expect(await usdc.balanceOf(withdrawTo.address)).to.equal(parseEther("0"));

    await privateSale.withdraw(
      await usdc.getAddress(),
      parseEther("100"),
      (
        await ethers.getSigners()
      )[1].address
    );

    expect(await usdc.balanceOf(withdrawTo.address)).to.equal(
      parseEther("100")
    );
    expect(await usdc.balanceOf(await privateSale.getAddress())).to.equal(
      parseEther("0")
    );
  });
});
