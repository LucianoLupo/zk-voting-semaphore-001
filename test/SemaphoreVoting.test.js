const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { Group, Identity, generateProof } = require("@semaphore-protocol/core")
describe("SemaphoreVoting", function () {
    let semaphoreVoting;
    let semaphoreMock;
    let owner;
    let voter1;
    let voter2;
    let addr1;

    const REGISTRATION_DURATION = 3600; // 1 hour
    const VOTING_DURATION = 7200; // 2 hours
    const MERKLE_TREE_DEPTH = 20;
    const GROUP_ID = 1;

    async function deploySemaphoreVotingFixture() {
        [owner, voter1, voter2, addr1] = await ethers.getSigners();

        // Deploy Semaphore mock
        const SemaphoreMock = await ethers.getContractFactory("SemaphoreMock");
        semaphoreMock = await SemaphoreMock.deploy();
        await semaphoreMock.waitForDeployment();

        // Deploy SemaphoreVoting
        const SemaphoreVoting = await ethers.getContractFactory("SemaphoreVoting");
        semaphoreVoting = await SemaphoreVoting.deploy(
            await semaphoreMock.getAddress()
        );
        await semaphoreVoting.waitForDeployment();

    }


    describe("Deployment", function () {
        it("Should initialize pollCount to 0", async function () {
            await loadFixture(deploySemaphoreVotingFixture)
            expect(await semaphoreVoting.pollCount()).to.equal(0);
        });

        it("Should set Semaphore address correctly", async function () {
            await loadFixture(deploySemaphoreVotingFixture)
            expect(await semaphoreVoting.semaphore()).to.equal(
                await semaphoreMock.getAddress()
            );
        });
    });

      describe("createPoll", function () {
        it("Should create a poll correctly", async function () {
          await loadFixture(deploySemaphoreVotingFixture)
          const title = "What is your favorite language?";
          const options = ["Solidity", "JavaScript", "Python"];

          const tx = await semaphoreVoting.createPoll(
            title,
            options,
            REGISTRATION_DURATION,
            VOTING_DURATION,
            MERKLE_TREE_DEPTH
          );

          await expect(tx)
            .to.emit(semaphoreVoting, "PollCreated")
            .withArgs(0, title, owner.address, 
              await time.latest() + REGISTRATION_DURATION,
              await time.latest() + REGISTRATION_DURATION + VOTING_DURATION,
              GROUP_ID
            );

          expect(await semaphoreVoting.pollCount()).to.equal(1);
        });

        it("Should reject insufficient options", async function () {
          await loadFixture(deploySemaphoreVotingFixture)
          await expect(
            semaphoreVoting.createPoll(
              "Invalid poll",
              ["Only one option"],
              REGISTRATION_DURATION,
              VOTING_DURATION,
              MERKLE_TREE_DEPTH
            )
          ).to.be.revertedWithCustomError(semaphoreVoting, "InvalidOptionCount");
        });

        it("Should reject too many options", async function () {
          await loadFixture(deploySemaphoreVotingFixture)
          const tooManyOptions = Array(11).fill("Option");

          await expect(
            semaphoreVoting.createPoll(
              "Invalid poll",
              tooManyOptions,
              REGISTRATION_DURATION,
              VOTING_DURATION,
              MERKLE_TREE_DEPTH
            )
          ).to.be.revertedWithCustomError(semaphoreVoting, "InvalidOptionCount");
        });

        it("Should reject invalid tree depth", async function () {
          await loadFixture(deploySemaphoreVotingFixture)
          await expect(
            semaphoreVoting.createPoll(
              "Poll",
              ["Option 1", "Option 2"],
              REGISTRATION_DURATION,
              VOTING_DURATION,
              0 // Invalid depth
            )
          ).to.be.revertedWithCustomError(semaphoreVoting, "InvalidTreeDepth");

          await expect(
            semaphoreVoting.createPoll(
              "Poll",
              ["Option 1", "Option 2"],
              REGISTRATION_DURATION,
              VOTING_DURATION,
              33 // Depth too large
            )
          ).to.be.revertedWithCustomError(semaphoreVoting, "InvalidTreeDepth");
        });

        it("Should store poll information correctly", async function () {
            await loadFixture(deploySemaphoreVotingFixture)
          const title = "Test poll";
          const options = ["A", "B", "C"];

          await semaphoreVoting.createPoll(
            title,
            options,
            REGISTRATION_DURATION,
            VOTING_DURATION,
            MERKLE_TREE_DEPTH
          );

          const pollInfo = await semaphoreVoting.getPollInfo(0);
          expect(pollInfo.title).to.equal(title);
          expect(pollInfo.options).to.deep.equal(options);
          expect(pollInfo.admin).to.equal(owner.address);
          expect(pollInfo.totalVotes).to.equal(0);
        });
      });

      describe("registerVoter", function () {
        beforeEach(async function () {
        await loadFixture(deploySemaphoreVotingFixture)
          await semaphoreVoting.createPoll(
            "Test poll",
            ["Option 1", "Option 2"],
            REGISTRATION_DURATION,
            VOTING_DURATION,
            MERKLE_TREE_DEPTH
          );
        });

        it("Should register a voter correctly", async function () {
          const identityCommitment = 12345;

          await expect(semaphoreVoting.registerVoter(0, identityCommitment))
            .to.emit(semaphoreVoting, "VoterRegistered")
            .withArgs(0, identityCommitment);
        });

        it("Should reject registration outside registration period", async function () {
          await time.increase(REGISTRATION_DURATION + 1);

          await expect(
            semaphoreVoting.registerVoter(0, 12345)
          ).to.be.revertedWithCustomError(semaphoreVoting, "NotInRegistrationPhase");
        });

        it("Should reject registration for non-existent poll", async function () {
          await expect(
            semaphoreVoting.registerVoter(999, 12345)
          ).to.be.revertedWithCustomError(semaphoreVoting, "PollDoesNotExist");
        });

        it("Should allow multiple registrations", async function () {
          await semaphoreVoting.registerVoter(0, 11111);
          await semaphoreVoting.registerVoter(0, 22222);
          await semaphoreVoting.registerVoter(0, 33333);

          const voterCount = await semaphoreVoting.getRegisteredVoterCount(0);
          expect(voterCount).to.equal(3);
        });
      });

    describe("vote", function () {
        async function deployValidateProofFixture() {
            await loadFixture(deploySemaphoreVotingFixture)

            const members = Array.from({ length: 3 }, (_, i) => new Identity(i.toString())).map(
                ({ commitment }) => commitment
            )
            const merkleTreeDepth = MERKLE_TREE_DEPTH
            const message = 2

            const identity = new Identity("0")
            const group = new Group()

            group.addMember(members[0])

            const proof = await generateProof(identity, group, message, group.root, merkleTreeDepth)

            await semaphoreVoting.createPoll(
                "Test poll",
                ["Option 1", "Option 2", "Option 3"],
                REGISTRATION_DURATION,
                VOTING_DURATION,
                MERKLE_TREE_DEPTH
            )
            await semaphoreVoting.registerVoter(0, identity.commitment)
            await time.increase(REGISTRATION_DURATION + 1)

            return { proof, group }
        }
        const identityCommitment = new Identity("0").commitment;
        const merkleTreeRoot = 99999;
        const nullifier = "6861077843010628185829686827205507386432657129784465342569728589877241230741";
        const voteOption = 0;
        const points = [1, 2, 3, 4, 5, 6, 7, 8];



        it("Should record a vote correctly", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)
            await expect(
                semaphoreVoting.vote(
                    0,
                    voteOption,
                    proof
                )
            )
                .to.emit(semaphoreVoting, "VoteCast")
                .withArgs(0, voteOption, nullifier);

            const results = await semaphoreVoting.getResults(0);
            expect(results[voteOption]).to.equal(1);

            const pollInfo = await semaphoreVoting.getPollInfo(0);
            expect(pollInfo.totalVotes).to.equal(1);
        });

        it("Should reject vote with invalid option", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)

            await expect(
                semaphoreVoting.vote(
                    0,
                    999, // Option that doesn't exist
                    proof
                )
            ).to.be.revertedWithCustomError(semaphoreVoting, "InvalidVoteOption");
        });

        it("Should reject duplicate vote (same nullifier)", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)
            await semaphoreVoting.vote(
                0,
                voteOption,
                proof
            );

            await expect(
                semaphoreVoting.vote(
                    0,
                    voteOption,
                    proof
                )
            ).to.be.revertedWithCustomError(semaphoreVoting, "VoteAlreadyCast");
        });

        it("Should reject vote outside voting period", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)
            await time.increase(VOTING_DURATION + 1);

            await expect(
                semaphoreVoting.vote(
                    0,
                    voteOption,
                    proof
                )
            ).to.be.revertedWithCustomError(semaphoreVoting, "NotInVotingPhase");
        });

        it("Should reject vote during registration period", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)

            // Create new poll and don't advance time
            await semaphoreVoting.createPoll(
                "New poll",
                ["A", "B"],
                REGISTRATION_DURATION,
                VOTING_DURATION,
                MERKLE_TREE_DEPTH
            );

            await expect(
                semaphoreVoting.vote(
                    1,
                    0,
                    proof
                )
            ).to.be.revertedWithCustomError(semaphoreVoting, "NotInVotingPhase");
        });

        it("Should allow multiple votes with different nullifiers", async function () {
            const { proof } = await loadFixture(deployValidateProofFixture)
            await semaphoreVoting.vote(
                0,
                0,
                proof
            );

            await semaphoreVoting.vote(
                0,
                1,
                proof
            );

            const results = await semaphoreVoting.getResults(0);
            expect(results[0]).to.equal(1);
            expect(results[1]).to.equal(1);

            const pollInfo = await semaphoreVoting.getPollInfo(0);
            expect(pollInfo.totalVotes).to.equal(2);
        });
    });

    //   describe("getResults", function () {
    //     beforeEach(async function () {
    //       await semaphoreVoting.createPoll(
    //         "Test poll",
    //         ["A", "B", "C"],
    //         REGISTRATION_DURATION,
    //         VOTING_DURATION,
    //         MERKLE_TREE_DEPTH
    //       );

    //       await semaphoreVoting.registerVoter(0, 12345);
    //       await time.increase(REGISTRATION_DURATION + 1);
    //     });

    //     it("Should return correct results", async function () {
    //       const points = [1, 2, 3, 4, 5, 6, 7, 8];

    //       await semaphoreVoting.vote(0, 0, MERKLE_TREE_DEPTH, 99999, 11111, points);
    //       await semaphoreVoting.vote(0, 0, MERKLE_TREE_DEPTH, 99999, 22222, points);
    //       await semaphoreVoting.vote(0, 1, MERKLE_TREE_DEPTH, 99999, 33333, points);

    //       const results = await semaphoreVoting.getResults(0);
    //       expect(results[0]).to.equal(2);
    //       expect(results[1]).to.equal(1);
    //       expect(results[2]).to.equal(0);
    //     });

    //     it("Should return zeros for poll with no votes", async function () {
    //       const results = await semaphoreVoting.getResults(0);
    //       expect(results).to.deep.equal([0n, 0n, 0n]);
    //     });
    //   });

      describe("getPollPhase", function () {
        beforeEach(async function () {
         await loadFixture(deploySemaphoreVotingFixture)
          await semaphoreVoting.createPoll(
            "Test poll",
            ["A", "B"],
            REGISTRATION_DURATION,
            VOTING_DURATION,
            MERKLE_TREE_DEPTH
          );
        });

        it("Should return 'Registration' during registration period", async function () {
          const phase = await semaphoreVoting.getPollPhase(0);
          expect(phase).to.equal("Registration");
        });

        it("Should return 'Voting' during voting period", async function () {
          await time.increase(REGISTRATION_DURATION + 1);
          const phase = await semaphoreVoting.getPollPhase(0);
          expect(phase).to.equal("Voting");
        });

        it("Should return 'Ended' after completion", async function () {
          await time.increase(REGISTRATION_DURATION + VOTING_DURATION + 1);
          const phase = await semaphoreVoting.getPollPhase(0);
          expect(phase).to.equal("Ended");
        });
      });

    //   describe("Helper Functions", function () {
    //     beforeEach(async function () {
    //       await semaphoreVoting.createPoll(
    //         "Test poll",
    //         ["A", "B"],
    //         REGISTRATION_DURATION,
    //         VOTING_DURATION,
    //         MERKLE_TREE_DEPTH
    //       );
    //     });

    //     it("getMerkleTreeRoot should return tree root", async function () {
    //       const root = await semaphoreVoting.getMerkleTreeRoot(0);
    //       expect(root).to.be.a("bigint");
    //     });

    //     it("getRegisteredVoterCount should return correct count", async function () {
    //       expect(await semaphoreVoting.getRegisteredVoterCount(0)).to.equal(0);

    //       await semaphoreVoting.registerVoter(0, 11111);
    //       expect(await semaphoreVoting.getRegisteredVoterCount(0)).to.equal(1);

    //       await semaphoreVoting.registerVoter(0, 22222);
    //       expect(await semaphoreVoting.getRegisteredVoterCount(0)).to.equal(2);
    //     });

    //     it("isNullifierUsed should return correct status", async function () {
    //       const nullifier = 12345;

    //       expect(await semaphoreVoting.isNullifierUsed(0, nullifier)).to.be.false;

    //       await semaphoreVoting.registerVoter(0, 11111);
    //       await time.increase(REGISTRATION_DURATION + 1);

    //       await semaphoreVoting.vote(
    //         0,
    //         0,
    //         MERKLE_TREE_DEPTH,
    //         99999,
    //         nullifier,
    //         [1, 2, 3, 4, 5, 6, 7, 8]
    //       );

    //       expect(await semaphoreVoting.isNullifierUsed(0, nullifier)).to.be.true;
    //     });
    //   });
});