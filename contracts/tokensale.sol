// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MZLxToken is ERC20, Ownable {
    enum Tier { Bronze, Silver, Gold, Platinum }
    
    struct User {
        Tier tier;
        uint256 miningStart;
        bool miningActive;
        address referrer;
        uint256 affiliateRewards;
    }
    
    mapping(address => User) public users;
    uint256 public tokenPrice = 0.001 ether;
    uint256 public miningBaseRate = 1 ether;
    uint256 public minVoteTokens = 1000 ether;
    
    event TierUpgraded(address indexed user, Tier newTier);
    event TokensPurchased(address indexed buyer, uint256 amount, address referrer);
    
    constructor() ERC20("MAZOL Token", "MZLx") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        tokenPrice = newPrice;
    }
    
    function buyTokens(address referrer) external payable {
        uint256 tokenAmount = msg.value / tokenPrice;
        _mint(msg.sender, tokenAmount);
        
        if(referrer != address(0)) {
            uint256 referralReward = tokenAmount * 10 / 100;
            _mint(referrer, referralReward);
            users[referrer].affiliateRewards += referralReward;
        }
    }
    
    function upgradeToSilver() external {
        require(users[msg.sender].tier == Tier.Bronze, "Must be Bronze");
        users[msg.sender].tier = Tier.Silver;
        emit TierUpgraded(msg.sender, Tier.Silver);
    }
    
    function upgradeToGold() external {
        require(users[msg.sender].tier == Tier.Silver, "Must be Silver");
        users[msg.sender].tier = Tier.Gold;
        emit TierUpgraded(msg.sender, Tier.Gold);
    }
    
    function upgradeToPlatinum() external {
        require(users[msg.sender].tier == Tier.Gold, "Must be Gold");
        users[msg.sender].tier = Tier.Platinum;
        emit TierUpgraded(msg.sender, Tier.Platinum);
    }
    
    function startMining() external {
        require(users[msg.sender].tier != Tier.Bronze, "Register first");
        users[msg.sender].miningStart = block.timestamp;
        users[msg.sender].miningActive = true;
    }
    
    function claimMiningRewards() external {
        require(users[msg.sender].miningActive, "Mining not active");
        require(block.timestamp > users[msg.sender].miningStart + 24 hours, "24h not passed");
        
        uint256 multiplier = 1;
        if(users[msg.sender].tier == Tier.Silver) multiplier = 3;
        else if(users[msg.sender].tier == Tier.Gold) multiplier = 9;
        else if(users[msg.sender].tier == Tier.Platinum) multiplier = 27;
        
        uint256 reward = miningBaseRate * multiplier;
        _mint(msg.sender, reward);
        users[msg.sender].miningActive = false;
    }
}
