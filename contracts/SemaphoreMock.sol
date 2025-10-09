// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title SemaphoreMock
 * @dev Mock del contrato Semaphore para testing
 */
import "hardhat/console.sol";
import {ISemaphore} from "./interfaces/ISemaphore.sol";

contract SemaphoreMock is ISemaphore {
    uint256 private nextGroupId = 1;

    mapping(uint256 => address) public groupAdmins;
    mapping(uint256 => uint256) public groupMemberCount;
    mapping(uint256 => uint256) public merkleTreeRoots;

    event GroupCreated(uint256 indexed groupId, address indexed admin);
    event MemberAdded(uint256 indexed groupId, uint256 identityCommitment);
    event ProofValidated(uint256 indexed groupId, uint256 nullifier);

    function createGroup(address admin) external returns (uint256) {
        uint256 groupId = nextGroupId++;
        groupAdmins[groupId] = admin;
        merkleTreeRoots[groupId] = uint256(
            keccak256(abi.encodePacked(groupId, block.timestamp))
        );

        emit GroupCreated(groupId, admin);
        return groupId;
    }

    function addMember(uint256 groupId, uint256 identityCommitment) external {
        require(groupAdmins[groupId] != address(0), "Group does not exist");
        groupMemberCount[groupId]++;

        // Actualizar raíz del árbol (simplificado para mock)
        merkleTreeRoots[groupId] = uint256(
            keccak256(
                abi.encodePacked(merkleTreeRoots[groupId], identityCommitment)
            )
        );

        emit MemberAdded(groupId, identityCommitment);
    }

    function validateProof(
        uint256 groupId,
        SemaphoreProof calldata proofs
    ) external {
        require(groupAdmins[groupId] != address(0), "Group does not exist");
        // En un mock, simplemente aceptamos la prueba
        // En producción, esto validaría la prueba ZK real

        emit ProofValidated(groupId, proofs.nullifier);
    }

    function getMerkleTreeRoot(
        uint256 groupId
    ) external view returns (uint256) {
        return merkleTreeRoots[groupId];
    }

    function getNumberOfMerkleTreeLeaves(
        uint256 groupId
    ) external view returns (uint256) {
        return groupMemberCount[groupId];
    }

    function updateGroupAdmin(
        uint256 groupId,
        address newAdmin
    ) external override {}

    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 merkleTreeRoot,
        uint256[] calldata proofSiblings
    ) external override {}

    function getMerkleTreeDepth(
        uint256 groupId
    ) external view override returns (uint256) {}
}
