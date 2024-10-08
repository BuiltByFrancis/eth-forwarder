import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

const value = ethers.parseEther("1");

describe("EthereumForwarder", function () {
    async function deployFixture() {
        const [_, wallet] = await ethers.getSigners();

        const NotPayable = await hre.ethers.getContractFactory("NotPayable");
        const notPayable = await NotPayable.deploy();
        await notPayable.waitForDeployment();

        const Payable = await hre.ethers.getContractFactory("Payable");
        const payable = await Payable.deploy();
        await payable.waitForDeployment();

        const SUT = await hre.ethers.getContractFactory("EthereumForwarder");
        const sut = await SUT.deploy();
        await sut.waitForDeployment();

        return {
            sut,
            wallet,
            payable,
            notPayable,
        };
    }

    describe("forward", function () {
        it("should forward eth to a wallet", async function () {
            const { sut, wallet } = await loadFixture(deployFixture);

            const balanceBefore = await ethers.provider.getBalance(wallet.address);
            await sut.forward(wallet.address, {
                value,
            });
            const balanceAfter = await ethers.provider.getBalance(wallet.address);

            expect(balanceAfter - balanceBefore).to.equal(value);
        });

        it("should forward eth to a payable contract", async function () {
            const { sut, payable } = await loadFixture(deployFixture);

            const balanceBefore = await ethers.provider.getBalance(payable.target);
            await sut.forward(payable.target, {
                value,
            });
            const balanceAfter = await ethers.provider.getBalance(payable.target);

            expect(balanceAfter - balanceBefore).to.equal(value);
        });

        it("should revert when forwarding eth to contract without a receive function", async function () {
            const { sut, notPayable } = await loadFixture(deployFixture);

            await expect(
                sut.forward(notPayable.target, {
                    value,
                })
            ).to.be.reverted;
        });
    });
});
