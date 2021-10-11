var NewVotingContract = artifacts.require("NewVotingContract")
var eVotingToken = artifacts.require("eVotingToken")

module.exports = async function(deployer) {
// Deploy eVotingContract
await deployer.deploy(eVotingToken)
// Fetch the address of deployed eVotingContract
const eVote = await eVotingToken.deployed()
console.log({ address: eVote.address });
// Deploy votingContract
await deployer.deploy(NewVotingContract, eVote.address)
await NewVotingContract.deployed();
};