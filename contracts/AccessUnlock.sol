// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract AccessUnlock {
    address public owner;

    // price per content in wei
    mapping(uint256 => uint256) public pricePerContent;

    // access granted mapping
    mapping(address => mapping(uint256 => bool)) public hasAccess;

    event PriceSet(uint256 indexed contentId, uint256 price);
    event AccessPurchased(address indexed buyer, uint256 indexed contentId, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPrice(uint256 _contentId, uint256 _price) external onlyOnwer {
        pricePerContent[contentId] = priceWei;
        emit priceSet (contentId, priceWei);
    }

    function purchaseAccess(uint256 _contentId) external payable {
        uint256 price = pricePerContent[_contentId];
        require(price > 0, "Price is not set");
        require(msg.value >= price, "Insufficient payment");

        hasAccess[msg.sender][_contentId] = true;
        
        // if buyer overpaid, keep the excess as a tip
        emit AccessPurchased(msg.sender, contentId, msg.value);
    }

    function checkAccess(address user, uint256 contentId) external view returns (bool) {
        return hasAccess[user][contentId];
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool ok, ) = to.call{value: balance}("");
        require(ok, "Transfer failed");
        emit Withdrawn(to, balance);
    }
}