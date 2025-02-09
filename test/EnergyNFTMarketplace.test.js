const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyNFTMarketplace", function () {
    let EnergyNFTMarketplace;
    let energyNFTMarketplace;
    let owner, addr1, addr2;

    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const EnergyNFTMarketplaceFactory = await ethers.getContractFactory("EnergyNFTMarketplace");
        energyNFTMarketplace = await EnergyNFTMarketplaceFactory.deploy(); // No need for `.deployed()`
        
        await energyNFTMarketplace.waitForDeployment(); // ✅ Correct function for new Hardhat versions
    });

    it("Should mint an NFT", async function () {
        const tokenURI = "https://example.com/metadata.json";
        await energyNFTMarketplace.mintEnergyNFT(addr1.address, tokenURI, 100, ethers.parseEther("0.1"));

        expect(await energyNFTMarketplace.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should allow buying NFTs", async function () {
        const tokenURI = "https://example.com/metadata.json";
        await energyNFTMarketplace.mintEnergyNFT(addr1.address, tokenURI, 100, ethers.parseEther("0.1"));

        await energyNFTMarketplace.connect(addr1).approve(addr2.address, 0);
        await energyNFTMarketplace.connect(addr2).buyEnergyNFT(0, { value: ethers.parseEther("0.1") });

        expect(await energyNFTMarketplace.ownerOf(0)).to.equal(addr2.address);
    });
});
