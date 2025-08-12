const hre = require("hardhat");

async function deploy() {
  console.log("Deploying AccessUnlock contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const AccessUnlock = await hre.ethers.getContractFactory("AccessUnlock");
  const accessUnlock = await AccessUnlock.deploy();

  await accessUnlock.waitForDeployment();
  const address = await accessUnlock.getAddress();

  console.log("AccessUnlock deployed to:", address);
  
  // Save deployment info
  console.log("Contract name: AccessUnlock");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });