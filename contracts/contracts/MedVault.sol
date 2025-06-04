// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";

/// Unauthorized access.
error MedVault_Unauthorized();

/// Provided address is invalid (zero address)
error MedVault_InvalidAddress();

/// End date must be in the future
error MedVault_InvalidEndDate();

/// Transaction failed
error MedVault_TransactionFailed();

/// Insufficient funds. 
error MedVault_InsufficientFunds();

/// This token expired. Current ts: current, end: endDate.
error MedVault_TokenExpired(uint256 current, uint256 endDate);

struct FileInfo {
    uint256 fileId;
    address owner;
    string name;
    string cid;
    string key;
    string iv;
}

struct DoctorAccess {
    address doctor;
    uint256 endDate;
    uint256 fileId;
}

contract MedVault is Ownable, SiweAuth {
    mapping(uint256 => FileInfo) private files;
    mapping(address => FileInfo[]) private ownerFiles;
    mapping(string => DoctorAccess) private doctorAccess;

    event FileRegistered(uint256 fileId, string fileName);
    event AccessGranted(string token, address doctor, uint256 enddate);
    event AccessRevoked(string token);
    bytes21 public rofl;
    uint256 public constant PRICE_PER_FILE = 0.005 ether; 

    constructor(string memory _domain,address _owner,bytes21 _rofl) 
        Ownable(_owner)
        SiweAuth(_domain)
    {
        rofl = _rofl;
    }

    function registerFile(
        string memory fileName,
        string memory cid,
        string memory key,
        string memory iv
    ) external payable {
        require(msg.value >= PRICE_PER_FILE, MedVault_InsufficientFunds()); 
        bytes memory rnd = Sapphire.randomBytes(32, "");
        uint256 fileId = uint256(keccak256(rnd));

        FileInfo memory fileInfo = FileInfo({
            fileId: fileId,
            owner: msg.sender,
            name: fileName,
            cid: cid,
            key: key,
            iv: iv
        });
        files[fileId] = fileInfo;
        ownerFiles[msg.sender].push(fileInfo);
    }

    function grantAccess(
        address doctor,
        uint256 fileId,
        uint256 duration
    ) external {
        FileInfo memory file = files[fileId];
        require(file.owner == msg.sender, MedVault_Unauthorized());
        require(doctor != address(0), MedVault_InvalidAddress());

        bytes memory rnd = Sapphire.randomBytes(32, "");
        string memory accessToken = Strings.toHexString(
            uint256(keccak256(rnd))
        );

        doctorAccess[accessToken] = DoctorAccess({
            doctor: doctor,
            fileId: fileId,
            endDate: block.timestamp + duration * 60
        });
        emit AccessGranted(
            accessToken,
            doctor,
            block.timestamp + duration * 60
        );
    }

    function accessFile(
        string memory accessToken,
        bytes memory authToken
    ) external view returns (FileInfo memory) {
        Subcall.roflEnsureAuthorizedOrigin(rofl);
        DoctorAccess memory access = doctorAccess[accessToken];
        require(
            access.doctor == authMsgSender(authToken),
            MedVault_Unauthorized()
        );
        require(
            access.endDate > block.timestamp,
            MedVault_TokenExpired(block.timestamp, access.endDate)
        );
        return files[access.fileId];
    }

    function getOwnerFiles(
        bytes memory token
    ) external view returns (FileInfo[] memory) {
        return ownerFiles[authMsgSender(token)];
    }

    function getOwnerFile(
        uint256 fileId,
        bytes memory token
    ) external view returns (FileInfo memory) {
        FileInfo memory file = files[fileId];
        require(authMsgSender(token) == file.owner, MedVault_Unauthorized());
        return file;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(msg.sender).call{value:  address(this).balance}("");
        if (!success) revert MedVault_TransactionFailed();
    }
}
