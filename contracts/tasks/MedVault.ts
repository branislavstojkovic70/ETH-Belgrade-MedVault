import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploys the MedVault contract")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const domain = "http://localhost:5173"; // argument za konstruktor

    const factory = await hre.ethers.getContractFactory('MedVault');
    const contract = await factory.deploy(domain); 

    const dt = contract.deploymentTransaction();
    console.log('Deployment Transaction:', dt!.hash);

    await contract.waitForDeployment();
    console.log('Contract deployed at:', await contract.getAddress());
  });
