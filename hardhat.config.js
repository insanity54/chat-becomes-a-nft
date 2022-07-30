require('dotenv').config();
require("@nomiclabs/hardhat-ethers");



module.exports = {
  solidity: "0.8.4",
  networks: {
    mumbai: {
      chainId: 80001,
      url: "https://matic.getblock.io/testnet/",
      timeout: 20000,
      httpHeaders: {
        "x-api-key": process.env.GETBLOCKAPIKEY
      },
      accounts: {
        mnemonic: process.env.WALLETMNEMONIC
      }
    }
  }
}
