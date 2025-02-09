const hre = require("hardhat");
const fs = require("fs");

async function main() {
    let contractAddress;
    try {
        const rawData = fs.readFileSync("./contractAddress.json", "utf-8");
        contractAddress = JSON.parse(rawData).address;
    } catch (error) {
        console.error("❌ Error reading contractAddress.json:", error);
        process.exit(1);
    }

    if (!contractAddress) {
        console.error("❌ Contract address is missing!");
        process.exit(1);
    }

    console.log("🔗 Using contract at address:", contractAddress);

    const [signer, buyer] = await hre.ethers.getSigners(); // Using second account as buyer
    console.log("👤 Using signer address:", signer.address);

    let contract;
    try {
        contract = await hre.ethers.getContractAt(
            "EnergyNFTMarketplace",
            contractAddress,
            signer
        );
        console.log("✅ Successfully connected to EnergyNFTMarketplace at:", contractAddress);
    } catch (error) {
        console.error("❌ Failed to connect to contract:", error);
        process.exit(1);
    }

    const tokenId = 1;
    const price = hre.ethers.parseEther("0.1"); // 0.1 ETH
    const energyAmount = 100; // Example energy amount

    // ✅ Step 1: Mint NFT if it doesn’t exist
    let nftExists = false;
    try {
        await contract.ownerOf(tokenId);
        nftExists = true;
        console.log(`✅ NFT ${tokenId} already exists.`);
    } catch (error) {
        console.log(`🔹 NFT ${tokenId} not found. Minting now...`);
        const mintTx = await contract.mintEnergyNFT(
            signer.address, 
            "https://example.com/nft-metadata.json", 
            energyAmount, 
            price
        );
        await mintTx.wait();

        try {
            await contract.ownerOf(tokenId);
            nftExists = true;
            console.log(`✅ NFT ${tokenId} minted successfully!`);
        } catch (err) {
            console.error("❌ NFT still not found after minting. Something went wrong.");
            process.exit(1);
        }
    }

    // ✅ Step 2: Verify NFT ownership
    if (nftExists) {
        const owner = await contract.ownerOf(tokenId);
        console.log(`🔹 NFT ${tokenId} is owned by:`, owner);
    }

    // ✅ Step 3: Check if NFT is listed for sale
    let isListed;
    try {
        isListed = await contract.listedForSale(tokenId);
        console.log(`🔍 NFT ${tokenId} listed for sale: ${isListed}`);
    } catch (error) {
        console.error("❌ Error checking listing status:", error);
        process.exit(1);
    }

    // ✅ Step 4: List NFT for sale if it's not already listed
    if (!isListed) {
        console.log(`🔹 Listing NFT ${tokenId} for ${hre.ethers.formatEther(price)} ETH...`);
        const listTx = await contract.listNFT(tokenId, price);
        await listTx.wait();
        console.log(`✅ NFT ${tokenId} listed successfully!`);
    }

    // ✅ Step 5: Buyer attempts to purchase NFT
    try {
        console.log(`🔹 Buyer (${buyer.address}) attempting to purchase NFT ${tokenId} for ${hre.ethers.formatEther(price)} ETH...`);
        const buyTx = await contract.connect(buyer).buyEnergyNFT(tokenId, { value: price });
        await buyTx.wait();
        console.log(`✅ Buyer ${buyer.address} successfully purchased NFT ${tokenId}!`);
    } catch (error) {
        console.error("❌ Error purchasing NFT:", error);
    }

    // ✅ Step 6: Verify new ownership after purchase
    try {
        const newOwner = await contract.ownerOf(tokenId);
        console.log(`🔹 NFT ${tokenId} new owner is: ${newOwner}`);
    } catch (error) {
        console.error("❌ Error retrieving new owner:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
