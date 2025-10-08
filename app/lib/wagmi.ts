"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const config = getDefaultConfig({
  appName: "ZK Voting dApp",
  projectId,
  chains: [baseSepolia, mainnet],
  ssr: true,
});
