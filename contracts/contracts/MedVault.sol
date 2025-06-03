// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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

contract MedVault {
    mapping(uint256 => FileInfo) private files;
    mapping(address => FileInfo[]) private ownerFiles;
    mapping(string => DoctorAccess) private doctorAccess;

    constructor() { }

    function registerFile(
        string memory fileName,
        string memory cid,
        string memory key,
        string memory iv
    ) external {
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
        require(file.owner == msg.sender, "Unauthorized");

        bytes memory rnd = Sapphire.randomBytes(32, "");
        string memory accessToken = Strings.toHexString(uint256(keccak256(rnd)));

        doctorAccess[accessToken] = DoctorAccess({
            doctor: doctor,
            fileId: fileId,
            endDate: block.timestamp + duration * 60
        });

    }

    function accessFile(
        string memory accessToken
    ) external view returns (FileInfo memory) {
        DoctorAccess memory access = doctorAccess[accessToken];
        return files[access.fileId];
    }


}