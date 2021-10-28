// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import '../interfaces/ERC20.sol';

contract HydraGovernance {
    
    IERC20 immutable internal XSN_TOKEN;
    uint constant internal VOTERS_REQUIRED_LOCK_AMOUNT = 1000;
    uint constant internal PROPOSAL_COST = 1000;
    uint constant internal MAX_BUDGET = 200000;
    address immutable internal OWNER;

    struct Proposal {
        uint id;
        string name;
        string description;
        uint budget;
        uint favourCount;
        uint againstCount;
        address proposer;
        bool exists;
    }

    Proposal[] proposals;
    
    address[] voters;
    mapping(address => uint) votersIndexes;
    
    mapping(address => mapping(uint => bool)) votes;

    modifier voterOnly {
        require(isVoter(msg.sender), "Not a voter");

        _;
    }

    modifier ownerOnly {
        require(msg.sender == OWNER, "Not owner");

        _;
    }

    constructor(address token_address) {
        XSN_TOKEN = IERC20(token_address);
        OWNER = msg.sender;
    }
    
    function isVoter(address voter) public view returns(bool) {
        if(voters.length == 0) return false;
        
        uint voterIndex = votersIndexes[voter];
        
        // mappings have a default value of zero so we need to verify if that
        // voter is actually at index zero or it does not exist and we got the
        // default value
        if(voterIndex == 0) {
            return voter == voters[voterIndex];
        }
        
        return true;
    }
    
    function isValidProposal(uint id) internal view returns(bool) {
        if(id >= proposals.length) return false;
        
        return proposals[id].exists;
    }
    
    function registerVoteFor(address voter, uint proposalId) internal {
        votes[voter][proposalId] = true;
    }
    
    function hasVotedFor(address voter, uint proposalId) public view returns(bool) {
        return votes[voter][proposalId];
    }

    function getVotersRequiredLockAmount() public pure returns(uint) {
        return VOTERS_REQUIRED_LOCK_AMOUNT;
    }

    function getProposalCost() public pure returns(uint) {
        return PROPOSAL_COST;
    }

    function getOwner() public view returns(address) {
        return OWNER;
    }
    
    function addProposal(string memory name, string memory description, uint budget) public {
        require(budget <= MAX_BUDGET, "max budget exceeded");

        XSN_TOKEN.transferFrom(msg.sender, address(this), PROPOSAL_COST);      

        proposals.push(Proposal(proposals.length, name, description, budget, 0, 0, msg.sender, true));
    }
    
    function getProposals() public view returns(Proposal[] memory) {
        return proposals;
    }
    
    function joinVoters() public {
        require(!isVoter(msg.sender), "Already a voter");
        
        XSN_TOKEN.transferFrom(msg.sender, address(this), VOTERS_REQUIRED_LOCK_AMOUNT);
        
        votersIndexes[msg.sender] = voters.length;
        voters.push(msg.sender);
    }
    
    function leaveVoters() public voterOnly {        
        XSN_TOKEN.transfer(msg.sender, VOTERS_REQUIRED_LOCK_AMOUNT);
        
        uint voterIndex = votersIndexes[msg.sender];
        delete voters[voterIndex];
        delete votersIndexes[msg.sender];
    }
    
    function voteFavour(uint proposalId) public voterOnly {
        require(isValidProposal(proposalId), "Proposal not found");
        require(msg.sender != proposals[proposalId].proposer, "you can't vote for yourself");
        require(!hasVotedFor(msg.sender, proposalId), "You already voted on this proposal");
        
        registerVoteFor(msg.sender, proposalId);
        
        proposals[proposalId].favourCount++;
    }
    
    function voteAgainst(uint proposalId) public voterOnly {  
        require(isValidProposal(proposalId), "Proposal not found");
        require(msg.sender != proposals[proposalId].proposer, "you can't vote for yourself");
        require(!hasVotedFor(msg.sender, proposalId), "You already voted on this proposal");
        
        registerVoteFor(msg.sender, proposalId);
        
        proposals[proposalId].againstCount++;
    }
    
    function finishVoting() public ownerOnly {
        uint bestScore = 0;
        Proposal memory winner;

        for(uint i = 0; i < proposals.length; i++) {
            if(proposals[i].favourCount > proposals[i].againstCount) {
                uint score = proposals[i].favourCount - proposals[i].againstCount;

                if(score > bestScore) {
                    bestScore = score;
                    winner = proposals[i];
                }
            }
        }

        if(winner.exists) {
            XSN_TOKEN.transfer(winner.proposer, winner.budget);    
        }

        for(uint i = 0; i < voters.length; i++) {
            for(uint k = 0; k < proposals.length; k++) {
                delete votes[voters[i]][k];
            }
        }

        delete proposals;
    }
}
