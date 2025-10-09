// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./interfaces/ISemaphore.sol";
import "hardhat/console.sol";

/**
 * @title SemaphoreVoting
 * @dev Anonymous voting system using Semaphore zero-knowledge proofs
 * @notice This contract enables privacy-preserving voting where:
 *         - Voters prove group membership without revealing identity
 *         - Double-voting is prevented via nullifiers
 *         - Results are publicly verifiable
 */
contract SemaphoreVoting {
    ISemaphore public semaphore;

    struct Poll {
        string title;
        string[] options;
        uint256 startTime;
        uint256 registrationEndTime;
        uint256 votingEndTime;
        address admin;
        uint256 groupId;
        uint256 totalVotes;
        bool exists;
    }


    // State variables
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(uint256 => uint256)) public votes; // pollId => optionIndex => count
    mapping(uint256 => mapping(uint256 => bool)) public usedNullifiers; // pollId => nullifier => used

    // Events
    event PollCreated(
        uint256 indexed pollId,
        string title,
        address indexed admin,
        uint256 registrationEndTime,
        uint256 votingEndTime,
        uint256 groupId
    );

    event VoterRegistered(uint256 indexed pollId, uint256 identityCommitment);

    event VoteCast(
        uint256 indexed pollId,
        uint256 voteOption,
        uint256 nullifier
    );

    // Errors
    error PollDoesNotExist();
    error NotInRegistrationPhase();
    error NotInVotingPhase();
    error InvalidOptionCount();
    error InvalidTreeDepth();
    error InvalidVoteOption();
    error VoteAlreadyCast();
    error OnlyPollAdmin();

    // Modifiers
    modifier pollExists(uint256 pollId) {
        if (!polls[pollId].exists) revert PollDoesNotExist();
        _;
    }

    modifier onlyAdmin(uint256 pollId) {
        if (msg.sender != polls[pollId].admin) revert OnlyPollAdmin();
        _;
    }

    modifier duringRegistration(uint256 pollId) {
        if (
            block.timestamp < polls[pollId].startTime ||
            block.timestamp >= polls[pollId].registrationEndTime
        ) revert NotInRegistrationPhase();
        _;
    }

    modifier duringVoting(uint256 pollId) {
        if (
            block.timestamp < polls[pollId].registrationEndTime ||
            block.timestamp >= polls[pollId].votingEndTime
        ) revert NotInVotingPhase();
        _;
    }

    /**
     * @dev Constructor
     * @param semaphoreAddress: Address of the Semaphore contract
     */
    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    /**
     * @dev Create a new poll
     * @param title: The poll title
     * @param options: Array of voting options
     * @param registrationDuration: Duration in seconds for voter registration
     * @param votingDuration: Duration in seconds for voting period
     * @param merkleTreeDepth: Depth of the Merkle tree (determines max voters)
     * @return pollId: The ID of the created poll
     */
    function createPoll(
        string memory title,
        string[] memory options,
        uint256 registrationDuration,
        uint256 votingDuration,
        uint256 merkleTreeDepth
    ) external returns (uint256) {
        if (options.length < 2 || options.length > 10)
            revert InvalidOptionCount();
        if (merkleTreeDepth < 1 || merkleTreeDepth > 32)
            revert InvalidTreeDepth();

        uint256 pollId = pollCount++;
        uint256 startTime = block.timestamp;
        uint256 registrationEndTime = startTime + registrationDuration;
        uint256 votingEndTime = registrationEndTime + votingDuration;

        // Create Semaphore group - admin is this contract
        // Note: Semaphore V4 auto-generates groupId, we store it with the poll
        uint256 groupId = semaphore.createGroup(address(this));

        Poll storage poll = polls[pollId];
        poll.title = title;
        poll.options = options;
        poll.startTime = startTime;
        poll.registrationEndTime = registrationEndTime;
        poll.votingEndTime = votingEndTime;
        poll.admin = msg.sender;
        poll.groupId = groupId;
        poll.exists = true;

        emit PollCreated(
            pollId,
            title,
            msg.sender,
            registrationEndTime,
            votingEndTime,
            groupId
        );

        return pollId;
    }

    /**
     * @dev Register a voter by adding their identity commitment to the group
     * @param pollId: The poll identifier
     * @param identityCommitment: The voter's identity commitment
     */
    function registerVoter(
        uint256 pollId,
        uint256 identityCommitment
    ) external pollExists(pollId) duringRegistration(pollId) {
        uint256 groupId = polls[pollId].groupId;
        semaphore.addMember(groupId, identityCommitment);

        emit VoterRegistered(pollId, identityCommitment);
    }


    function vote(
        uint256 pollId,
        uint256 voteOption,
        ISemaphore.SemaphoreProof calldata proofs
    ) external pollExists(pollId) duringVoting(pollId) {
        Poll storage poll = polls[pollId];
        // Validate vote option
        if (voteOption >= poll.options.length) revert InvalidVoteOption();
        // Check nullifier hasn't been used
        if (usedNullifiers[pollId][proofs.nullifier]) revert VoteAlreadyCast();
        // Verify ZK proof through Semaphore
        semaphore.validateProof(
            poll.groupId,
            proofs
        );
        // Record vote
        votes[pollId][voteOption]++;
        usedNullifiers[pollId][proofs.nullifier] = true;
        poll.totalVotes++;

        emit VoteCast(pollId, voteOption, proofs.nullifier);
    }

    /**
     * @dev Get poll results
     * @param pollId: The poll identifier
     * @return results: Array of vote counts for each option
     */
    function getResults(
        uint256 pollId
    ) external view pollExists(pollId) returns (uint256[] memory) {
        Poll storage poll = polls[pollId];
        uint256[] memory results = new uint256[](poll.options.length);

        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = votes[pollId][i];
        }

        return results;
    }

    /**
     * @dev Get poll information
     * @param pollId The poll identifier
     * @return title Poll title
     * @return options Array of voting options
     * @return startTime Poll start timestamp
     * @return registrationEndTime Registration deadline timestamp
     * @return votingEndTime Voting deadline timestamp
     * @return admin Address of poll creator
     * @return totalVotes Total number of votes cast
     */
    function getPollInfo(
        uint256 pollId
    )
        external
        view
        pollExists(pollId)
        returns (
            string memory title,
            string[] memory options,
            uint256 startTime,
            uint256 registrationEndTime,
            uint256 votingEndTime,
            address admin,
            uint256 totalVotes
        )
    {
        Poll storage poll = polls[pollId];
        return (
            poll.title,
            poll.options,
            poll.startTime,
            poll.registrationEndTime,
            poll.votingEndTime,
            poll.admin,
            poll.totalVotes
        );
    }

    /**
     * @dev Get current poll phase
     * @param pollId: The poll identifier
     * @return phase: "Registration", "Voting", or "Ended"
     */
    function getPollPhase(
        uint256 pollId
    ) external view pollExists(pollId) returns (string memory) {
        Poll storage poll = polls[pollId];

        if (block.timestamp < poll.registrationEndTime) {
            return "Registration";
        } else if (block.timestamp < poll.votingEndTime) {
            return "Voting";
        } else {
            return "Ended";
        }
    }

    /**
     * @dev Get the Merkle tree root for a poll's group
     * @param pollId: The poll identifier
     * @return The current Merkle tree root
     */
    function getMerkleTreeRoot(
        uint256 pollId
    ) external view pollExists(pollId) returns (uint256) {
        return semaphore.getMerkleTreeRoot(polls[pollId].groupId);
    }

    /**
     * @dev Get the number of registered voters for a poll
     * @param pollId: The poll identifier
     * @return The number of registered voters
     */
    function getRegisteredVoterCount(
        uint256 pollId
    ) external view pollExists(pollId) returns (uint256) {
        return semaphore.getNumberOfMerkleTreeLeaves(polls[pollId].groupId);
    }

    /**
     * @dev Check if a nullifier has been used for a poll
     * @param pollId: The poll identifier
     * @param nullifier: The nullifier to check
     * @return True if the nullifier has been used, false otherwise
     */
    function isNullifierUsed(
        uint256 pollId,
        uint256 nullifier
    ) external view pollExists(pollId) returns (bool) {
        return usedNullifiers[pollId][nullifier];
    }
}
