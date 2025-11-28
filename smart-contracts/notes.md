We are problem. The UI and all other SDS functions are working perfectly. but remenber that we have a DAO contract we deployed at the beginning of this journey. i will paste the smart contract here anad the deployeed contract address on chain so you task is as follows
1. We shall be working with two pages for this task namely the app/propose.tsx and app/vote.tsx pages. These pages shall be updated to allow the following flow when creating a proposal and when casting a vote. the form UI should remain thesame but the flow is to be altered to all the following.
firstly after the form is filled and the button to create ptoposal or vote is clicked. It should first interact with our deployed smart contract to create a proposal or cast a vote. It is after the successful transaction with the smart contract that the sds function can now be allowed to execute. we are already using viem, so use viem for the smart contract interaction if you are confortable othervise use ether v6. 
Note: Any new library to be installed should be mentioned with how to install it easily. Provide a clear and smoth detailed guide for the smooth upgrade of these two pages. 
if you are to wriite helper functions, do it but make the implementation clear in the guide. 

Note: Smart contract transactions first before the SDS.
DAO smart contract deploye to somnia  with address 0xd760d4cB1Ca9dFeF8180B105E4A02420F8018BED

solidity contract code is below
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


If you are in need of any addditional information, let me know.