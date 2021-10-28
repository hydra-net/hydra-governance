from brownie import HydraGovernance, accounts

def main():
    account = accounts.load('account1')
    tokenAddress = '0x59caEe485c2CB56AD5C6ff7F206776850C6F5e45'
    HydraGovernance.deploy(tokenAddress, {'from': account})