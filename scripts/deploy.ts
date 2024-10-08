import { AddressLike } from "ethers";
import hre from "hardhat";
import { ethers } from "hardhat";

import { getEthereumForwarderCode } from "./create2Helpers";

const factoryAddress = "0xcfeA57885743b5C71Da9B1BaA94F21572A6abccb";
const salt = "";

async function main() {
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts to", network.name, "chainId", chainId, "deployer", deployer.address);

    const factory = await ethers.getContractAt("Create2Factory", factoryAddress, deployer)

    const code = await getEthereumForwarderCode();

    if (salt === "") {
        console.log("Missing salt, find one using the following hash:", ethers.keccak256(code));
    } else {
        const address = await factory.computeAddress(salt, code);
        const tx = await factory.deploy(salt, code);

        await tx.wait();

        console.log("EthereumForwarder deployed to:", address);

        await sleep(20000);

        await verify(address, []);
    }
}

async function verify(address: AddressLike, args: any[]) {
    await sleep(1000);
    return hre.run("verify:verify", {
        address,
        constructorArguments: args,
    });
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
