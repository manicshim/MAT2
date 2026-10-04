import { ethers } from "hardhat";

async function main(): Promise<void> {
  const adminWallet = requiredEnv("ADMIN_WALLET");
  const teamWallet = requiredEnv("TEAM_WALLET");
  const rewardWallet = requiredEnv("REWARD_WALLET");
  const marketingWallet = requiredEnv("MARKETING_WALLET");
  const liquidityWallet = requiredEnv("LIQUIDITY_WALLET");
  const reserveWallet = requiredEnv("RESERVE_WALLET");

  const token = await ethers.deployContract("MAT", [
    adminWallet,
    teamWallet,
    rewardWallet,
    marketingWallet,
    liquidityWallet,
    reserveWallet,
  ]);

  await token.waitForDeployment();

  console.log("MAT deployed:", await token.getAddress());
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set`);
  }

  return value;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
