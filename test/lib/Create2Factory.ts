import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

import { getEthereumForwarderCode } from "../../scripts/create2Helpers";

const expectedAddress = "0x000000FCb0E53f6670F788aa40Cf4adB2E134085";
const salt = "0xee6d7e357185d50c22454cde879a1fb8ee842ecf78271a1e7de575d5a86e8a2f";

describe("Create2Factory", function () {
    async function deployFixture() {
        const bank = (await ethers.getSigners())[0];

        await bank.sendTransaction({
            to: "0x000000000000000000000000000000000000dead",
            value: ethers.parseEther("1000"),
        });

        const signer = await ethers.getImpersonatedSigner("0x000000000000000000000000000000000000dead");

        const code = await getEthereumForwarderCode();

        const SUT = await hre.ethers.getContractFactory("Create2Factory", signer);
        const sut = await SUT.deploy();

        await sut.waitForDeployment();

        return {
            sut,
            code,
        };
    }

    // ############################ TESTS ############################

    describe("deploy", function () {
        it("should deploy the contract to the expected address", async function () {
            const { sut, code } = await loadFixture(deployFixture);

            const tx = await sut.deploy(salt, code);
            const receipt = await tx.wait();

            const logs = receipt!.logs.filter((log) => log.address === sut.target);
            expect(logs.length).to.equal(1);

            const log = logs[0];
            const args = sut.interface.decodeEventLog("Deployed", log.data, log.topics);

            expect(args[0]).to.equal(expectedAddress);
        });

        it("should revert if you try to deploy again with the same salt", async function () {
            const { sut, code } = await loadFixture(deployFixture);

            await sut.deploy(salt, code);

            await expect(sut.deploy(salt, code)).to.be.reverted;
        });
    });

    describe("computeAddress", function () {
        it("should return the expected address", async function () {
            const { sut, code } = await loadFixture(deployFixture);

            const address = await sut.computeAddress(salt, code);

            expect(address).to.equal(expectedAddress);
        });
    });
});
