"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useIdentity } from "@/hooks/useIdentity";

export default function Header() {
  const { identity, generateIdentity, exportIdentity, hasIdentity, importIdentity } = useIdentity();

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await importIdentity(file);
    e.target.value = ""; // Reset input
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                ZK Voting
              </span>
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Polls
              </Link>
              <Link
                href="/create"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Create Poll
              </Link>
            </nav>
          </div>

          {/* Identity & Wallet */}
          <div className="flex items-center gap-4">
            {/* Identity Manager */}
            {hasIdentity ? (
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Identity</span>
                  <span className="text-sm font-mono text-gray-700">
                    {identity?.commitment.toString().slice(0, 10)}...
                  </span>
                </div>
                <button
                  onClick={exportIdentity}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  title="Export identity backup"
                >
                  Export
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={generateIdentity}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Generate Identity
                </button>
                <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Wallet Connect */}
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex gap-4 mt-4 pt-4 border-t">
          <Link
            href="/"
            className="flex-1 text-center py-2 text-gray-700 hover:text-purple-600 font-medium"
          >
            Polls
          </Link>
          <Link
            href="/create"
            className="flex-1 text-center py-2 text-gray-700 hover:text-purple-600 font-medium"
          >
            Create
          </Link>
        </nav>
      </div>
    </header>
  );
}
