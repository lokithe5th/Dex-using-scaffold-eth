pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract DEX {
  using SafeMath for uint256;
  IERC20 token;

  event EthToToken(address _buyer, uint256 _tokensBought);
  event TokenToEth(address _buyer, uint256 _ethBought);
  event Deposit(address _deposit, uint256 _liquidityMinted);
  event Withdraw(address _withdrawer, uint256 _tokensWithdrawn, uint256 ethWithdrawn);

  constructor(address _tokenAddress) {
    token = IERC20(_tokenAddress);
  }

  uint256 public totalLiquidity;

  mapping(address => uint256) public liquidity;

  function init(uint256 _tokens) public payable returns (uint256) {
    require(totalLiquidity == 0, "DEX already has liquidity.");
    totalLiquidity = address(this).balance;
    liquidity[msg.sender] = totalLiquidity;
    require(token.transferFrom(msg.sender, address(this), _tokens));
    return totalLiquidity;
  }

  function price(
    uint256 _inputAmount, 
    uint256 _inputReserve, 
    uint256 _outputReserve
    ) public pure returns (uint256) {
      uint256 _inputAmountWithFee = _inputAmount.mul(997);
      uint256 numerator = _inputAmountWithFee.mul(_outputReserve);
      uint256 denominator = _inputReserve.mul(1000).add(_inputAmountWithFee);
      return numerator / denominator;
  }

  function ethToToken() public payable returns (uint256) {
    uint256 _tokenReserve = token.balanceOf(address(this));
    uint256 _tokensBought = price(msg.value, address(this).balance.sub(msg.value), _tokenReserve);
    require(token.transfer(msg.sender, _tokensBought));
    emit EthToToken(msg.sender, _tokensBought);
    return _tokensBought;
  }

  function tokenToEth(uint256 _tokens) public payable returns (uint256) {
    uint256 _tokenReserve = token.balanceOf(address(this));
    uint256 _ethBought = price(_tokens, _tokenReserve, address(this).balance);
    payable(msg.sender).transfer(_ethBought);
    require(token.transferFrom(msg.sender, address(this), _tokens));
    emit TokenToEth(msg.sender, _ethBought);
    return _ethBought;
  }

  function deposit() public payable returns (uint256) {
    uint256 _ethReserve = address(this).balance.sub(msg.value);
    uint256 _tokenReserve = token.balanceOf(address(this));
    uint256 _tokenAmount = (msg.value.mul(_tokenReserve) / _ethReserve).add(1);
    uint256 _liquidityMinted = msg.value.mul(totalLiquidity) / _ethReserve;
    liquidity[msg.sender] = liquidity[msg.sender].add(_liquidityMinted);
    totalLiquidity = totalLiquidity.add(_liquidityMinted);
    require(token.transferFrom(msg.sender, address(this), _tokenAmount));
    emit Deposit(msg.sender, _liquidityMinted);
    return _liquidityMinted;
  }

  function withdraw(uint256 _tokens) public returns (uint256, uint256) {
    uint256 _tokenReserve = token.balanceOf(address(this));
    uint256 _ethAmount = _tokens.mul(address(this).balance) / totalLiquidity;
    uint256 _tokenAmount = _tokens.mul(_tokenReserve / totalLiquidity);
    liquidity[msg.sender] = liquidity[msg.sender].sub(_ethAmount);
    payable(msg.sender).transfer(_ethAmount);
    require(token.transfer(msg.sender, _tokenAmount));
    emit Withdraw(msg.sender, _tokenAmount, _ethAmount);
    return (_ethAmount, _tokenAmount);
  }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}
