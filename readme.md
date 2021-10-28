# Hydra voting App

## Requirements

You will need a [Metamask Wallet](https://metamask.io/) with some funds on the Ropsten network, if you need funds you can use one of the following faucets to get some [faucet1](https://faucet.dimensions.network/) [faucet2](https://faucet.ropsten.be/)

You will also need to add the XSN token to metamask, for this go to metamask -> assets -> import tokens and add the following token:
```
Token Contract Address: 0x59caEe485c2CB56AD5C6ff7F206776850C6F5e45
Token Symbol: XSN
Token Decimal: 18
```
Then contact support to get some tokens.

The app will ask you to sign in, you can ask support for a login you can use.

## How to use

Go to the [App](https://dex.hydrachain.net/#/voting), sign in and connect your metamask wallet.

### Add proposals

You use the `Create Proposal` button on the the page to add a proposal other users can vote on, creating a proposal has the following requirements:
  - Title: The name of your proposal
  - Description: A short description of what you are trying to achive with your proposal, how you intend to achieve it and how it will benefit the stakenet community
  - Budget: The amount of XSN you will receive to achive the proposal in case it is approved, this can be a maximum of 200,000 XSN wei
  - fee: submitting a proposal will cost you 1,000 XSN wei.

### Voting

Below you will see a list of proposals you can vote for(either on favour or against), to vote click on one of the proposals in the list to see more details and cast your vote on it.

But before you can vote on any proposal you need to lock 1,000 XSN wei, to do this click on the `Join Voter` button, this will send 1,000 XSN wei from your account to the voting smart contract and give you permission to vote on any number of proposals. You can later unlock your funds by clicking on the `Leave Voter` button, this will send 1,000 XSN wei from the voting contract to your account and you will no longer be able to cast any votes until you lock 1,000 XSN wei again.

### Winning proposal

Admins can close the current voting period which will clean the proposals list, award the winning proposal the requested budget and start a new voting period.

The winning proposal will be the one with the highest (votes in favour - votes against) as long as it has more votes in favour than against, in case that no proposal meets this requirement no proposal will be awarded.

