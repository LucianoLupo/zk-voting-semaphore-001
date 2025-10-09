"use client";

import { useState } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof, SemaphoreProof } from "@semaphore-protocol/proof";
import toast from "react-hot-toast";



export function useSemaphore() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const generateVoteProof = async (
    pollId: number,
    voteOption: number,
    identity: Identity,
    groupMembers: bigint[],
    treeDepth: number
  ): Promise<SemaphoreProof | null> => {
    setIsGenerating(true);
    setProgress("Creating Semaphore group...");

    try {
      // Create group from members
      const group = new Group(groupMembers);

      // Verify membership
      setProgress("Verifying group membership...");
      if (!groupMembers.includes(identity.commitment)) {
        throw new Error("Identity not registered for this poll");
      }

      // Generate proof (this is the slow part - 10-30 seconds)
      setProgress("Generating zero-knowledge proof... This may take 20-30 seconds.");

      const proof = await generateProof(
        identity,
        group,
        BigInt(voteOption), // message/signal
        BigInt(pollId) // scope/externalNullifier
      );

      setProgress("Proof generated successfully!");

      return {
        merkleTreeDepth: proof.merkleTreeDepth,
        merkleTreeRoot: proof.merkleTreeRoot,
        message: proof.message,
        nullifier: proof.nullifier,
        scope: proof.scope,
        points: proof.points,
      };
    } catch (error: any) {
      console.error("Proof generation error:", error);
      setProgress("Error generating proof");
      toast.error(error.message || "Failed to generate proof");
      return null;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(""), 2000);
    }
  };

  return {
    generateVoteProof,
    isGenerating,
    progress,
  };
}
