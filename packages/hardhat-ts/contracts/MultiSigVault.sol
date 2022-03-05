// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";
import "./MSLogger.sol";

contract MultiSigVault {
  using ECDSA for bytes32;

  address[] public owners;
  mapping(address => bool) public isOwner;
  uint256 public confirmationsRequired;
  MSLogger private logger;

  modifier onlyOwner() {
    require(isOwner[msg.sender], "not owner");
    _;
  }

  modifier onlySelf() {
    require(msg.sender == address(this), "Not Self");
    _;
  }

  constructor(
    address[] memory _owners,
    uint256 _confirmationsRequired,
    address _logger
  ) {
    logger = MSLogger(_logger);
    require(_owners.length > 0, "owners required");
    require(_confirmationsRequired > 0 && _confirmationsRequired <= _owners.length, "invalid number of required confirmations");
    for (uint256 i = 0; i < _owners.length; i++) {
      address owner = _owners[i];
      require(owner != address(0), "constructor: zero address");
      require(!isOwner[owner], "constructor: owner not unique");
      isOwner[owner] = true;
      owners.push(owner);
    }
    confirmationsRequired = _confirmationsRequired;
  }

  receive() external payable {
    logger.emitDeposit(address(this), msg.sender, msg.value, address(this).balance);
  }

  function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf {
    require(newSigner != address(0), "addSigner: zero address");
    require(!isOwner[newSigner], "addSigner: owner not unique");
    require(newSignaturesRequired > 0, "addSigner: must be non-zero sigs required");
    isOwner[newSigner] = true;
    owners.push(newSigner);
    confirmationsRequired = newSignaturesRequired;
    logger.emitOwners(address(this), owners, confirmationsRequired);
  }

  function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlySelf {
    require(isOwner[oldSigner], "removeSigner: not owner");
    require(newSignaturesRequired > 0, "removeSigner: must be non-zero sigs required");
    _eliminateOwner(oldSigner);
    confirmationsRequired = newSignaturesRequired;
    logger.emitOwners(address(this), owners, confirmationsRequired);
  }

  function _eliminateOwner(address _oldSigner) private {
    isOwner[_oldSigner] = false;
    uint256 ownersLength = owners.length;
    address[] memory poppedOwners = new address[](owners.length);
    for (uint256 i = ownersLength - 1; i >= 0; i--) {
      if (owners[i] != _oldSigner) {
        poppedOwners[i] = owners[i];
        owners.pop();
      } else {
        owners.pop();
        // repopulate owners
        for (uint256 j = i; j < ownersLength - 1; j++) {
          owners.push(poppedOwners[j]);
        }
        return;
      }
    }
  }

  function transferFunds(address payable to, uint256 value) public onlySelf {
    require(address(this).balance > value, "Not enough funds in Wallet");
    (bool success, bytes memory result) = to.call{ value: value }("");
    require(success, "Funds could not be transferred");
    logger.emitTransferFunds(address(this), to, value);
  }

  function updateSignaturesRequired(uint256 newSignaturesRequired) public onlySelf {
    require(newSignaturesRequired > 0, "updateSignaturesRequired: must be non-zero sigs required");
    confirmationsRequired = newSignaturesRequired;
  }

  function getTransactionHash(bytes memory data) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this), data));
  }

  function executeTransaction(bytes memory data, bytes[] memory signatures) public returns (bytes memory) {
    require(isOwner[msg.sender], "executeTransaction: only owners can execute");
    bytes32 txHash = getTransactionHash(data);
    uint256 validSignatures;
    address duplicateGuard;
    for (uint256 i = 0; i < signatures.length; i++) {
      address recovered = recover(txHash, signatures[i]);
      require(recovered > duplicateGuard, "executeTransaction: duplicate or unordered signatures");
      duplicateGuard = recovered;
      if (isOwner[recovered]) {
        validSignatures++;
      }
    }
    require(validSignatures >= confirmationsRequired, "executeTransaction: not enough valid signatures");

    (bool success, bytes memory result) = address(this).call(data);
    require(success, "executeTransaction: tx failed");

    logger.emitExecuteMetaTransaction(address(this), data, txHash, result, block.timestamp);
    return result;
  }

  function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
    return _hash.toEthSignedMessageHash().recover(_signature);
  }

  function getOwners() public view returns (address[] memory) {
    return owners;
  }
}
