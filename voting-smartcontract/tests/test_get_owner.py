#!/usr/bin/python3

import pytest
import brownie

def test_get_owner(hydra, token, accounts):
    result = hydra.getOwner()

    assert result == accounts[0].address
