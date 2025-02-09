// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyNFTMarketplace is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public energyUnits;
    mapping(uint256 => uint256) public prices;
    mapping(uint256 => bool) public listedForSale; // Track NFTs listed for sale

    event EnergyNFTMinted(address indexed recipient, uint256 tokenId, uint256 energyAmount, uint256 price);
    event EnergyNFTListed(uint256 tokenId, uint256 price);
    event EnergyNFTSold(address indexed buyer, uint256 tokenId, uint256 price);
    event EnergyNFTBurned(uint256 tokenId);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() ERC721("EnergyToken", "ENT") Ownable(msg.sender) {}

    function mintEnergyNFT(
        address recipient,
        string memory tokenURI,
        uint256 energyAmount,
        uint256 price
    ) public onlyOwner returns (uint256) {
        require(price > 0, "Price must be greater than zero");

        uint256 tokenId = nextTokenId;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        energyUnits[tokenId] = energyAmount;
        prices[tokenId] = price;
        listedForSale[tokenId] = false;
        nextTokenId++;

        emit EnergyNFTMinted(recipient, tokenId, energyAmount, price);
        return tokenId; // ✅ Returning the token ID for better tracking
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than zero");

        prices[tokenId] = price;
        listedForSale[tokenId] = true;

        emit EnergyNFTListed(tokenId, price);
    }

    function buyEnergyNFT(uint256 tokenId) public payable {
        require(listedForSale[tokenId], "NFT is not for sale");
        require(msg.value >= prices[tokenId], "Insufficient payment");

        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");

        listedForSale[tokenId] = false; // ✅ Mark NFT as not for sale before transfer
        _transfer(seller, msg.sender, tokenId);

        // Secure fund transfer
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit EnergyNFTSold(msg.sender, tokenId, msg.value);
    }

    function burnEnergyNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _burn(tokenId);

        delete energyUnits[tokenId];
        delete prices[tokenId];
        delete listedForSale[tokenId];

        emit EnergyNFTBurned(tokenId);
    }

    // ✅ New function: Allow owner to withdraw contract funds
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner(), balance);
    }
}
