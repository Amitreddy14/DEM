const hre = require("hardhat");

async function main() {
    console.log("Deploying EnergyNFTMarketplace...");

    // Get the contract factory
    const EnergyNFTMarketplace = await hre.ethers.getContractFactory("EnergyNFTMarketplace");

    // Deploy the contract
    const contract = await EnergyNFTMarketplace.deploy();

    // Wait for deployment to complete
    await contract.waitForDeployment();

    // Get the deployed contract address
    console.log("✅ Contract deployed at:", contract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
