"use client";

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { VOTING_ADDRESS, VOTING_ABI } from "@/lib/contracts";
import { useState } from "react";
import toast from "react-hot-toast";
import { SemaphoreProof } from "@semaphore-protocol/proof";

export function useVoting() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const createPoll = async (
    title: string,
    options: string[],
    registrationDuration: number,
    votingDuration: number,
    treeDepth: number
  ) => {
    try {
      const txHash = await writeContractAsync({
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
        functionName: "createPoll",
        args: [title, options, BigInt(registrationDuration), BigInt(votingDuration), BigInt(treeDepth)],
      });
      return txHash;
    } catch (error: any) {
      console.error("Create poll error:", error);
      throw error;
    }
  };

  const registerVoter = async (pollId: number, commitment: bigint) => {
    try {
      const txHash = await writeContractAsync({
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
        functionName: "registerVoter",
        args: [BigInt(pollId), commitment],
      });
      return txHash;
    } catch (error: any) {
      console.error("Register voter error:", error);
      throw error;
    }
  };

  const submitVote = async (
    pollId: number,
    voteOption: number,
    proof: SemaphoreProof
  ) => {
    try {
      const txHash = await writeContractAsync({
        address: VOTING_ADDRESS,
        abi: VOTING_ABI,
        functionName: "vote",
        args: [
          BigInt(pollId),
          BigInt(voteOption),
          proof,
        ],
      });
      return txHash;
    } catch (error: any) {
      console.error("Submit vote error:", error);
      throw error;
    }
  };

  return {
    createPoll,
    registerVoter,
    submitVote,
    isPending,
    isConfirming,
  };
}

export function usePollInfo(pollId: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)],
    query: {
      enabled: pollId >= 0,
      refetchInterval: 10000, // Refresh every 10s
    },
  });

  return {
    pollInfo: data,
    isLoading,
    error,
    refetch,
  };
}

export function usePollPhase(pollId: number) {
  const { data, isLoading } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getPollPhase",
    args: [BigInt(pollId)],
    query: {
      enabled: pollId >= 0,
      refetchInterval: 5000,
    },
  });

  return {
    phase: data as string | undefined,
    isLoading,
  };
}

export function usePollResults(pollId: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getResults",
    args: [BigInt(pollId)],
    query: {
      enabled: pollId >= 0,
      refetchInterval: 5000,
    },
  });

  return {
    results: data as readonly bigint[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

export function usePollCount() {
  const { data, isLoading, refetch } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: "pollCount",
    query: {
      refetchInterval: 10000,
    },
  });

  return {
    pollCount: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
}

export function useMerkleTreeRoot(pollId: number) {
  const { data } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: "getMerkleTreeRoot",
    args: [BigInt(pollId)],
    query: {
      enabled: pollId >= 0,
    },
  });

  return data as bigint | undefined;
}
