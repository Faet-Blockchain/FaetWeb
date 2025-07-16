// scripts/deploy-testnet-full.js
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  const provider = ethers.provider;

  // wallets from .env
  const deployer  = new ethers.Wallet(process.env.PRIVATE_KEY,  provider);
  const emergency = new ethers.Wallet(process.env.PRIVATE_KEY2, provider);

  console.log("Deployer:         ", deployer.address);
  console.log("Emergency Admin:  ", emergency.address);

  // === Deploy FaetTestToken ===
  const nftAddress = "0x9AcB6e75D9c94eEb9320b35758cF0B21e4FF7a5D";
  const FaetTestToken = await ethers.getContractFactory("FaetTestToken", deployer);
  const faetToken = await FaetTestToken.deploy(
    nftAddress,
    deployer.address,
    emergency.address
  );
  await faetToken.waitForDeployment();
  const faetTokenAddress = await faetToken.getAddress();
  console.log("FaetTestToken deployed to:", faetTokenAddress);

  // === Deploy FaetTestStaking ===
  const FaetTestStaking = await ethers.getContractFactory("FaetTestStaking", deployer);
  const rewardPerBlock = ethers.parseUnits("1.0", 18);
  const faetStaking = await FaetTestStaking.deploy(
    faetTokenAddress,
    faetTokenAddress,
    rewardPerBlock,
    emergency.address
  );
  await faetStaking.waitForDeployment();
  const faetStakingAddress = await faetStaking.getAddress();
  console.log("FaetTestStaking deployed to:", faetStakingAddress);

  // === Fund staking rewards with deployer ===
  const fundAmount = ethers.parseUnits("350000000", 18);

  await faetToken.connect(deployer).approve(faetStakingAddress, fundAmount);
  console.log(`Deployer approved ${fundAmount} FAET to staking contract`);

  await faetStaking.connect(deployer).fundRewards(fundAmount);
  console.log(`Staking rewards funded with ${fundAmount} FAET`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
