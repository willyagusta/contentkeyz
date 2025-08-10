const { ethers } = require("hardhat");

async function deploy() {
    const TokenGatedAccess = await ethers.getContractFactory("TokenGatedAccess");
    const contract = await TokenGatedAccess.deploy(ethers.parseEther("0.01"));
    await contract.waitForDeployment();
    console.log("The contract is deployed to: ", await contract.getAddress());
}

deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})