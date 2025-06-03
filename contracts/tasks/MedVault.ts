import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploys the Vault contract")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const factory = await hre.ethers.getContractFactory('MedVault');
    const contract = await factory.deploy();

    const dt = contract.deploymentTransaction();
    console.log('Deployment Transaction', dt!.hash);
    
    await contract.waitForDeployment();
    console.log('Contract', await contract.getAddress());
  });