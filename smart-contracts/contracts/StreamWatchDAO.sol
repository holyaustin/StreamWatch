// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title StreamWatchDAO
contract StreamWatchDAO {
    struct Proposal {
        string proposalId;
        string title;
        address proposer;
        uint256 timestamp;
        uint256 votesFor;
        uint256 votesAgainst;
        bool exists;
    }

    // proposalId => Proposal
    mapping(string => Proposal) public proposals;

    // Events match SDS flow
    event ProposalCreated(string indexed proposalId, string title, address indexed proposer, uint256 timestamp);
    event VoteCast(string indexed proposalId, address indexed voter, bool support, uint256 timestamp);

    /// Create a new proposal that uses a string `proposalId`.
    /// Reverts if a proposal with same proposalId already exists.
    function createProposal(string calldata proposalId, string calldata title) external {
        require(bytes(proposalId).length > 0, "proposalId required");
        require(bytes(title).length > 0, "title required");
        require(!proposals[proposalId].exists, "proposal exists");

        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            title: title,
            proposer: msg.sender,
            timestamp: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            exists: true
        });

        emit ProposalCreated(proposalId, title, msg.sender, block.timestamp);
    }

    /// Vote (support = true => yes). No uniqueness checks here (simple increment).
    function vote(string calldata proposalId, bool support) external {
        require(proposals[proposalId].exists, "proposal not found");

        if (support) {
            proposals[proposalId].votesFor += 1;
        } else {
            proposals[proposalId].votesAgainst += 1;
        }

        emit VoteCast(proposalId, msg.sender, support, block.timestamp);
    }

    /// Helper getters (optional)
    function getProposal(string calldata proposalId) external view returns (
        string memory, string memory, address, uint256, uint256, uint256, bool
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.proposalId, p.title, p.proposer, p.timestamp, p.votesFor, p.votesAgainst, p.exists);
    }
}
