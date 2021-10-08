import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import moment from 'moment';
import './App.css';
import {
  FlexContainer,
} from './styles/index';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { Button, Container, Typography, Modal, Box, TextField,Snackbar, Accordion, AccordionSummary, AccordionDetails, TextareaAutosize } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
const MyContract = require('./abis/NewVotingContract.json');
const  eVotingTokenContract = require('./abis/eVotingToken.json');
const Web3 = require('web3');


function App() {
  const [currentStack, setCurrentStack] = useState(-1);
  const [stackInfo, setStackInfo] = useState([0, 0, false]);
  const [isOwner, setIsOwner] = useState(false);
  const [proposalList, setProposalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [reload, setReload] = useState(0);
  const [snackbarStatus, setSnackbarStatus] = useState({
    open: false,
    error: false,
    message: '',
  });

  // MODAL STATE
  const [openNewStack, setOpenNewStack] = useState(false);
  const [proposalStackInfo, setProposalStackInfo] = useState({
    openDate: moment().format('DD/MM/YYYY'),
    expirationDate: moment().format('DD/MM/YYYY'),
    expiration: 0,
    stackRewardLimit: 0,
  });

  const [openNewProposal, setOpenNewProposal] = useState(false);
  const [newProposalInfo, setNewProposalInfo] = useState({
    name: '',
    description: '',
    proposalRequirement: 0
  });

  const [openDelegateModal, setOpenDelegateModal] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  //SMART CONTRACT ADDRESS
  const eVotingTokenAddress = '0x4ED2EA698bB9A74c01EE3EC19F4bE85350ED9856';
  const scAddress = '0x4Ce051edB436FF64dBa811472d337269366EE405';

  // const host = 'http://localhost:8545'; //it can change to infura.
  const host = 'https://ropsten.infura.io/v3/93594fc6a4c94dff8e22b0044ad59db1';
  const mnemonic = 'urge impact curious master elder vivid venue nominee domain truck embrace dad';
  // const mnemonic = '856a957b23af2ee5cebaa5af59626fec8c47be6e66344cb9ae037292e9edc94a';
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const balance = await getAccountBalance();
      setTokenBalance(balance);
      const currentStackResult = await getCurrentStack();
      setCurrentStack(parseInt(currentStackResult));
      const balance2 = await getAccountBalance();
      setTokenBalance(balance);
      const isOwnerResult = await isSmartContractOwner();
      setIsOwner(isOwnerResult);
      await getStackInfo();
      await getProposalData(parseInt(currentStackResult));
      setLoading(false);
    }
    fetchData();
  }, [reload]);

  const isSmartContractOwner = () => {
    return new Promise(async(resolve, reject) => {
      try {
        const { contract } = await initVotingContract();
        const { account } = await getCurrentAccount();
        const owner = await contract.methods.owner().call();
        console.log(owner);
        if (account === owner) resolve(true);
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  };

  const getStackInfo =() => {
    return new Promise(async(resolve, reject) => {
      try {
        const { contract } = await initVotingContract();
        const currentStackResult = await getCurrentStack();
        const currentNumber = parseInt(currentStackResult);
        console.log({currentNumber});
        if (currentNumber === 0) resolve([]);
        const data = await contract.methods.getProposalListByStack(currentNumber - 1).call();
        console.log({ resultStackInfo: data});
        const length = data[0].length;
        const items = [];
        for (let i = 0; i < length; i++) {
          const item = {
            address: data[0][i],
            name: data[1][i],
            description: data[2][i],
            requirement: data[3][i],
            favour: data[4][i],
            against: data[5][i],
          };
          items.push(item);
        }
        console.log(items);
        setProposalList(items);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  };

  const parseError = (err, module) => {
    setLoading(false);
    setSnackbarStatus({
      message: `Error: ${err}`,
      error: true,
      open: true,
    });
  };

  const initTokenContract = async () => {
    // const provider = new HDWalletProvider(
    //   mnemonic,
    //   host
    // );

    const provider = new Web3.providers.HttpProvider(host);

    const web3 = new Web3(provider);
    const eToken = await new web3.eth.Contract(eVotingTokenContract.abi, eVotingTokenAddress);
    return {contract: eToken, gasLimit: web3.utils.toWei('2')};
  };

  const initVotingContract = async () => {
    
    // const web3 = new Web3(host);
    // web3EthCont.setProvider(host);
    // const provider = new HDWalletProvider(
    //   mnemonic,
    //   host
    // );
    const provider = new Web3.providers.HttpProvider(host);

    // await window.ethereum.enable();
    const web3 = new Web3(provider);
    // const contract =  new web3EthCont(MyContract.abi, scAddress);
    const contract = new web3.eth.Contract(MyContract.abi, scAddress);
    return {contract, gasLimit: web3.utils.toWei('2'), address: scAddress};
  };

  const getCurrentAccount = async () => {
    let web3;
    if (typeof window.ethereum !== 'undefined') {
      web3 = new Web3(window.ethereum);
    }
    let access;
    try {
      // Request account access
      await window.ethereum.enable();
      access = true;
    } catch(e) {
      // User denied access
      access = false;
    }
    const accounts = await web3.eth.getAccounts();
    return { account: accounts[0], web3};
  };

  const getProposalData = async (_stackNumber) => {
    return new Promise(async(resolve, reject) => {
      const txContract = await initVotingContract();
      const { contract, gasLimit } = txContract;
      if (_stackNumber == 0) resolve([]);
      try {
        const data = await contract.methods.getProposalsByStack(parseInt(_stackNumber) - 1).call();
        console.log({ stackData: data});
        setStackInfo(data);
        resolve(data);
      } catch (err) {
        reject({err});
      }
    });
  };

  const castVote = async(addressToVote, support) => {
    return new Promise(async(resolve, reject) => {
      try {
        const txContract = await initVotingContract();
        const { contract, gasLimit } = txContract;
        const accountData = await getCurrentAccount();
        console.log({ accountData });
        const { account, web3 } = accountData;
        
        const resultProposal = await contract.methods.castVote(addressToVote, support, 0).send({
          from: account,
        });
        console.log({ resultProposal });
       
        setReload(reload + 1);
        resolve(resultProposal);
      } catch (err) {
        parseError('Error casting vote ', 'CASTING VOTE');
        reject({ message: 'Error casting vote ' + err, err });
      }
    });
  };

  const getCurrentStack = async() => {
    return new Promise(async(resolve, reject) => {
      const txContract = await initVotingContract();
      const { contract, gasLimit } = txContract;
      const accountData = await getCurrentAccount();
      const { account } = accountData;
      try {
        const data = await contract.methods.activeStack().call();
        resolve(data);
      }catch (err) {
        reject({err});
      }
    });
  };

  const getAccountBalance = async () => {
    return new Promise(async(resolve, reject) => {
      try {
        const txContract = await initTokenContract();
        const { contract, gasLimit } = txContract;
        const accountData = await getCurrentAccount();
        const { account } = accountData;
        contract.methods.balanceFor(account).call()
        .then(data => {
          resolve(data);
        })
        .catch(err => {
         reject({err});
        });
      } catch (err) {
        reject({err});
      }
    });
  };

  const createProposalStack = async () => {
    return new Promise (async (resolve, reject) => {
      try {
        const txContract = await initVotingContract();
        const { contract, gasLimit } = txContract;
        const owner = await contract.methods.owner().call();
        setLoading(true);
        const resultProposalStack = await contract.methods.newProposalStack(
          moment(proposalStackInfo.openDate).format('YYYY/MM/DD'),
          moment(proposalStackInfo.expirationDate).format('YYYY/MM/DD'),
          moment(proposalStackInfo.expirationDate).toDate().getTime(),
          proposalStackInfo.stackRewardLimit,
        ).send({
          from: owner,
        });
        console.log({ resultProposalStack });
        setReload(reload + 1);
        resolve(resultProposalStack);
      } catch (err) {
        parseError('Error creating proposal stack ', 'CREATE PROPOSAL STACK');
        reject({ message: 'Error creating proposalStack ' + err, err });
      }
    });
  };

  const createProposal = async (activeStack) => {
    return new Promise (async (resolve, reject) => {
      try {
        const txContract = await initVotingContract();
        const { contract, gasLimit, address } = txContract;
        const accountData = await getCurrentAccount();
        const { account, web3 } = accountData;
        const currentDate = new Date().getTime();
        setLoading(true);
        const resultProposal = await contract.methods.registerProposal(
          1, newProposalInfo.description, newProposalInfo.proposalRequirement, newProposalInfo.name,
        ).send({
          from: account,
        });
        setReload(reload + 1);
        resolve(resultProposal);
      } catch (err) {
        parseError('Error creating proposalStack ', 'CREATE PROPOSAL');
        reject({ message: 'Error creating proposalStack ' + err, err });
      }
    });
  };

  const calculateWinners = async() => {
    return new Promise(async(resolve, reject) => {
      try {
        setLoading(true);
        const { contract } = await initVotingContract();
        const accountData = await getCurrentAccount();
        const { account, web3 } = accountData;
        const resultWinners = await contract.methods.reviewWinningProposals().send({from: account});
        console.log({resultWinners});
        setReload(reload + 1);
        resolve(resultWinners);
      } catch (err) {
        parseError('Error calculating winners ', 'CALCULATE WINNERS');
        reject({ message: 'Error calculating winners ' + err, err });
      }
    });
  };

  const delegateOwner = async() => {
    return new Promise(async(resolve, reject) => {
      try {
        setLoading(true);
        const { contract } = await initVotingContract();
        const accountData = await getCurrentAccount();
        const { account, web3 } = accountData;
        const resultDelegate = await contract.methods.setOwnerDelegate(newOwnerAddress).send({from: account});
        console.log({resultDelegate});
        setReload(reload + 1);
        resolve(resultDelegate);
      } catch (err) {
        parseError('Error delegating owner', 'DELEGATE OWNER');
        reject({ message: 'Error delegating owner ' + err, err });
      }
    });
  };

  const stackInfoDiv = (
    <div className="row">
      <div style={{border: 'dotted 2px #fff', margin: '10px 0'}}>
        <Typography variant="h2" mt={2}>
          Proposal List - Stack: #{currentStack}
        </Typography>
        <div style={{ 
          marginTop: 20,
          marginBottom: 30,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-evenly',
        }}>
          <Typography variant="h6">Proposals: {stackInfo[0]}</Typography>
          <Typography variant="h6">Votes: {stackInfo[1]}</Typography>
          <Typography variant="h6">{stackInfo[2] ? 'Active' : 'Inactive'}</Typography>
        </div>
      </div>
      
      <div className="col-sm-2">
        Proposal List
        { proposalList && proposalList.length > 0 && (
          <div style={{ 
            marginTop: 20,
            width: '80%',
            padding: '0 10%'
          }}>
            { proposalList.map((proposal, index) => (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel2a-content"
                  id="panel2a-header"
                >
                  <Typography>Name: {proposal.name} -  Token required {proposal.requirement} EVT</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    Description: {proposal.description}
                  </Typography>
                  <Typography>
                    Requirement: {proposal.requirement}
                  </Typography>
                  <Typography>
                    Favour: {proposal.favour}
                  </Typography>
                  <Typography>
                    Against: {proposal.against}
                  </Typography>
                  <Typography>
                    Address: {proposal.address}
                  </Typography>
                  { !isOwner && stackInfo[2] &&
                    <div style={{ 
                      marginTop: 20,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-evenly',
                    }}>
                      <Button variant="contained" onClick={() => { castVote(proposal.address, true)}}>Vote in favour</Button>
                      <Button variant="contained" onClick={() => { castVote(proposal.address, false)}}>Vote against</Button>
                    </div>
                  }
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  const ModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    padding: '20px',
  };
  const newStackModal = (
    <Modal
      open={openNewStack}
      onClose={() => setOpenNewStack(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={ModalStyle}>
        <div style={{ 
          marginTop: 20,
          width: '100%',
        }}>
          <Typography variant="h4">NEW VOTING STACK</Typography>
          <Typography variant="h5">Open date</Typography>
          <TextField
            id={'openDateF'}
            value={proposalStackInfo.openDate}
            type={'date'}
            onChange={(e) => {
              setProposalStackInfo({
                ...proposalStackInfo,
                openDate: e.target.value,
              });
            }}
          />
          <Typography variant="h5">Expiration date</Typography>
          <TextField
            id="expirationDateF"
            value={proposalStackInfo.expirationDate}
            onChange={(e) => {
              console.log(' e.target.value ',  e.target.value)
              setProposalStackInfo({
                ...proposalStackInfo,
                expirationDate: e.target.value,
              });
            }}
            type={'date'}
          />
          <Typography variant="h5">Stack reward limit</Typography>
          <TextField
            value={proposalStackInfo.stackRewardLimit}
            onChange={(e) => {
              setProposalStackInfo({
                ...proposalStackInfo,
                stackRewardLimit: e.target.value,
              });
            }}
            type="number"
          />
        </div>
        <div style={{ 
            marginTop: 20,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
          }}>
            <Button variant="oulined" onClick={() => {
              setProposalStackInfo({openDate: '', expirationDate: '', expiration: 0, stackRewardLimit: 0});
              setOpenNewStack(false);
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                createProposalStack();
                setOpenNewStack(false);
              }}
            >
              Create stack
            </Button>
          </div>
      </Box>
    </Modal>
  );

  const delegateModal = (
    <Modal
      open={openDelegateModal}
      onClose={() => setOpenNewStack(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={ModalStyle}>
        <div style={{ 
          marginTop: 20,
          width: '100%',
        }}>
          <Typography variant="h4">DELEGATE OWNER PRIVILEGES</Typography>
          <Typography variant="h5">New owner/admin</Typography>
          <TextField
            value={newOwnerAddress}
            type={'text'}
            onChange={(e) => {
              setNewOwnerAddress(e.target.value);
            }}
          />
        <div style={{ 
            marginTop: 20,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
          }}>
            <Button variant="oulined" onClick={() => {
              setNewOwnerAddress('');
              setOpenDelegateModal(false);
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async() => {
                setLoading(true);
                await delegateOwner();
                setOpenDelegateModal(false);
              }}
            >
              Delegate
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );

  const newProposalModal = (
    <Modal
      open={openNewProposal}
      onClose={() => setOpenNewProposal(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    > 
      <Box sx={ModalStyle}>
        <div style={{ 
          marginTop: 20,
          width: '100%',
        }}>
          <Typography variant="h4">CAST A PROPOSAL</Typography>
          <Typography variant="h6">Name</Typography>
          <TextField
          width={'100%'}
            value={newProposalInfo.name}
            onChange={(e) => {
              setNewProposalInfo({
                ...newProposalInfo,
                name: e.target.value,
              });
            }}
          />
          <Typography variant="h6">Description</Typography>
          <TextareaAutosize
            value={newProposalInfo.description}
            onChange={(e) => {
              setNewProposalInfo({
                ...newProposalInfo,
                description: e.target.value,
              });
            }}
          />
          <Typography variant="h6">Token Requirement</Typography>
          <TextField
            value={newProposalInfo.proposalRequirement}
            onChange={(e) => {
              setNewProposalInfo({
                ...newProposalInfo,
                proposalRequirement: e.target.value,
              });
            }}
            type="number"
          />
          <div style={{ 
            marginTop: 20,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-evenly',
          }}>
            <Button variant="outlined" onClick={() => {
              setNewProposalInfo({name: '', description: '', proposalRequirement: 0});
              setOpenNewProposal(false);
            }}>
              Cancel
            </Button>
            <Button
            variant="contained"
              onClick={() => {
                createProposal(currentStack);
                setOpenNewProposal(false);
              }}
            >
              Submit proposal
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );

  return (
    <div className="App">
      <header className="App-header">
        <Container> 
        {loading &&
          <div>
            <img src={logo} className="App-logo" alt="logo" />
            <div>Loading decentralized info/transaction</div>
          </div>
        }
        { !loading && (
          <React.Fragment>
            {stackInfoDiv}
            {!isOwner && (
              <div>
                Token balance: {tokenBalance} eVotingToken
              </div>
            )}
            { isOwner && (
              <div style={{ 
                marginTop: 20,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-evenly',
              }}>
                <Button variant="contained" onClick={() => { setOpenNewStack(true)}}>New Stack</Button>
                {stackInfo[2] &&
                  <Button variant="contained" onClick={async() => { await calculateWinners() }}>Calculate winning proposals</Button>
                }
                <Button variant="contained" onClick={() => { setOpenDelegateModal(true)}}>Delegate Admin</Button>
              </div>
            )}
            { !isOwner && stackInfo[2] && (
              <div style={{ 
                marginTop: 20,
                width: '100%',
              }}>
                <Button variant="contained" onClick={() => setOpenNewProposal(true)}>Propose</Button>
              </div>
            )}
          </React.Fragment>
        )}
        </Container>
        {newStackModal}
        {newProposalModal}
        {delegateModal}
        <Snackbar
          open={snackbarStatus.open}
          autoHideDuration={3000}
          onClose={() => setSnackbarStatus({
            ...snackbarStatus,
            open: false
          })}
          message={snackbarStatus.message}
          action={'Error'}
        />
        <Snackbar
          open={snackbarStatus.open}
          autoHideDuration={3000}
          onClose={() => setSnackbarStatus({
            ...snackbarStatus,
            open: false
          })}
          severity={snackbarStatus.error ? 'error' : 'success'}
          message={snackbarStatus.message}
        />
      </header>
    </div>
  );
}

export default App;
