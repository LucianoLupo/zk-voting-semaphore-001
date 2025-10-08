"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { usePollInfo, usePollPhase, usePollResults, useVoting } from "@/hooks/useVoting";
import { useIdentity } from "@/hooks/useIdentity";
import { useSemaphore } from "@/hooks/useSemaphore";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";

export default function PollPage() {
  const params = useParams();
  const pollId = Number(params.id);
  const { address } = useAccount();

  const { pollInfo, isLoading: loadingPoll } = usePollInfo(pollId);
  const { phase, isLoading: loadingPhase } = usePollPhase(pollId);
  const { results, isLoading: loadingResults } = usePollResults(pollId);
  const { identity, isRegisteredForPoll, addRegisteredPoll, hasIdentity } = useIdentity();
  const { registerVoter, submitVote } = useVoting();
  const { generateVoteProof, isGenerating, progress } = useSemaphore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [registering, setRegistering] = useState(false);
  const [voting, setVoting] = useState(false);

  if (loadingPoll || loadingPhase) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!pollInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Poll not found</h1>
      </div>
    );
  }

  const pollData = pollInfo as readonly [string, readonly string[], bigint, bigint, bigint, string, bigint];
  const title = pollData[0];
  const options = pollData[1];
  const registrationEndTime = pollData[3];
  const votingEndTime = pollData[4];
  const totalVotes = pollData[6];
  const isRegistered = isRegisteredForPoll(pollId);

  const handleRegister = async () => {
    if (!identity) {
      toast.error("Please generate an identity first");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setRegistering(true);

    try {
      toast.loading("Registering...");
      await registerVoter(pollId, identity.commitment);
      toast.dismiss();
      toast.success("Registered successfully!");
      addRegisteredPoll(pollId);
    } catch (error) {
      toast.dismiss();
      console.error("Registration failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      toast.error("Please select an option");
      return;
    }

    if (!identity) {
      toast.error("Please generate an identity first");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setVoting(true);

    try {
      // Note: In a real implementation, you'd fetch group members from the contract
      // For now, we'll use a mock implementation
      toast("Generating zero-knowledge proof... This may take 20-30 seconds", {
        icon: "⏳",
        duration: 30000,
      });

      // Mock group members - in production, fetch from contract events or indexer
      const groupMembers = [identity.commitment];

      const proof = await generateVoteProof(
        pollId,
        selectedOption,
        identity,
        groupMembers,
        20 // tree depth - should fetch from contract
      );

      if (!proof) {
        throw new Error("Failed to generate proof");
      }

      toast.dismiss();
      toast.loading("Submitting vote...");

      await submitVote(
        pollId,
        selectedOption,
        proof.merkleTreeDepth,
        BigInt(proof.merkleTreeRoot),
        BigInt(proof.nullifier),
        proof.points.map(p => BigInt(p))
      );

      toast.dismiss();
      toast.success("Vote submitted successfully! 🎉");
      setSelectedOption(null);
    } catch (error) {
      toast.dismiss();
      console.error("Voting failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Voting failed";
      toast.error(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const regEndTimestamp = Number(registrationEndTime);
  const voteEndTimestamp = Number(votingEndTime);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>

        {/* Phase Badge */}
        <div className="flex items-center gap-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              phase === "Registration"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : phase === "Voting"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {phase}
          </span>
          <span className="text-sm text-gray-600">
            {phase === "Registration"
              ? `Ends ${new Date(regEndTimestamp * 1000).toLocaleString()}`
              : phase === "Voting"
              ? `Ends ${new Date(voteEndTimestamp * 1000).toLocaleString()}`
              : "Poll Ended"}
          </span>
        </div>
      </div>

      {/* Registration Phase */}
      {phase === "Registration" && (
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Voter Registration</h2>

          {!hasIdentity ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 mb-4">
                You need a Semaphore identity to register. Click &quot;Generate Identity&quot; in the header.
              </p>
            </div>
          ) : isRegistered ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-800 font-semibold">
                  ✓ You are registered for this poll
                </p>
              </div>
              <p className="text-green-700 mt-2 text-sm">
                You can vote once the voting phase starts.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-6">
                Register your Semaphore identity to participate in this poll. Your identity will be added to the voter group anonymously.
              </p>
              <button
                onClick={handleRegister}
                disabled={registering || !address}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {registering ? "Registering..." : "Register to Vote"}
              </button>
              {!address && (
                <p className="text-sm text-red-600 mt-2">
                  Please connect your wallet to register
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voting Phase */}
      {phase === "Voting" && (
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>

          {!hasIdentity ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                You need a Semaphore identity to vote. Generate one in the header.
              </p>
            </div>
          ) : !isRegistered ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                You need to be registered to vote. Registration has ended for this poll.
              </p>
            </div>
          ) : (
            <div>
              {/* Proof Generation Progress */}
              {isGenerating && (
                <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <p className="font-semibold text-purple-900">{progress}</p>
                  </div>
                  <p className="text-sm text-purple-700">
                    Please wait while we generate your zero-knowledge proof...
                  </p>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3 mb-6">
                {options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOption === index
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                    } ${(voting || isGenerating) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="vote"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      disabled={voting || isGenerating}
                      className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-4 text-lg font-medium text-gray-900">
                      {option}
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleVote}
                disabled={selectedOption === null || voting || isGenerating || !address}
                className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {voting ? "Submitting Vote..." : isGenerating ? "Generating Proof..." : "Submit Vote"}
              </button>

              {!address && (
                <p className="text-sm text-red-600 mt-3 text-center">
                  Please connect your wallet to vote
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {phase === "Ended" ? "Final Results" : "Current Results"}
        </h2>

        {loadingResults ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {options.map((option: string, index: number) => {
              const voteCount = Number(results[index] || 0);
              const total = Number(totalVotes);
              const percentage = total > 0 ? (voteCount / total) * 100 : 0;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900 text-lg">{option}</span>
                    <div className="text-right">
                      <span className="font-bold text-2xl text-purple-600">{voteCount}</span>
                      <span className="text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-gray-200 mt-6">
              <p className="text-gray-600 text-center">
                Total Votes: <span className="font-bold text-gray-900">{Number(totalVotes)}</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No votes yet</p>
        )}
      </div>
    </div>
  );
}
