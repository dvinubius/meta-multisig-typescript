// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MultiSigSafe.sol";
import "./MSLogger.sol";

contract MSFactory is MSLogger {
  address[] multiSigSafes;
  mapping(address => bool) existsSafe;

  // not all of the fields are necessary, but they sure are useful
  event CreateMultiSigSafe(
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
    return existsSafe[caller];
  }

  /**
        @param name for better frontend UX
     */
  function createMultiSigSafe(
    string memory name,
    address[] memory owners,
    uint256 confirmationsRequired
  ) public {
    uint256 id = multiSigSafes.length;
    MultiSigSafe mss = new MultiSigSafe(owners, confirmationsRequired, address(this));
    multiSigSafes.push(address(mss));
    existsSafe[address(mss)] = true;
    emit CreateMultiSigSafe(id, address(mss), msg.sender, name, block.timestamp, owners, confirmationsRequired);
    this.emitOwners(address(mss), owners, confirmationsRequired);
  }

  function numberOfContracts() public view returns (uint256) {
    return multiSigSafes.length;
  }

  function contractById(uint256 id) public view returns (address) {
    return multiSigSafes[id];
  }
}
