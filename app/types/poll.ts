export interface Poll {
  id: number;
  title: string;
  options: string[];
  startTime: bigint;
  registrationEndTime: bigint;
  votingEndTime: bigint;
  admin: string;
  totalVotes: bigint;
}

export interface PollResults {
  pollId: number;
  voteCounts: bigint[];
  totalVotes: bigint;
  options: string[];
}

export type PollPhase = "Registration" | "Voting" | "Ended";

export interface CreatePollFormData {
  title: string;
  options: string[];
  registrationHours: number;
  votingHours: number;
  treeDepth: number;
}
