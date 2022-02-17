// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract MultiSigSafe {
  using ECDSA for bytes32;

  event Deposit(address indexed sender, uint256 amount, uint256 balance);
  event ExecuteTransaction(bytes data, bytes32 txHash, bytes result, uint256 timestamp);
  event TransferFunds(address indexed receiver, uint256 value);
  event Owner(address indexed owner, bool added);

  address[] public owners;
  mapping(address => bool) public isOwner;
  uint256 public confirmationsRequired;

  modifier onlyOwner() {
    require(isOwner[msg.sender], "not owner");
    _;
  }

  modifier onlySelf() {
    require(msg.sender == address(this), "Not Self");
    _;
  }

  constructor(address[] memory _owners, uint256 _confirmationsRequired) {
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
    emit Deposit(msg.sender, msg.value, address(this).balance);
  }

  function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf {
    require(newSigner != address(0), "addSigner: zero address");
    require(!isOwner[newSigner], "addSigner: owner not unique");
    require(newSignaturesRequired > 0, "addSigner: must be non-zero sigs required");
    isOwner[newSigner] = true;
    confirmationsRequired = newSignaturesRequired;
    emit Owner(newSigner, isOwner[newSigner]);
  }

  function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlySelf {
    require(isOwner[oldSigner], "removeSigner: not owner");
    require(newSignaturesRequired > 0, "removeSigner: must be non-zero sigs required");
    isOwner[oldSigner] = false;
    confirmationsRequired = newSignaturesRequired;
    emit Owner(oldSigner, isOwner[oldSigner]);
  }

  function transferFunds(address payable to, uint256 value) public onlySelf {
    require(address(this).balance > value, "Not enough funds in Wallet");
    emit TransferFunds(to, value);
    to.transfer(value);
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
    bytes32 _hash = getTransactionHash(data);
    uint256 validSignatures;
    address duplicateGuard;
    for (uint256 i = 0; i < signatures.length; i++) {
      address recovered = recover(_hash, signatures[i]);
      require(recovered > duplicateGuard, "executeTransaction: duplicate or unordered signatures");
      duplicateGuard = recovered;
      if (isOwner[recovered]) {
        validSignatures++;
      }
    }
    console.log("req sigs ", confirmationsRequired);
    console.log("valid sigs ", validSignatures);
    require(validSignatures >= confirmationsRequired, "executeTransaction: not enough valid signatures");

    (bool success, bytes memory result) = address(this).call(data);
    require(success, "executeTransaction: tx failed");

    emit ExecuteTransaction(data, _hash, result, block.timestamp);
    return result;
  }

  function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
    return _hash.toEthSignedMessageHash().recover(_signature);
  }

  function getOwners() public view returns (address[] memory) {
    return owners;
  }
}
