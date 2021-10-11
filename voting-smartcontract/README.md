# Hydra Voting Smart Contract
Voting Smart Contract using Truffle and Solidity.

**Load dependencies**
`  npm install`

**Deployment on Ropsten**
`truffle migrate --reset --network ropsten`
 You will need to copy the contract address to change it at frontend app (voting-webapp). So on the output of this command copy `contract address: '.....'`
 
This generates a compiled documentation of the smart contract you can find at `abis`folder.
Copy the content of `voting-smartcontract/src/abis/newVotingContract.json` and paste it on `voting-webapp/src/abis/newVotingContract.json` in order to have your contract documentation available to the frontend app.

More info mail to: rafael@wiringbits.net