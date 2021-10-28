from brownie import Token, accounts

def main():
    account = accounts.load('account1')
    Token.deploy("Stakenet Token", "XSN", 18, 1e28, {'from': account})