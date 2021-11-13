#!/usr/bin/python3

import pytest
import brownie

def test_add_proposal(hydra, token, accounts):
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    hydra.addProposal("name", "description", 1e3, {"from": accounts[0]})

    expected = [(0, 'name', 'description', 1e3, 0, 0, accounts[0].address, True)]
    result = hydra.getProposals()

    assert result == expected
    assert token.balanceOf(hydra.address) == 1e3

def test_add_multiple_proposals(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})

    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})
    token.approve(hydra.address, 1e3, {"from": accounts[2]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 3e3, {"from": accounts[2]})

    expected = [
        (0, 'name1', 'description1', 1e3, 0, 0, accounts[0].address, True),
        (1, 'name2', 'description2', 2e3, 0, 0, accounts[1].address, True),
        (2, 'name3', 'description3', 3e3, 0, 0, accounts[2].address, True)
    ]
    result = hydra.getProposals()

    assert result == expected
    assert token.balanceOf(hydra.address) == 3e3

def test_allow_multiple_proposals_from_same_owner(hydra, token, accounts):
    token.approve(hydra.address, 3e3, {"from": accounts[0]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[0]})
    hydra.addProposal("name3", "description3", 3e3, {"from": accounts[0]})

    expected = [
        (0, 'name1', 'description1', 1e3, 0, 0, accounts[0].address, True),
        (1, 'name2', 'description2', 2e3, 0, 0, accounts[0].address, True),
        (2, 'name3', 'description3', 3e3, 0, 0, accounts[0].address, True)
    ]
    result = hydra.getProposals()

    assert result == expected
    assert token.balanceOf(hydra.address) == 3e3

def test_fail_when_max_budget_is_exceeded(hydra, token, accounts):
    token.approve(hydra.address, 1e3, {"from": accounts[0]})

    with brownie.reverts("max budget exceeded"):
        hydra.addProposal("name", "description", 200001, {"from": accounts[0]})

def test_fail_when_fee_is_not_paid(hydra, token, accounts):
    with brownie.reverts("Insufficient allowance"):
        hydra.addProposal("name", "description", 1e3, {"from": accounts[0]})        
