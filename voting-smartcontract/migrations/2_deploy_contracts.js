var NewVotingContract = artifacts.require("NewVotingContract")
var eVotingToken = artifacts.require("eVotingToken")

module.exports = async function(deployer) {
    // Check if we have already deployed eVotingToken
    const eVoteAddress = '0x4ED2EA698bB9A74c01EE3EC19F4bE85350ED9856';
    // Deploy eVotingContract
    if (eVoteAddress) {
        await deployer.deploy(NewVotingContract, eVoteAddress)
        await NewVotingContract.deployed();
    } else {
        await deployer.deploy(eVotingToken)
        // Fetch the address of deployed eVotingContract
        const eVote = await eVotingToken.deployed()
        console.log({ address: eVote.address });
        // Deploy votingContract
        await deployer.deploy(NewVotingContract, eVote.address)
        await NewVotingContract.deployed();
    }

};