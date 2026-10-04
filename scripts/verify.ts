import hre from "hardhat";
import constructorArgs from "./constructor-args";

async function main(): Promise<void> {
  const deployedAddress = process.env.MAT_CONTRACT_ADDRESS;

  if (!deployedAddress) {
    throw new Error("MAT_CONTRACT_ADDRESS must be set to the newly deployed MAT contract address.");
  }

  await hre.run("verify:verify", {
    address: deployedAddress,
    constructorArguments: [...constructorArgs],
    contract: "contracts/MAT.sol:MAT",
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
