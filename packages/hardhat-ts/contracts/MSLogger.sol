// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * Logs events of all created MultiSigSafes.
 * Necessary for better integration with Moralis contract event sync.
 */
contract MSLogger {
  event Deposit(address indexed safe, address indexed sender, uint256 amount, uint256 balance);
  event ExecuteMetaTransaction(address indexed safe, bytes data, bytes32 txHash, bytes result, uint256 timestamp);
  event TransferFunds(address indexed safe, address indexed receiver, uint256 value);
  event Owners(address indexed safe, address[] owners, uint256 indexed confirmationsRequired);

  modifier onlyRegistered() {
    require(isRegisteredToLog(msg.sender) || address(this) == msg.sender, "caller not registered to use logger");
    _;
  }

  function isRegisteredToLog(address) internal view virtual returns (bool) {}

  function emitDeposit(
    address _safe,
    address _sender,
    uint256 _amount,
    uint256 _balance
  ) external onlyRegistered {
    emit Deposit(_safe, _sender, _amount, _balance);
  }

  function emitOwners(
    address _safe,
    address[] memory _owners,
    uint256 _confirmations
  ) external onlyRegistered {
    emit Owners(_safe, _owners, _confirmations);
  }

  function emitTransferFunds(
    address _safe,
    address _receiver,
    uint256 _value
  ) external onlyRegistered {
    emit TransferFunds(_safe, _receiver, _value);
  }

  function emitExecuteMetaTransaction(
    address _safe,
    bytes memory _data,
    bytes32 _txHash,
    bytes memory _result,
    uint256 _timestamp
  ) external onlyRegistered {
    emit ExecuteMetaTransaction(_safe, _data, _txHash, _result, _timestamp);
  }
}
