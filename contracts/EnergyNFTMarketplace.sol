// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EnergyNFTMarketplace is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => uint256) public energyUnits;
    mapping(uint256 => uint256) public prices;

    event EnergyNFTMinted(address indexed recipient, uint256 tokenId, uint256 energyAmount, uint256 price);
    event EnergyNFTSold(address indexed buyer, uint256 tokenId, uint256 price);
    event EnergyNFTBurned(uint256 tokenId);

    constructor() ERC721("EnergyToken", "ENT") Ownable(msg.sender) {}

    function mintEnergyNFT(address recipient, string memory tokenURI, uint256 energyAmount, uint256 price) public onlyOwner {
        require(price > 0, "Price must be greater than zero");

        uint256 tokenId = nextTokenId;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        energyUnits[tokenId] = energyAmount;
        prices[tokenId] = price;
        nextTokenId++;

        emit EnergyNFTMinted(recipient, tokenId, energyAmount, price);
    }

    function buyEnergyNFT(uint256 tokenId) public payable {
        require(msg.value >= prices[tokenId], "Insufficient payment");
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");

        _transfer(seller, msg.sender, tokenId);

        // Ensuring safe transfer of funds
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit EnergyNFTSold(msg.sender, tokenId, msg.value);
    }

    function burnEnergyNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _burn(tokenId);
        delete energyUnits[tokenId];
        delete prices[tokenId];

        emit EnergyNFTBurned(tokenId);
    }
}
