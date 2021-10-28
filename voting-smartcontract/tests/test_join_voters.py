#!/usr/bin/python3

import pytest
import brownie

def test_join_voters(hydra, token, accounts):
    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    hydra.joinVoters({"from": accounts[0]})

    assert token.balanceOf(hydra.address) == 1e3
    assert hydra.isVoter(accounts[0].address) == True

def test_multiple_join_voters(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})

    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[1]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    
    hydra.joinVoters({"from": accounts[0]})
    hydra.joinVoters({"from": accounts[1]})
    hydra.joinVoters({"from": accounts[2]})

    assert token.balanceOf(hydra.address) == 3e3
    assert hydra.isVoter(accounts[0].address) == True
    assert hydra.isVoter(accounts[1].address) == True
    assert hydra.isVoter(accounts[2].address) == True

def test_fail_when_client_does_not_lock_funds(hydra, token, accounts):    
    with brownie.reverts("Insufficient allowance"):
        hydra.joinVoters({"from": accounts[0]})

def test_fail_when_client_is_already_a_voter(hydra, token, accounts):
    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    hydra.joinVoters({"from": accounts[0]})

    with brownie.reverts("Already a voter"):
        hydra.joinVoters({"from": accounts[0]})
