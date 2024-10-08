// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EthereumForwarder
 * @author @builtbyfrancis
 * @notice This contract forwards Ethereum to another address, used in conjunction with MultiCall3 for batched transactions
 */
contract EthereumForwarder {
    error ForwardFailed();

    function forward(address payable _to) external payable {
        _to.transfer(msg.value);
    }
}
