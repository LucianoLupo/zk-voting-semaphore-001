"use client";

import Link from "next/link";
import { usePollCount, usePollInfo, usePollPhase } from "@/hooks/useVoting";

export default function HomePage() {
  const { pollCount, isLoading } = usePollCount();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pollIds = Array.from({ length: pollCount }, (_, i) => i);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Active Polls</h1>
          <p className="text-gray-600">
            Vote anonymously with zero-knowledge proofs
          </p>
        </div>
        <Link
          href="/create"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
        >
          Create New Poll
        </Link>
      </div>

      {/* Polls Grid */}
      {pollCount === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No polls yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to create an anonymous poll!
          </p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Create First Poll
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pollIds.map((id) => (
            <PollCard key={id} pollId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({ pollId }: { pollId: number }) {
  const { pollInfo, isLoading } = usePollInfo(pollId);
  const { phase } = usePollPhase(pollId);

  if (isLoading || !pollInfo) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const pollData = pollInfo as readonly [string, readonly string[], bigint, bigint, bigint, string, bigint];
  const title = pollData[0];
  const options = pollData[1];
  const totalVotes = pollData[6];

  const phaseColors = {
    Registration: "bg-blue-100 text-blue-800 border-blue-200",
    Voting: "bg-green-100 text-green-800 border-green-200",
    Ended: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Link
      href={`/poll/${pollId}`}
      className="block p-6 bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-purple-300 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
          {title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            phaseColors[phase as keyof typeof phaseColors] || phaseColors.Ended
          }`}
        >
          {phase}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
          </svg>
          {options.length} options
        </div>

        {phase === "Ended" && (
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {Number(totalVotes)} votes cast
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-4 border-t border-gray-100">
        <span className="text-purple-600 font-semibold text-sm group-hover:text-purple-700">
          {phase === "Registration"
            ? "Register to Vote →"
            : phase === "Voting"
            ? "Cast Your Vote →"
            : "View Results →"}
        </span>
      </div>
    </Link>
  );
}
