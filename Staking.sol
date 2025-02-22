// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 rewardRate;
    }
    
    struct TokenInfo {
        bool isSupported;
        uint256 minStakeAmount;
        uint256 baseRewardRate;
    }

    mapping(address => mapping(address => StakeInfo)) public stakes; // user -> token -> stake
    mapping(address => TokenInfo) public supportedTokens;
    mapping(address => uint256) public rewardBalance;
    
    // Histórico de transações
    struct Transaction {
        address user;
        address token;
        uint256 amount;
        string transactionType; // "stake" ou "unstake"
        uint256 timestamp;
    }
    
    Transaction[] public transactionHistory;
    
    // Períodos de bloqueio disponíveis (em dias)
    uint256[] public lockPeriods = [30, 60, 90, 180, 365];
    
    event TokenAdded(address token, uint256 minStakeAmount, uint256 baseRewardRate);
    event Staked(address user, address token, uint256 amount, uint256 lockPeriod);
    event Unstaked(address user, address token, uint256 amount, uint256 reward);
    
    function addSupportedToken(
        address _token,
        uint256 _minStakeAmount,
        uint256 _baseRewardRate
    ) external {
        supportedTokens[_token] = TokenInfo(true, _minStakeAmount, _baseRewardRate);
        emit TokenAdded(_token, _minStakeAmount, _baseRewardRate);
    }
    
    function stake(
        address _token,
        uint256 _amount,
        uint256 _lockPeriod
    ) external nonReentrant {
        require(supportedTokens[_token].isSupported, "Token nao suportado");
        require(_amount >= supportedTokens[_token].minStakeAmount, "Quantidade menor que o minimo");
        require(isValidLockPeriod(_lockPeriod), "Periodo de bloqueio invalido");
        
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        uint256 rewardRate = calculateRewardRate(_token, _lockPeriod);
        
        stakes[msg.sender][_token] = StakeInfo({
            amount: _amount,
            startTime: block.timestamp,
            lockPeriod: _lockPeriod,
            rewardRate: rewardRate
        });
        
        // Registrar transação
        transactionHistory.push(Transaction({
            user: msg.sender,
            token: _token,
            amount: _amount,
            transactionType: "stake",
            timestamp: block.timestamp
        }));
        
        emit Staked(msg.sender, _token, _amount, _lockPeriod);
    }
    
    function unstake(address _token) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender][_token];
        require(stakeInfo.amount > 0, "Nada em stake");
        require(
            block.timestamp >= stakeInfo.startTime + (stakeInfo.lockPeriod * 1 days),
            "Periodo de bloqueio nao terminou"
        );
        
        uint256 reward = calculateReward(msg.sender, _token);
        uint256 amount = stakeInfo.amount;
        
        delete stakes[msg.sender][_token];
        rewardBalance[msg.sender] += reward;
        
        IERC20(_token).transfer(msg.sender, amount);
        
        // Registrar transação
        transactionHistory.push(Transaction({
            user: msg.sender,
            token: _token,
            amount: amount,
            transactionType: "unstake",
            timestamp: block.timestamp
        }));
        
        emit Unstaked(msg.sender, _token, amount, reward);
    }
    
    function calculateRewardRate(address _token, uint256 _lockPeriod) public view returns(uint256) {
        uint256 baseRate = supportedTokens[_token].baseRewardRate;
        uint256 bonus = (_lockPeriod / 30) * 5; // +5% a cada 30 dias
        return baseRate + bonus;
    }
    
    function calculateReward(address _user, address _token) public view returns(uint256) {
        StakeInfo storage stakeInfo = stakes[_user][_token];
        uint256 timeElapsed = block.timestamp - stakeInfo.startTime;
        return (stakeInfo.amount * stakeInfo.rewardRate * timeElapsed) / (365 days * 100);
    }
    
    function isValidLockPeriod(uint256 _period) internal view returns(bool) {
        for(uint i = 0; i < lockPeriods.length; i++) {
            if(lockPeriods[i] == _period) return true;
        }
        return false;
    }
    
    function getUserTransactions(address _user) external view returns(Transaction[] memory) {
        uint256 count = 0;
        for(uint i = 0; i < transactionHistory.length; i++) {
            if(transactionHistory[i].user == _user) count++;
        }
        
        Transaction[] memory userTxs = new Transaction[](count);
        uint256 index = 0;
        for(uint i = 0; i < transactionHistory.length; i++) {
            if(transactionHistory[i].user == _user) {
                userTxs[index] = transactionHistory[i];
                index++;
            }
        }
        return userTxs;
    }
}