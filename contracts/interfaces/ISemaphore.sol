// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ISemaphore
 * @dev Interface for Semaphore protocol contract
 */
interface ISemaphore {

    /// It defines all the Semaphore proof parameters used by Semaphore.sol.
    struct SemaphoreProof {
        uint256 merkleTreeDepth;
        uint256 merkleTreeRoot;
        uint256 nullifier;
        uint256 message;
        uint256 scope;
        uint256[8] points;
    }
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

    /// @dev Saves the nullifier hash to prevent double signaling and emits an event
    /// if the zero-knowledge proof is valid.
    /// @param groupId: Id of the group.
    /// @param proof: Semaphore zero-knowledge proof.
    function validateProof(uint256 groupId, SemaphoreProof calldata proof) external;


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
