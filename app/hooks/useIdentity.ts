"use client";

import { useState, useEffect, useCallback } from "react";
import { Identity } from "@semaphore-protocol/identity";
import { storage, StoredIdentity } from "@/lib/storage";
import toast from "react-hot-toast";

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [registeredPolls, setRegisteredPolls] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load identity from localStorage on mount
  useEffect(() => {
    const stored = storage.loadIdentity();
    if (stored) {
      try {
        const loadedIdentity = new Identity(stored.identityString);
        setIdentity(loadedIdentity);
        setRegisteredPolls(stored.registeredPolls || []);
      } catch (error) {
        console.error("Failed to load identity:", error);
        toast.error("Failed to load identity");
      }
    }
    setIsLoading(false);
  }, []);

  const generateIdentity = useCallback(() => {
    try {
      const newIdentity = new Identity();
      const storedData: StoredIdentity = {
        identityString: newIdentity.toString(),
        createdAt: Date.now(),
        registeredPolls: [],
      };

      storage.saveIdentity(storedData);
      setIdentity(newIdentity);
      setRegisteredPolls([]);

      toast.success("Identity generated successfully!");

      // Trigger download immediately
      setTimeout(() => {
        exportIdentity();
        toast("⚠️ Backup saved! Keep this file safe.", { icon: "💾" });
      }, 500);

      return newIdentity;
    } catch (error) {
      console.error("Failed to generate identity:", error);
      toast.error("Failed to generate identity");
      return null;
    }
  }, []);

  const exportIdentity = useCallback(() => {
    const stored = storage.loadIdentity();
    if (!stored) {
      toast.error("No identity to export");
      return;
    }

    try {
      storage.exportIdentity(stored);
      toast.success("Identity exported!");
    } catch (error) {
      console.error("Failed to export identity:", error);
      toast.error("Failed to export identity");
    }
  }, []);

  const importIdentity = useCallback(async (file: File) => {
    try {
      const imported = await storage.importIdentity(file);
      const loadedIdentity = new Identity(imported.identityString);

      storage.saveIdentity(imported);
      setIdentity(loadedIdentity);
      setRegisteredPolls(imported.registeredPolls || []);

      toast.success("Identity imported successfully!");
      return loadedIdentity;
    } catch (error) {
      console.error("Failed to import identity:", error);
      toast.error("Failed to import identity. Please check the file.");
      return null;
    }
  }, []);

  const clearIdentity = useCallback(() => {
    if (!confirm("Are you sure you want to delete your identity? This cannot be undone!")) {
      return;
    }

    storage.clearIdentity();
    setIdentity(null);
    setRegisteredPolls([]);
    toast.success("Identity cleared");
  }, []);

  const addRegisteredPoll = useCallback((pollId: number) => {
    storage.addRegisteredPoll(pollId);
    setRegisteredPolls((prev) => {
      if (prev.includes(pollId)) return prev;
      return [...prev, pollId];
    });
  }, []);

  const isRegisteredForPoll = useCallback(
    (pollId: number) => {
      return registeredPolls.includes(pollId);
    },
    [registeredPolls]
  );

  return {
    identity,
    registeredPolls,
    isLoading,
    generateIdentity,
    exportIdentity,
    importIdentity,
    clearIdentity,
    addRegisteredPoll,
    isRegisteredForPoll,
    hasIdentity: !!identity,
    commitment: identity?.commitment,
  };
}
