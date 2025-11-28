import { ethers } from "hardhat";

async function main() {
  const DAO = await ethers.getContractFactory("StreamWatchDAO");
  const dao = await DAO.deploy();
  await dao.waitForDeployment();
  console.log("StreamWatchDAO deployed to:", await dao.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});