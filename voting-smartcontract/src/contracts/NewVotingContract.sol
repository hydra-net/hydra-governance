// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.7.0;
pragma experimental ABIEncoderV2;
import "./eVotingToken.sol";

contract NewVotingContract {
    struct Voter {
        address accountAddress;
        bool voterRegistered;
        uint numOfVotes;
    }

    struct Proposal {
        uint id;
        address proposalOwner;
        address[] votersInFavour;
        address[] votersInRejection;
        address[] voters;
        uint voteCount;
        uint countYes;
        uint countNo;
        string proposalName;
        string proposalDesc;
        uint proposalRequirement;
        bool proposalRegistered;
        bool accepted;
        uint stack;
    }

    struct ProposalStack {
        mapping(address => Proposal) proposalsMap;
        address[] proposals;
        mapping(address => Voter) votersMap;
        uint proposalCount;
        string openDate;
        string expirationDate;
        uint expiration;
        bool isActive;
        uint voteCounter;
        uint stackReward;
        uint number;
        uint winningStakeAvailable;
        mapping(address => Proposal) winningProposalsMap;
        address[] winningProposals;
    }

    struct Defaults {
        uint defaultProposalStake;
        uint defaultVoteStake;
        uint defaultAcceptanceRate;
        uint defaultWinningStake;
        uint defaultRequirementLimit;
    }

    mapping(uint => ProposalStack) proposalStackMapping;
    ProposalStack[] public proposalStackArray;
    uint public activeStack;
    mapping(address => Proposal) public proposals;
    mapping (address => uint96) internal balances;
    address[] public proposalAddress;
    uint public proposalCount = 0;
    address public owner;
    address public delegate;
    address private tokenAddress;
    eVotingToken token;
    address[] public acceptedProposal;
   
    uint public number = 0;
    
    Defaults def;
    event tokensDeposited (
        address depositer,
        uint tokenAmount
    );        

    event NewStack(uint activeStack);
    event CheckTokenBalance(address account, uint balance);
    event WinningStake(uint requirement, uint defaultR, uint total);
   
   
    constructor(address _tokenAddress) public {
        owner = msg.sender;
        delegate = msg.sender;
        tokenAddress = _tokenAddress;
        activeStack = 0;
        number = 10;
        def = Defaults({
            defaultProposalStake: 1000,
            defaultVoteStake: 500,
            defaultAcceptanceRate: 51,
            defaultWinningStake: 10000,
            defaultRequirementLimit: 1000
        });
    }

    function onlyDelegate (address _account) internal returns (bool) {
        return _account == delegate;
    }

    function setOwnerDelegate(address newOwner, address _account) public returns(bool) {
        require (onlyDelegate(_account), "You need to be a delegate to use this function");
        owner = newOwner;
        return true;
    }

    function setNumber(uint newNumber) public returns (bool, uint) {
        number = newNumber;
        return (true, 10);
    }
    // TODO: set variables values to requirementLimit, def.defaultVoteStake, defaultProposalStake while creating a new proposal stack and at winning proposals reward properly!
    function newProposalStack(
        string memory _openDate,
        string memory _expirationDate,
        uint _expiration,
        uint _stackReward,
        address _account
    ) public returns (uint) {
        require (onlyDelegate(_account), "You need to be a delegate to use this function");
        // Before create one ProposalStack we are closing each "active" stack.
        if (activeStack > 0) {
            for (uint i = 0; i < activeStack; i++) {
                if (proposalStackMapping[i].isActive == true) {
                    proposalStackMapping[i].isActive = false;
                }
            }
        }
        // Create instance of ProposalStack
        address [] memory emptyArray;
        ProposalStack memory ps = ProposalStack({
            isActive: true,
            openDate: _openDate,
            expirationDate: _expirationDate,
            expiration: _expiration,
            stackReward: _stackReward,
            voteCounter: 0,
            proposalCount: 0,
            winningStakeAvailable:  def.defaultRequirementLimit,
            number: activeStack,
            winningProposals: emptyArray,
            proposals: emptyArray
        });
        
        // Asign stack at the array
        proposalStackMapping[activeStack] = ps;
        emit NewStack(activeStack);
        // Set activeStack
       
        activeStack = activeStack + 1;
        return activeStack;
    }

    function getProposalsByStack (uint stackNumber) public returns(uint, uint, bool) {
        require(stackNumber <= activeStack, 'VOTING CONTRACT: getProposalByStack, There is any stack with this number');
        ProposalStack memory ps = proposalStackMapping[stackNumber];
        return (ps.proposalCount, ps.voteCounter, ps.isActive);
    }
   

    function senderHasVoted (address sender) internal view returns (bool) {
        bool voted = false;
        for(uint i = 0; i < proposalStackMapping[activeStack - 1].proposals.length; i++) {
            address currentProposalAddress = proposalStackMapping[activeStack - 1].proposals[i];
            Proposal memory currentProposal = proposalStackMapping[activeStack - 1].proposalsMap[currentProposalAddress];
            for (uint x = 0; x < currentProposal.voters.length; x++) {
                if (currentProposal.voters[x] == sender) {
                    voted = true;
                    // break voters for
                    x = currentProposal.voters.length;
                    //break proposals for
                    i = proposalStackMapping[activeStack - 1].proposals.length;
                }
            }
        }
        return voted;
    }

    struct ProposalsResultObject {
        address[] addresses;
        string[] names;
        string[] descriptions;
        uint[] requirements;
        uint[] favour;
        uint[] against;
    }

    function getProposalListByStack (uint _stackNumber) public returns (address[] memory, string[] memory, string[] memory, uint [] memory, uint [] memory, uint [] memory) {
        require(_stackNumber <= activeStack, 'VOTING CONTRACT: getProposalByStack, There is any stack with this number');

        ProposalsResultObject memory pro = ProposalsResultObject({
            addresses: new address[](proposalStackMapping[_stackNumber].proposalCount),
            names: new string[](proposalStackMapping[_stackNumber].proposalCount),
            descriptions: new string[](proposalStackMapping[_stackNumber].proposalCount),
            requirements: new uint[](proposalStackMapping[_stackNumber].proposalCount),
            favour: new uint[](proposalStackMapping[_stackNumber].proposalCount),
            against: new uint[](proposalStackMapping[_stackNumber].proposalCount)
        });

       /* address[] memory proposalsResult = new address[](proposalStackMapping[_stackNumber].proposalCount);
        string[] memory names = new string[](proposalStackMapping[_stackNumber].proposalCount);
        string[] memory descriptions = new string[](proposalStackMapping[_stackNumber].proposalCount);
        uint [] memory requirements = new uint[](proposalStackMapping[_stackNumber].proposalCount);
        uint [] memory favour = new uint[](proposalStackMapping[_stackNumber].proposalCount);
        uint [] memory against = new uint[](proposalStackMapping[_stackNumber].proposalCount);
*/
        for(uint i = 0; i < proposalStackMapping[_stackNumber].proposalCount; i++) {
            address currentAddress = proposalStackMapping[_stackNumber].proposals[i];
            Proposal memory current = proposalStackMapping[_stackNumber].proposalsMap[currentAddress];
            pro.addresses[i] = current.proposalOwner;
            //proposalsResult[i] = current.proposalOwner;
            pro.names[i] = current.proposalName;
            
            //names[i] = current.proposalName;
            
            pro.descriptions[i] = current.proposalName;
            //descriptions[i] = current.proposalDesc;
            pro.names[i] = current.proposalName;
            //requirements[i] = current.proposalRequirement;
            pro.requirements[i] = current.proposalRequirement;

            //favour[i] = current.countYes;
            pro.favour[i] = current.countYes;

            //against[i] = current.countNo;
            pro.against[i] = current.countNo;

        }
        //return (proposalsResult, names, descriptions, requirements, favour, against);
        return (pro.addresses, pro.names, pro.descriptions, pro.requirements, pro.favour, pro.against);

    }

    function registerProposal (
        uint _currentDate,
        string memory _description,
        uint _proposalRequirement,
        string memory _name,
        address _account
    ) public returns (uint) {
        token = eVotingToken(tokenAddress);
        //Check if there are proposalStacks
        require(activeStack > 0, "There are no stacks availble, wait till manager throws a new Stack of proposals");
        // Check availability of current activeStack
        require (proposalStackMapping[activeStack - 1].expiration > _currentDate, "Active proposal stack expiration date is reached, wait till we register a new proposal stack");
       
       // Check if sender has a proposal already sended to current activeStack.
        require (proposalStackMapping[activeStack - 1].proposalsMap[_account].proposalRegistered == false, "You already have one registered proposal");
       
        //Check if sender has available tokens
        uint balance = token.balanceFor(_account);
        emit CheckTokenBalance(_account, balance);
        require (token.balanceFor(_account) > def.defaultProposalStake, "You don't have enough eVotingTokens to make a proposal");
       
        //Check if _account has a vote (proposalOwners can't send proposals)
        // require(!senderHasVoted(_account), "Voters cannot send a proposal, wait till the next proposal stack");
       
        // Check proposalRequirement
        require(_proposalRequirement <=  def.defaultRequirementLimit, "Your requirement is over the default limit (1000 is the limit)");
       
        // Add sender address to  proposals
        proposalStackMapping[activeStack - 1].proposals.push(_account);
       
        //
        proposalCount++;
        // Create proposal
        address [] memory emptyArray;
        Proposal memory newProposal = Proposal({
            id: proposalCount,
            proposalName: _name,
            proposalOwner: _account,
            proposalDesc: _description,
            countNo: 0,
            countYes: 0,
            voteCount: 0,
            votersInFavour: emptyArray,
            votersInRejection: emptyArray,
            voters: emptyArray,
            proposalRequirement: _proposalRequirement,
            proposalRegistered: true,
            accepted: false,
            stack: activeStack - 1
        });

        // Add proposal into proposals at stack
        proposalStackMapping[activeStack - 1].proposalsMap[_account] = newProposal;
       
        // Set new value of proposalCount adding 1
        proposalStackMapping[activeStack - 1].proposalCount ++;
       
        // Stake token to the owner of smart contract
        token.transferFrom(_account, owner, def.defaultProposalStake);
       
        return proposalStackMapping[activeStack - 1].proposalCount;
    }
   
    function castVote(
        address proposalAddressToVote,
        bool support,
        uint _currentDate,
        address _account
    ) public returns (uint) {
        token = eVotingToken(tokenAddress);
        //Check if there are proposalStacks
        require(activeStack > 0, "There are no stacks availble, wait till manager throws a new Stack of proposals");
        // Check availability of current activeStack
        require (proposalStackMapping[activeStack - 1].expiration > _currentDate, "Active proposal stack expiration date is reached, wait till we register a new proposal stack");
        // Check if sender has a proposal (Proposal owners canot vote).
        require (proposalStackMapping[activeStack - 1].proposalsMap[_account].proposalRegistered == false, "Proposal owners cannot cast votes.");
         //Check if sender has available tokens to vote
        require (token.balanceFor(_account) > def.defaultVoteStake, "You don't have enough eVotingTokens to cast a vote");
        // Check if there is a proposal for the address user selected.
        //require(proposalStackMapping[activeStack - 1].proposalsMap[proposalAddressToVote].stack < activeStack - 1, "There is any proposal to the address yo want to cast your vote");
       
        // TODO: Check if voter has made a vote supporting this proposal. Don't know if a voter can cast multiple votes.
        address voter = _account;
        Proposal storage proposalSelected = proposalStackMapping[activeStack - 1].proposalsMap[proposalAddressToVote];
        proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].voters.push(msg.sender);
        if (support) {
            address [] storage votersInFavourCopy = proposalSelected.votersInFavour;
            votersInFavourCopy.push(voter);
            proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].votersInFavour.push(voter);
            proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].countYes++;
        } else {
            proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].votersInRejection.push(voter);
            proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].countNo++;
        }
       
        proposalStackMapping[activeStack - 1].proposalsMap[proposalSelected.proposalOwner].voteCount++;
        proposalStackMapping[activeStack - 1].voteCounter++;
       
        token.transferFrom(voter, owner, def.defaultVoteStake);
        return proposalSelected.voteCount;
    }
   
    function reviewWinningProposals (address _account) public returns (uint){
        // Check if activeStack is not 0
        // require (activeStack == 0, "There is not active stack, create one before review winning proposals");
        require (onlyDelegate(_account), "You need to be a delegate to use this function");
        // Check if there is activeStack
        require (proposalStackMapping[activeStack - 1].isActive == true, "There is not active stack to review winning proposals");

        // Inactive current proposalStack
        proposalStackMapping[activeStack - 1].isActive = false;
        //
        // TODO: sort winning proposals (better if they have more yesVotes).
        uint winningCounter = 0;
        for (uint i = 0; i < proposalStackMapping[activeStack - 1].proposals.length; i++) {
            address currentProposalAddress = proposalStackMapping[activeStack - 1].proposals[i];
            bool winning = reviewWinningProposal(proposalStackMapping[activeStack - 1].proposalsMap[currentProposalAddress]);
            if (winning) {
                winningCounter++;
            }
        }

        returnStakeToVoters();
       
        return winningCounter;
    }
   
    function reviewWinningProposal (Proposal memory p) internal returns (bool) {
        token = eVotingToken(tokenAddress);
        bool isWinning = ((p.countYes * 100) / p.voteCount ) >= def.defaultAcceptanceRate;
        // return proposal Stake (winner or not)
       
        // give proposalRequirement
        if (isWinning == true) {
            if (proposalStackMapping[activeStack - 1].winningStakeAvailable > p.proposalRequirement) {
                emit WinningStake(p.proposalRequirement, def.defaultProposalStake, p.proposalRequirement + def.defaultProposalStake);
                token.transfer(p.proposalOwner, p.proposalRequirement + def.defaultProposalStake);
                proposalStackMapping[activeStack - 1].winningStakeAvailable -= p.proposalRequirement;
                proposalStackMapping[activeStack - 1].winningProposals.push(p.proposalOwner);
                proposalStackMapping[activeStack - 1].winningProposalsMap[p.proposalOwner] = p;
            }
        } else {
            token.transfer(p.proposalOwner, def.defaultProposalStake);
        }
       

        return isWinning;
    }
   
    function returnStakeToVoters () internal {
        token = eVotingToken(tokenAddress);
        for(uint i = 0; i < proposalStackMapping[activeStack - 1].proposals.length; i++) {
            address currentProposalAddress = proposalStackMapping[activeStack - 1].proposals[i];
            Proposal memory currentProposal = proposalStackMapping[activeStack - 1].proposalsMap[currentProposalAddress];
            for (uint x = 0; x < currentProposal.voters.length; x++) {
                token.transfer(currentProposal.voters[x], def.defaultVoteStake);
            }
        }
    }
   
    function returnStakeToProposalOwners () internal {
        token = eVotingToken(tokenAddress);
        for(uint i = 0; i < proposalStackMapping[activeStack - 1].proposals.length; i++) {
            address currentProposalAddress = proposalStackMapping[activeStack - 1].proposals[i];
            Proposal memory currentProposal = proposalStackMapping[activeStack - 1].proposalsMap[currentProposalAddress];
            token.transfer(currentProposal.proposalOwner, def.defaultProposalStake);
        }
    }
} 
