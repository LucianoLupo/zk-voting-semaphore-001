"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVoting } from "@/hooks/useVoting";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import {
  TREE_DEPTH_OPTIONS,
  DEFAULT_TREE_DEPTH,
  DEFAULT_REGISTRATION_MINUTES,
  DEFAULT_VOTING_MINUTES,
  MIN_POLL_OPTIONS,
  MAX_POLL_OPTIONS,
} from "@/lib/constants";

export default function CreatePollPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { createPoll, isPending } = useVoting();

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [registrationMinutes, setRegistrationMinutes] = useState(DEFAULT_REGISTRATION_MINUTES);
  const [votingMinutes, setVotingMinutes] = useState(DEFAULT_VOTING_MINUTES);
  const [treeDepth, setTreeDepth] = useState(DEFAULT_TREE_DEPTH);

  const addOption = () => {
    if (options.length < MAX_POLL_OPTIONS) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_POLL_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a poll title");
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      return;
    }

    if (options.length < MIN_POLL_OPTIONS) {
      toast.error(`At least ${MIN_POLL_OPTIONS} options required`);
      return;
    }

    try {
      const registrationDuration = registrationMinutes * 60;
      const votingDuration = votingMinutes * 60;

      toast.loading("Creating poll...");

      await createPoll(
        title,
        options,
        registrationDuration,
        votingDuration,
        treeDepth
      );

      toast.dismiss();
      toast.success("Poll created successfully!");

      // Redirect to home page
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      toast.dismiss();
      console.error("Error creating poll:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create poll";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Poll</h1>
        <p className="text-gray-600">
          Create an anonymous poll powered by zero-knowledge proofs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-md">
        {/* Poll Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Poll Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
            placeholder="What should we have for lunch?"
            maxLength={200}
          />
          <p className="mt-1 text-sm text-gray-500">{title.length}/200 characters</p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Voting Options
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
                {options.length > MIN_POLL_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < MAX_POLL_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
            >
              + Add Option
            </button>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {options.length}/{MAX_POLL_OPTIONS} options
          </p>
        </div>

        {/* Durations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Registration Duration (minutes)
            </label>
            <input
              type="number"
              value={registrationMinutes}
              onChange={(e) => setRegistrationMinutes(Number(e.target.value))}
              min={1}
              max={43200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
            />
            <p className="mt-1 text-sm text-gray-500">
              Time for voters to register (1 min - 30 days)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Voting Duration (minutes)
            </label>
            <input
              type="number"
              value={votingMinutes}
              onChange={(e) => setVotingMinutes(Number(e.target.value))}
              min={1}
              max={43200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900"
            />
            <p className="mt-1 text-sm text-gray-500">
              Time for registered voters to vote (1 min - 30 days)
            </p>
          </div>
        </div>

        {/* Tree Depth */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Maximum Voters
          </label>
          <select
            value={treeDepth}
            onChange={(e) => setTreeDepth(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white text-gray-900"
          >
            {TREE_DEPTH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Higher capacity = slower proof generation
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Phase 1: Voters register using their Semaphore identity</li>
                <li>Phase 2: Registered voters submit anonymous votes</li>
                <li>Phase 3: Results are publicly viewable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !address}
            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Creating..." : "Create Poll"}
          </button>
        </div>

        {!address && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to create a poll
          </p>
        )}
      </form>
    </div>
  );
}
