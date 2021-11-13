#!/usr/bin/python3

import pytest
import brownie

def test_vote_favour(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.voteFavour(1, {"from": accounts[2]})

    expected = [
        (0, 'name1', 'description1', 1e3, 0, 0, accounts[0].address, True),
        (1, 'name2', 'description2', 2e3, 1, 0, accounts[1].address, True),
    ]
    result = hydra.getProposals()

    assert result == expected

def test_fail_when_client_is_not_a_voter(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    with brownie.reverts("Not a voter"):
        hydra.voteFavour(1, {"from": accounts[2]})

def test_fail_when_client_already_voted_in_favour(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.voteFavour(1, {"from": accounts[2]})

    with brownie.reverts("You already voted on this proposal"):
        hydra.voteFavour(1, {"from": accounts[2]})

def test_fail_when_client_already_voted_against(hydra, token, accounts):
    token.transfer(accounts[1], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    token.approve(hydra.address, 1e3, {"from": accounts[1]})

    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 2e3, {"from": accounts[1]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    hydra.voteAgainst(1, {"from": accounts[2]})

    with brownie.reverts("You already voted on this proposal"):
        hydra.voteFavour(1, {"from": accounts[2]})

def test_fail_when_proposal_does_not_exists(hydra, token, accounts):
    token.approve(hydra.address, 1e3, {"from": accounts[0]})
    hydra.addProposal("name1", "description1", 1e3, {"from": accounts[0]})

    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    with brownie.reverts("Proposal not found"):
        hydra.voteFavour(1, {"from": accounts[2]})

def test_fail_when_there_are_no_proposals(hydra, token, accounts):
    token.transfer(accounts[2], 1e10, {"from": accounts[0]})
    token.approve(hydra.address, 1e10, {"from": accounts[2]})
    hydra.joinVoters({"from": accounts[2]})

    with brownie.reverts("Proposal not found"):
        hydra.voteFavour(0, {"from": accounts[2]})
