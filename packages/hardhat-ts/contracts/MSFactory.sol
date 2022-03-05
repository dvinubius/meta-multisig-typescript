// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MultiSigVault.sol";
import "./MSLogger.sol";

contract MSFactory is MSLogger {
  address[] multiSigVaults;
  mapping(address => bool) existsVault;

  // not all of the fields are necessary, but they sure are useful
  event CreateMultiSigVault(
    uint256 indexed contractId,
    address indexed contractAddress,
    address creator,
    string name,
    uint256 timestamp,
    address[] owners,
    uint256 confirmationsRequired
  );

  constructor() {}

  function isRegisteredToLog(address caller) internal view virtual override returns (bool) {
    return existsVault[caller];
  }

  /**
        @param name for better frontend UX
     */
  function createMultiSigVault(
    string memory name,
    address[] memory owners,
    uint256 confirmationsRequired
  ) public {
    uint256 id = multiSigVaults.length;
    MultiSigVault mss = new MultiSigVault(owners, confirmationsRequired, address(this));
    multiSigVaults.push(address(mss));
    existsVault[address(mss)] = true;
    emit CreateMultiSigVault(id, address(mss), msg.sender, name, block.timestamp, owners, confirmationsRequired);
    this.emitOwners(address(mss), owners, confirmationsRequired);
  }

  function numberOfContracts() public view returns (uint256) {
    return multiSigVaults.length;
  }

  function contractById(uint256 id) public view returns (address) {
    return multiSigVaults[id];
  }
}
