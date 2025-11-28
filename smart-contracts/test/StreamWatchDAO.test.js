const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StreamWatchDAO", function () {
  let StreamWatchDAO, dao, owner, addr1, addr2;

  beforeEach(async function () {
    StreamWatchDAO = await ethers.getContractFactory("StreamWatchDAO");
    [owner, addr1, addr2] = await ethers.getSigners();
    dao = await StreamWatchDAO.deploy();
    await dao.deployed();
  });

  it("creates a proposal and emits event", async function () {
    const tx = await dao.connect(owner).createProposal("p-1", "First proposal title");
    const receipt = await tx.wait();

    // event check
    const ev = receipt.events.find((e) => e.event === "ProposalCreated");
    expect(ev).to.not.be.undefined;
    expect(ev.args.proposalId).to.equal("p-1");
    expect(ev.args.title).to.equal("First proposal title");
    expect(ev.args.proposer).to.equal(owner.address);

    // mapping check
    const p = await dao.getProposal("p-1");
    expect(p[0]).to.equal("p-1"); // proposalId
    expect(p[1]).to.equal("First proposal title"); // title
    expect(p[2]).to.equal(owner.address); // proposer
    expect(p[6]).to.equal(true); // exists
  });

  it("allows voting and increments counts", async function () {
    await dao.connect(owner).createProposal("p-2", "Second proposal");

    await dao.connect(addr1).vote("p-2", true); // yes
    await dao.connect(addr2).vote("p-2", false); // no
    await dao.connect(addr1).vote("p-2", true); // yes again

    const p = await dao.getProposal("p-2");
    const votesFor = p[4].toNumber();
    const votesAgainst = p[5].toNumber();

    expect(votesFor).to.equal(2);
    expect(votesAgainst).to.equal(1);
  });

  it("rejects duplicate proposalId", async function () {
    await dao.connect(owner).createProposal("p-3", "Third");
    await expect(dao.connect(addr1).createProposal("p-3", "Third duplicate")).to.be.revertedWith("proposal exists");
  });
});
