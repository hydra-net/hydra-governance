// require('babel-register');
// require('babel-polyfill');

// const HDWalletProvider = require("truffle-hdwallet-provider");
const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config()  // Store environment-specific variable from '.env' to process.env
const MNENOMIC = 'urge impact curious master elder vivid venue nominee domain truck embrace dad';
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    //  // testnets
    // // properties
    // // network_id: identifier for network based on ethereum blockchain. Find out more at https://github.com/ethereumbook/ethereumbook/issues/110
    // // gas: gas limit
    // // gasPrice: gas price in gwei
    // ropsten: {
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://ropsten.infura.io/v3/93594fc6a4c94dff8e22b0044ad59db1"),
    //   network_id: 3,
    //   gas: 3000000,
    //   gasPrice: 10000000000
    // },
    // kovan: {
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY),
    //   network_id: 42,
    //   gas: 3000000,
    //   gasPrice: 10000000000
    // },
    // rinkeby: {
    //   provider: () => new HDWalletProvider(MNENOMIC, 'https://rinkeby.infura.io/v3/93594fc6a4c94dff8e22b0044ad59db1'),
    //   network_id: 4,
    //   gas: 3000000,
    //   gasPrice: 10000000000,
    //   skipDryRun: true
    // },
    // // main ethereum network(mainnet)
    // main: {
    //   provider: () => new HDWalletProvider(process.env.MNENOMIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY),
    //   network_id: 1,
    //   gas: 3000000,
    //   gasPrice: 10000000000
    // }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
