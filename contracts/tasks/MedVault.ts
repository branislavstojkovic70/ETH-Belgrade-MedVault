import { bech32 } from "bech32";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploys the MedVault contract")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const domain = "http://localhost:5173"; 

    const factory = await hre.ethers.getContractFactory('MedVault');
    const [deployer] = await hre.ethers.getSigners();
    const decoded = bech32.decode("rofl1qpterpydpsteetl3lz5g6x2s7hzzvrt20cfwtm0s");
    const bytes = bech32.fromWords(decoded.words);
    const uint8Bytes = new Uint8Array(bytes);  
    const roflBytes21 = hre.ethers.hexlify(uint8Bytes);
    const contract = await factory.deploy(domain, deployer.address, roflBytes21);

    const dt = contract.deploymentTransaction();
    console.log('Deployment Transaction:', dt!.hash);

    await contract.waitForDeployment();
    console.log('Contract deployed at:', await contract.getAddress());
  });
