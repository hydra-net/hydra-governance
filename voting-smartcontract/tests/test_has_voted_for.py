#!/usr/bin/python3

import pytest
import brownie

def test_return_true_when_client_has_voted_for_the_proposal(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.voteFavour(1, {"from": accounts[2]})

    assert hydra.hasVotedFor(accounts[2].address, 1)

def test_return_false_when_client_has_not_voted_for_the_proposal(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.voteFavour(1, {"from": accounts[2]})

    assert not hydra.hasVotedFor(accounts[2].address, 2)
