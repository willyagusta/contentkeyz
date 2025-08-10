// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenGatedAccess is ERC721URIStorage, Ownable {
    uint256 public price;
    uint256 public tokenCounter;
    mapping(address => bool) public hasAccess;

    event AccessGranted(address indexed buyer, uint256 tokenId);

    constructor(uint256 _price) ERC721("TokenGatedAccess", "TGA") Ownable(msg.sender) {
        price = _price;
        tokenCounter = 1;
    }

    function buyAccess(string memory _tokenURI) external payable {
        require(msg.value >= price, "Insufficient funds");
        require(!hasAccess[msg.sender], "Already has access");

        // Mark having access
        hasAccess[msg.sender] = true;

        // Mint the NFT
        uint256 newTokenId = tokenCounter++;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        tokenCounter++;

        emit AccessGranted(msg.sender, newTokenId);
    }

    function checkAccess(address _user) external view returns (bool) {
        return hasAccess[_user];
    }

    function withdraw(address payable _to) external onlyOwner {
        _to.transfer(address(this).balance);
    }

    function updatePrice(uint256 _newPrice) external onlyOwner {
        price = _newPrice;
    }
}