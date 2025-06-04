import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploys the MedVault contract")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const domain = "http://localhost:5173"; 

    const factory = await hre.ethers.getContractFactory('MedVault');
    const [deployer] = await hre.ethers.getSigners();
    const contract = await factory.deploy(domain, deployer.address);

    const dt = contract.deploymentTransaction();
    console.log('Deployment Transaction:', dt!.hash);

    await contract.waitForDeployment();
    console.log('Contract deployed at:', await contract.getAddress());
  });
