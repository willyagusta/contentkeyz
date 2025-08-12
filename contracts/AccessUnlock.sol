// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AccessUnlock is ERC721URIStorage, Ownable, ReentrancyGuard {
    
    enum ContentType { PDF, VIDEO, ZIP, AUDIO, IMAGE, YOUTUBE, TWITTER, NOTION, OTHER }
    
    struct ContentItem {
        uint256 id;
        string title;
        string description;
        ContentType contentType;
        string ipfsHash;
        string embedUrl;
        uint256 price;
        address creator;
        bool isActive;
        uint256 createdAt;
        string previewHash;
    }

    // State variables
    uint256 private _contentIds;
    uint256 private _tokenIds;
    uint256 public platformFeePercent = 250; // 2.5%
    
    // Mappings
    mapping(uint256 => ContentItem) public content;
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    mapping(address => uint256[]) public userContent;
    mapping(ContentType => uint256[]) public contentByType;
    
    // Events
    event ContentCreated(uint256 indexed contentId, address indexed creator, ContentType contentType, string title);
    event AccessPurchased(address indexed buyer, uint256 indexed contentId, uint256 amount, uint256 tokenId);
    event ContentUpdated(uint256 indexed contentId, string title, uint256 price);
    event PreviewShared(uint256 indexed contentId, string previewHash);

    constructor() ERC721("ContentKeyz", "CKZ") Ownable(msg.sender) {}

    function createContent(
        string memory _title,
        string memory _description,
        ContentType _contentType,
        string memory _ipfsHash,
        string memory _embedUrl,
        uint256 _price,
        string memory _previewHash
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        _contentIds++;
        uint256 newContentId = _contentIds;

        content[newContentId] = ContentItem({
            id: newContentId,
            title: _title,
            description: _description,
            contentType: _contentType,
            ipfsHash: _ipfsHash,
            embedUrl: _embedUrl,
            price: _price,
            creator: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            previewHash: _previewHash
        });

        userContent[msg.sender].push(newContentId);
        contentByType[_contentType].push(newContentId);

        emit ContentCreated(newContentId, msg.sender, _contentType, _title);
        
        if (bytes(_previewHash).length > 0) {
            emit PreviewShared(newContentId, _previewHash);
        }

        return newContentId;
    }

    function purchaseAccess(uint256 _contentId) external payable nonReentrant returns (uint256) {
        ContentItem storage item = content[_contentId];
        require(item.isActive, "Content not active");
        require(msg.value >= item.price, "Insufficient payment");
        require(!hasAccess[msg.sender][_contentId], "Already has access");

        hasAccess[msg.sender][_contentId] = true;

        // Mint NFT as proof of access
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(msg.sender, newTokenId);
        
        if (bytes(item.ipfsHash).length > 0) {
            _setTokenURI(newTokenId, item.ipfsHash);
        }

        // Handle payment distribution
        if (msg.value > 0) {
            uint256 platformFee = (msg.value * platformFeePercent) / 10000;
            uint256 creatorPayment = msg.value - platformFee;

            // Transfer to creator
            if (creatorPayment > 0) {
                payable(item.creator).transfer(creatorPayment);
            }

            // Transfer platform fee to owner
            if (platformFee > 0) {
                payable(owner()).transfer(platformFee);
            }
        }

        emit AccessPurchased(msg.sender, _contentId, msg.value, newTokenId);
        return newTokenId;
    }

    function grantFreeAccess(uint256 _contentId, address _user) external {
        ContentItem memory item = content[_contentId];
        require(msg.sender == item.creator || msg.sender == owner(), "Not authorized");
        require(!hasAccess[_user][_contentId], "User already has access");
        
        hasAccess[_user][_contentId] = true;
        
        // Mint NFT for free access
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(_user, newTokenId);
        
        if (bytes(item.ipfsHash).length > 0) {
            _setTokenURI(newTokenId, item.ipfsHash);
        }

        emit AccessPurchased(_user, _contentId, 0, newTokenId);
    }

    function updateContent(
        uint256 _contentId,
        string memory _title,
        string memory _description,
        uint256 _price,
        bool _isActive
    ) external {
        ContentItem storage item = content[_contentId];
        require(msg.sender == item.creator, "Not the creator");

        item.title = _title;
        item.description = _description;
        item.price = _price;
        item.isActive = _isActive;

        emit ContentUpdated(_contentId, _title, _price);
    }

    // View functions
    function getContent(uint256 _contentId) external view returns (ContentItem memory) {
        return content[_contentId];
    }

    function getUserContent(address _user) external view returns (uint256[] memory) {
        return userContent[_user];
    }

    function getContentByType(ContentType _type) external view returns (uint256[] memory) {
        return contentByType[_type];
    }

    function checkAccess(address _user, uint256 _contentId) external view returns (bool) {
        return hasAccess[_user][_contentId];
    }

    function getActiveContent() external view returns (uint256[] memory) {
        uint256 totalContent = _contentIds;
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= totalContent; i++) {
            if (content[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory activeContent = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalContent; i++) {
            if (content[i].isActive) {
                activeContent[index] = i;
                index++;
            }
        }
        
        return activeContent;
    }

    function getTotalContent() external view returns (uint256) {
        return _contentIds;
    }

    function getTotalTokens() external view returns (uint256) {
        return _tokenIds;
    }

    // Admin functions
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = _feePercent;
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool ok, ) = to.call{value: balance}("");
        require(ok, "Transfer failed");
    }
}