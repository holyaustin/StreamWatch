import { ethers } from "hardhat";
import { expect } from "chai";

describe("DAO", () => {
  it("Should create proposal and allow voting", async () => {
    const [owner] = await ethers.getSigners();
    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.deploy();
    await dao.waitForDeployment();

    await expect(dao.createProposal("Test proposal"))
      .to.emit(dao, "ProposalCreated");

    await expect(dao.vote(0, true))
      .to.emit(dao, "Voted");
  });
});
