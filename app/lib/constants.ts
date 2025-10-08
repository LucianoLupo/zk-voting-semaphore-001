export const TREE_DEPTH_OPTIONS = [
  { value: 16, label: "65,536 voters (depth 16)", maxVoters: 65536 },
  { value: 20, label: "1,048,576 voters (depth 20)", maxVoters: 1048576 },
  { value: 24, label: "16,777,216 voters (depth 24)", maxVoters: 16777216 },
  { value: 32, label: "4,294,967,295 voters (depth 32)", maxVoters: 4294967295 },
] as const;

export const DEFAULT_TREE_DEPTH = 20;
export const DEFAULT_REGISTRATION_HOURS = 24;
export const DEFAULT_VOTING_HOURS = 48;

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

export const POLL_PHASES = {
  REGISTRATION: "Registration",
  VOTING: "Voting",
  ENDED: "Ended",
} as const;

export const STORAGE_KEYS = {
  IDENTITY: "semaphore-identity",
  REGISTERED_POLLS: "registered-polls",
} as const;
