// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

contract Create2Factory {
    event Deployed(address addr);

    function deploy(bytes32 _salt, bytes calldata _code) external payable {
        emit Deployed(Create2.deploy(msg.value, _salt, _code));
    }

    function computeAddress(bytes32 _salt, bytes calldata _code) external view returns (address) {
        return Create2.computeAddress(_salt, keccak256(_code));
    }
}
