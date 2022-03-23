pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Balloons is ERC20 {

    constructor() ERC20("Balloons", "BLNS") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}