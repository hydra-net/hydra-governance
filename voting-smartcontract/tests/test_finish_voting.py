#!/usr/bin/python3

import pytest
import brownie

def test_select_correct_winner(hydra, token, accounts):
    for i in range(1, 10):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 10):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})
        hydra.joinVoters({"from": accounts[i]})

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    # proposal 1; 4 - 5
    hydra.voteFavour(0, {"from": accounts[1]})
    hydra.voteFavour(0, {"from": accounts[2]})
    hydra.voteFavour(0, {"from": accounts[3]})
    hydra.voteFavour(0, {"from": accounts[4]})
    hydra.voteAgainst(0, {"from": accounts[5]})
    hydra.voteAgainst(0, {"from": accounts[6]})
    hydra.voteAgainst(0, {"from": accounts[7]})
    hydra.voteAgainst(0, {"from": accounts[8]})
    hydra.voteAgainst(0, {"from": accounts[9]})

    # proposal 2; 2 - 0
    hydra.voteFavour(1, {"from": accounts[0]})
    hydra.voteFavour(1, {"from": accounts[2]})

    # proposal 3; 5 - 4
    hydra.voteFavour(2, {"from": accounts[0]})
    hydra.voteFavour(2, {"from": accounts[1]})
    hydra.voteFavour(2, {"from": accounts[3]})
    hydra.voteFavour(2, {"from": accounts[4]})
    hydra.voteFavour(2, {"from": accounts[5]})
    hydra.voteAgainst(2, {"from": accounts[6]})
    hydra.voteAgainst(2, {"from": accounts[7]})
    hydra.voteAgainst(2, {"from": accounts[8]})
    hydra.voteAgainst(2, {"from": accounts[9]})

    hydra.finishVoting()

    assert token.balanceOf(accounts[0]) == int(1e21) - int(9e10) - int(2e3)
    assert token.balanceOf(accounts[1]) == 1e10 - 2e3 + 3e3
    assert token.balanceOf(accounts[2]) == 1e10 - 2e3
    assert token.balanceOf(accounts[3]) == 1e10 - 1e3
    assert token.balanceOf(accounts[4]) == 1e10 - 1e3
    assert token.balanceOf(accounts[5]) == 1e10 - 1e3
    assert token.balanceOf(accounts[6]) == 1e10 - 1e3
    assert token.balanceOf(accounts[7]) == 1e10 - 1e3
    assert token.balanceOf(accounts[8]) == 1e10 - 1e3
    assert token.balanceOf(accounts[9]) == 1e10 - 1e3

def test_cleans_proposals(hydra, token, accounts):
    for i in range(1, 3):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 3):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    hydra.finishVoting()

    assert hydra.getProposals() == [] 

def test_no_winner(hydra, token, accounts):
    for i in range(1, 10):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 10):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})
        hydra.joinVoters({"from": accounts[i]})

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    # proposal 1; 4 - 5
    hydra.voteFavour(0, {"from": accounts[1]})
    hydra.voteFavour(0, {"from": accounts[2]})
    hydra.voteFavour(0, {"from": accounts[3]})
    hydra.voteFavour(0, {"from": accounts[4]})
    hydra.voteAgainst(0, {"from": accounts[5]})
    hydra.voteAgainst(0, {"from": accounts[6]})
    hydra.voteAgainst(0, {"from": accounts[7]})
    hydra.voteAgainst(0, {"from": accounts[8]})
    hydra.voteAgainst(0, {"from": accounts[9]})

    # proposal 2; 2 - 2
    hydra.voteFavour(1, {"from": accounts[0]})
    hydra.voteFavour(1, {"from": accounts[2]})
    hydra.voteAgainst(1, {"from": accounts[3]})
    hydra.voteAgainst(1, {"from": accounts[4]})

    # proposal 3; 4 - 4
    hydra.voteFavour(2, {"from": accounts[0]})
    hydra.voteFavour(2, {"from": accounts[1]})
    hydra.voteFavour(2, {"from": accounts[3]})
    hydra.voteFavour(2, {"from": accounts[4]})
    hydra.voteAgainst(2, {"from": accounts[5]})
    hydra.voteAgainst(2, {"from": accounts[6]})
    hydra.voteAgainst(2, {"from": accounts[7]})
    hydra.voteAgainst(2, {"from": accounts[8]})

    hydra.finishVoting()

    assert token.balanceOf(accounts[0]) == int(1e21) - int(9e10) - int(2e3)
    assert token.balanceOf(accounts[1]) == 1e10 - 2e3
    assert token.balanceOf(accounts[2]) == 1e10 - 2e3
    assert token.balanceOf(accounts[3]) == 1e10 - 1e3
    assert token.balanceOf(accounts[4]) == 1e10 - 1e3
    assert token.balanceOf(accounts[5]) == 1e10 - 1e3
    assert token.balanceOf(accounts[6]) == 1e10 - 1e3
    assert token.balanceOf(accounts[7]) == 1e10 - 1e3
    assert token.balanceOf(accounts[8]) == 1e10 - 1e3
    assert token.balanceOf(accounts[9]) == 1e10 - 1e3

def test_clean_votes(hydra, token, accounts):
    for i in range(1, 10):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 10):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})
        hydra.joinVoters({"from": accounts[i]})

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    hydra.voteFavour(0, {"from": accounts[1]})
    hydra.voteFavour(0, {"from": accounts[2]})

    hydra.voteFavour(1, {"from": accounts[0]})
    hydra.voteFavour(1, {"from": accounts[2]})

    hydra.voteFavour(2, {"from": accounts[0]})
    hydra.voteFavour(2, {"from": accounts[1]})

    hydra.finishVoting()

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    expected = [
        (0, "name1", "description1", 2e3, 0, 0, True),
        (1, "name2", "description2", 3e3, 0, 0, True),
        (2, "name3", "description3", 4e3, 0, 0, True)
    ]



def test_fail_when_owner_is_not_the_caller(hydra, token, accounts):
    for i in range(1, 3):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 3):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})

    hydra.addProposal("name1", "description1", 2e3, {"from": accounts[0]})
    hydra.addProposal("name2", "description2", 3e3, {"from": accounts[1]})
    hydra.addProposal("name3", "description3", 4e3, {"from": accounts[2]})

    for i in range(1, 10):
        with brownie.reverts("Not owner"):
            hydra.finishVoting({"from": accounts[i]})

def test_keeps_voters(hydra, token, accounts):
    for i in range(1, 10):
        token.transfer(accounts[i], 1e10, {"from": accounts[0]})

    for i in range(0, 10):
        token.approve(hydra.address, 1e10, {"from": accounts[i]})
        hydra.joinVoters({"from": accounts[i]})

    hydra.finishVoting({"from": accounts[0]})

    for i in range(0, 10):
        assert hydra.isVoter(accounts[i]) == True
