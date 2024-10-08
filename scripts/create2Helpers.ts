import { ethers } from "hardhat";

export async function getEthereumForwarderCode(): Promise<string> {
    // Get the contract factory
    const EthereumForwarder = await ethers.getContractFactory("EthereumForwarder");

    // Get the creation bytecode of the contract
    const creationCode = EthereumForwarder.bytecode;

    return ethers.hexlify(creationCode);
}