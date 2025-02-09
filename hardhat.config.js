require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.28", // Use your Solidity version
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Connects to Hardhat local blockchain
    },
  },
};
