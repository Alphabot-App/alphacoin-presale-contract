import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { parseEther, Contract, HDNodeWallet } from "ethers";

async function generateRandomWallet(): Promise<HDNodeWallet> {
  // Connect to Hardhat Provider
  const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
  // Set balance
  await ethers.provider.send("hardhat_setBalance", [
    wallet.address,
    "0x56BC75E2D63100000", // 100 ETH
  ]);
  return wallet;
}

describe("BoostPrivateSaleUpgradeable", function () {
  let usdc: any;
  let usdt: any;
  let invalidToken: any;

  let privateSale: Contract;
  let outWallet: HDNodeWallet;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory(
      "BoostPrivateSaleUpgradeable"
    );

    outWallet = await generateRandomWallet();

    const tokenFactory = await ethers.getContractFactory("MockToken");
    usdc = await tokenFactory.deploy("USDC", "USDC", parseEther("1000"));
    usdt = await tokenFactory.deploy("USDT", "USDT", parseEther("1000"));
    invalidToken = await tokenFactory.deploy(
      "INVALID",
      "INVALID",
      outWallet.address
    );

    privateSale = await upgrades.deployProxy(factory, [
      await usdt.getAddress(),
      await usdc.getAddress(),
      outWallet.address,
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

  it("should revert if person sends eth directly to contract", async function () {
    await expect(
      outWallet.sendTransaction({
        to: await privateSale.getAddress(),
        value: parseEther("10"),
      })
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
    expect(await usdc.balanceOf(outWallet.address)).to.equal(parseEther("0"));

    await usdc.approve(await privateSale.getAddress(), parseEther("100"));
    await expect(
      privateSale.privateSaleWithToken(
        await usdc.getAddress(),
        parseEther("100")
      )
    ).to.not.be.reverted;
    expect(await usdc.balanceOf(outWallet.address)).to.equal(parseEther("100"));
    expect(
      await usdc.balanceOf((await ethers.provider.getSigner(0)).address)
    ).to.equal(parseEther("900"));
  });

  it("should not revert if eth is used, and change output wallet", async function () {
    const sendWallet = await generateRandomWallet();

    expect(await ethers.provider.getBalance(sendWallet.address)).to.equal(
      parseEther("100")
    );
    expect(await ethers.provider.getBalance(outWallet.address)).to.equal(
      parseEther("100")
    );

    await expect(
      (privateSale.connect(sendWallet) as any).privateSaleWithEth({
        from: sendWallet.address,
        value: parseEther("10"),
      })
    ).to.not.be.reverted;

    // Exact amt varies because of gas
    expect(
      await ethers.provider.getBalance(sendWallet.address)
    ).to.be.lessThanOrEqual(parseEther("90"));
    expect(
      await ethers.provider.getBalance(sendWallet.address)
    ).to.be.greaterThanOrEqual(parseEther("89"));

    expect(await ethers.provider.getBalance(outWallet.address)).to.equal(
      parseEther("110")
    );

    const newOutWallet = await generateRandomWallet();

    // Change output address
    await expect(privateSale.setOutAddress(newOutWallet.address)).to.not.be
      .reverted;

    await expect(
      (privateSale.connect(sendWallet) as Contract).privateSaleWithEth({
        from: sendWallet.address,
        value: parseEther("10"),
      })
    ).to.not.be.reverted;

    // Exact amt varies because of gas
    expect(
      await ethers.provider.getBalance(sendWallet.address)
    ).to.be.lessThanOrEqual(parseEther("80"));
    expect(
      await ethers.provider.getBalance(sendWallet.address)
    ).to.be.greaterThanOrEqual(parseEther("79"));

    expect(await ethers.provider.getBalance(outWallet.address)).to.equal(
      parseEther("110")
    );

    expect(await ethers.provider.getBalance(newOutWallet.address)).to.equal(
      parseEther("110")
    );
  });

  it("should withdraw if person sends token directly to contract", async function () {
    const contractAddress = await privateSale.getAddress();
    await usdc.transfer(contractAddress, parseEther("10"));

    expect(await usdc.balanceOf(contractAddress)).to.equal(parseEther("10"));

    expect(
      await privateSale.withdraw(
        await usdc.getAddress(),
        parseEther("10"),
        outWallet.address
      )
    ).not.to.be.reverted;

    expect(await usdc.balanceOf(outWallet.address)).to.equal(parseEther("10"));
  });
});
