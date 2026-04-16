import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("LabReportRegistry");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const [deployer] = await ethers.getSigners();

  console.log("LabReportRegistry deployed to:", address);
  console.log("Deployer:", deployer.address);
  console.log("Set this in backend/frontend env as CONTRACT_ADDRESS =", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
