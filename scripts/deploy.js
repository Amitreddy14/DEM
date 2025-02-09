const fs = require("fs");
const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying EnergyNFTMarketplace...");

    // ✅ Correctly get the contract factory
    const EnergyNFTMarketplace = await hre.ethers.getContractFactory("EnergyNFTMarketplace");
    
    // ✅ Correctly deploy the contract
    const contract = await EnergyNFTMarketplace.deploy();

    // ✅ Wait until the contract is deployed
    await contract.waitForDeployment(); // 🔥 FIXED: Use waitForDeployment() instead of deployed()

    // ✅ Get the deployed contract address
    const contractAddress = await contract.getAddress();

    console.log("✅ Contract deployed at:", contractAddress);

    // ✅ Save contract address to a file for later use
    fs.writeFileSync("./contractAddress.json", JSON.stringify({ address: contractAddress }, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
