import { expect } from "chai";
import { ethers } from "hardhat";
import type { BaseContract } from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MAT", function () {
  let token: BaseContract;
  let admin: HardhatEthersSigner;
  let team: HardhatEthersSigner;
  let reward: HardhatEthersSigner;
  let marketing: HardhatEthersSigner;
  let liquidity: HardhatEthersSigner;
  let reserve: HardhatEthersSigner;

  const unit = 10n ** 8n;
  const maxSupply = 10_000_000_000n * unit;

  beforeEach(async function () {
    [admin, team, reward, marketing, liquidity, reserve] = await ethers.getSigners();

    token = await ethers.deployContract("MAT", [
      admin.address,
      team.address,
      reward.address,
      marketing.address,
      liquidity.address,
      reserve.address,
    ]);

    await token.waitForDeployment();
  });

  it("returns the configured token metadata and supply", async function () {
    expect(await token.getFunction("name")()).to.equal("ManicAwardToken");
    expect(await token.getFunction("symbol")()).to.equal("MAT");
    expect(await token.getFunction("decimals")()).to.equal(8n);
    expect(await token.getFunction("totalSupply")()).to.equal(maxSupply);
  });

  it("allocates the initial supply", async function () {
    expect(await token.getFunction("balanceOf")(team.address)).to.equal(1_500_000_000n * unit);
    expect(await token.getFunction("balanceOf")(reward.address)).to.equal(4_000_000_000n * unit);
    expect(await token.getFunction("balanceOf")(marketing.address)).to.equal(1_000_000_000n * unit);
    expect(await token.getFunction("balanceOf")(liquidity.address)).to.equal(2_000_000_000n * unit);
    expect(await token.getFunction("balanceOf")(reserve.address)).to.equal(1_500_000_000n * unit);
  });

  it("allows holders to burn their own tokens", async function () {
    const burnAmount = 1_000n * unit;

    await expect(token.connect(team).getFunction("burn")(burnAmount))
      .to.emit(token, "TokensBurned")
      .withArgs(team.address, burnAmount);

    expect(await token.getFunction("balanceOf")(team.address)).to.equal(1_500_000_000n * unit - burnAmount);
    expect(await token.getFunction("totalSupply")()).to.equal(maxSupply - burnAmount);
  });

  it("transfers a small amount", async function () {
    const transferAmount = unit;

    await expect(token.connect(team).getFunction("transfer")(reward.address, transferAmount))
      .to.emit(token, "Transfer")
      .withArgs(team.address, reward.address, transferAmount);

    expect(await token.getFunction("balanceOf")(team.address)).to.equal(1_500_000_000n * unit - transferAmount);
    expect(await token.getFunction("balanceOf")(reward.address)).to.equal(4_000_000_000n * unit + transferAmount);
  });

  it("does not expose burnFrom for forced burns", async function () {
    const teamBalance = await token.getFunction("balanceOf")(team.address);
    const callData = token.interface.encodeFunctionData("burn", [unit]);
    const burnFromSelector = "0x79cc6790";
    const burnFromCallData = burnFromSelector + callData.slice(10);

    await expect(team.sendTransaction({ to: await token.getAddress(), data: burnFromCallData })).to.be.reverted;
    expect(await token.getFunction("balanceOf")(team.address)).to.equal(teamBalance);
  });

  it("reverts when admin is the zero address", async function () {
    await expect(
      ethers.deployContract("MAT", [
        ethers.ZeroAddress,
        team.address,
        reward.address,
        marketing.address,
        liquidity.address,
        reserve.address,
      ]),
    ).to.be.reverted;
  });

  it("reverts when burning more than the caller balance", async function () {
    await expect(token.connect(team).getFunction("burn")(1_501_000_000n * unit)).to.be.reverted;
  });

  it("allows the owner to recover external ERC20 tokens", async function () {
    const externalToken = await deployToken();
    const recipient = reserve;
    const amount = 1_000n * unit;
    const recipientInitialBalance = await externalToken.getFunction("balanceOf")(recipient.address);

    await externalToken.connect(team).getFunction("transfer")(await token.getAddress(), amount);

    await expect(
      token.connect(admin).getFunction("recoverERC20")(await externalToken.getAddress(), recipient.address, amount),
    )
      .to.emit(token, "ERC20Recovered")
      .withArgs(await externalToken.getAddress(), recipient.address, amount);

    expect(await externalToken.getFunction("balanceOf")(await token.getAddress())).to.equal(0n);
    expect(await externalToken.getFunction("balanceOf")(recipient.address)).to.equal(recipientInitialBalance + amount);
  });

  it("prevents non-owners from recovering external ERC20 tokens", async function () {
    const externalToken = await deployToken();
    const recipient = reserve;
    const amount = 1_000n * unit;
    const recipientInitialBalance = await externalToken.getFunction("balanceOf")(recipient.address);

    await externalToken.connect(team).getFunction("transfer")(await token.getAddress(), amount);

    await expect(
      token.connect(team).getFunction("recoverERC20")(await externalToken.getAddress(), recipient.address, amount),
    ).to.be.reverted;

    expect(await externalToken.getFunction("balanceOf")(await token.getAddress())).to.equal(amount);
    expect(await externalToken.getFunction("balanceOf")(recipient.address)).to.equal(recipientInitialBalance);
  });

  async function deployToken(): Promise<BaseContract> {
    const deployedToken = await ethers.deployContract("MAT", [
      admin.address,
      team.address,
      reward.address,
      marketing.address,
      liquidity.address,
      reserve.address,
    ]);

    await deployedToken.waitForDeployment();

    return deployedToken;
  }
});
