#!/usr/bin/python3

import pytest
import brownie

def test_leave_voters(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})

    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[1]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})

    hydra.joinVoters({"from": accounts[0]})
    hydra.joinVoters({"from": accounts[1]})
    hydra.joinVoters({"from": accounts[2]})
    
    hydra.leaveVoters({"from": accounts[1]})

    assert token.balanceOf(hydra.address) == 2e3
    assert token.balanceOf(accounts[1].address) == 1e10
    assert hydra.isVoter(accounts[0].address) == True
    assert hydra.isVoter(accounts[1].address) == False
    assert hydra.isVoter(accounts[2].address) == True

def test_all_voters_leave(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    
    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[1]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})

    hydra.joinVoters({"from": accounts[0]})
    hydra.joinVoters({"from": accounts[1]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.leaveVoters({"from": accounts[0]})
    hydra.leaveVoters({"from": accounts[1]})
    hydra.leaveVoters({"from": accounts[2]})

    assert token.balanceOf(hydra.address) == 0
    assert token.balanceOf(accounts[0].address) == 1e21 - 2e10
    assert token.balanceOf(accounts[1].address) == 1e10
    assert token.balanceOf(accounts[2].address) == 1e10
    assert hydra.isVoter(accounts[0].address) == False
    assert hydra.isVoter(accounts[1].address) == False
    assert hydra.isVoter(accounts[2].address) == False

def test_fail_when_there_are_no_voters(hydra, accounts):    
    with brownie.reverts("Not a voter"):
        hydra.leaveVoters({"from": accounts[0]})

def test_fail_when_client_is_not_a_voter(hydra, token, accounts):    
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})

    token.approve(hydra.address, 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[1]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})

    hydra.joinVoters({"from": accounts[0]})
    hydra.joinVoters({"from": accounts[1]})
    hydra.joinVoters({"from": accounts[2]})

    with brownie.reverts("Not a voter"):
        hydra.leaveVoters({"from": accounts[3]})
