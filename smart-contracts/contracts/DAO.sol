// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract DAO {
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        uint256 createdAt;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public nextProposalId;

    event ProposalCreated(uint256 id, string description, uint256 timestamp);
    event Voted(uint256 id, bool support, uint256 votesFor, uint256 votesAgainst);
    event Executed(uint256 id);

    function createProposal(string memory description) external {
        proposals[nextProposalId] = Proposal({
            id: nextProposalId,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            createdAt: block.timestamp
        });

        emit ProposalCreated(nextProposalId, description, block.timestamp);
        nextProposalId++;
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(!p.executed, "Proposal already executed");

        if (support) p.votesFor++;
        else p.votesAgainst++;

        emit Voted(id, support, p.votesFor, p.votesAgainst);
    }

    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(!p.executed, "Already executed");
        require(p.votesFor > p.votesAgainst, "Not enough support");

        p.executed = true;
        emit Executed(id);
    }
}
