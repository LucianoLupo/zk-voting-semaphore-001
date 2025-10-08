import votingAbi from "./abi.json";

export const VOTING_ADDRESS = (process.env.NEXT_PUBLIC_VOTING_ADDRESS || "") as `0x${string}`;
export const SEMAPHORE_ADDRESS = (process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS || "") as `0x${string}`;

export const VOTING_ABI = votingAbi as const;
