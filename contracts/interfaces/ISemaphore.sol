// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ISemaphore
 * @dev Interface for Semaphore protocol contract
 */
interface ISemaphore {
    /**
     * @dev Creates a new Semaphore group with admin
     * @param admin The admin address for the group
     * @return groupId The auto-generated unique identifier for the group
     */
    function createGroup(address admin) external returns (uint256 groupId);

    /**
     * @dev Updates a group's admin
     * @param groupId The group identifier
     * @param newAdmin The new admin address
     */
    function updateGroupAdmin(uint256 groupId, address newAdmin) external;

    /**
     * @dev Adds a member to an existing group
     * @param groupId: The group identifier
     * @param identityCommitment: The member's identity commitment
     */
    function addMember(uint256 groupId, uint256 identityCommitment) external;

    /**
     * @dev Removes a member from a group
     * @param groupId: The group identifier
     * @param identityCommitment: The member's identity commitment to remove
     * @param merkleTreeRoot: The current Merkle tree root
     * @param proofSiblings: The Merkle proof siblings
     */
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256 merkleTreeRoot,
        uint256[] calldata proofSiblings
    ) external;

    /**
     * @dev Validates a zero-knowledge proof
     * @param groupId: The group identifier
     * @param merkleTreeDepth: The depth of the Merkle tree
     * @param merkleTreeRoot: The Merkle tree root
     * @param nullifier: The unique nullifier for this proof
     * @param externalNullifier: The external nullifier (scope)
     * @param signal: The signal/message being proven
     * @param points: The zk-SNARK proof points
     */
    function validateProof(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 externalNullifier,
        uint256 signal,
        uint256[8] calldata points
    ) external view;

    /**
     * @dev Gets the Merkle tree root for a group
     * @param groupId: The group identifier
     * @return The current Merkle tree root
     */
    function getMerkleTreeRoot(uint256 groupId) external view returns (uint256);

    /**
     * @dev Gets the depth of a group's Merkle tree
     * @param groupId: The group identifier
     * @return The Merkle tree depth
     */
    function getMerkleTreeDepth(uint256 groupId) external view returns (uint256);

    /**
     * @dev Gets the number of members in a group
     * @param groupId: The group identifier
     * @return The number of members
     */
    function getNumberOfMerkleTreeLeaves(uint256 groupId) external view returns (uint256);
}
