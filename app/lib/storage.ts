import { STORAGE_KEYS } from "./constants";

export interface StoredIdentity {
  identityString: string;
  createdAt: number;
  registeredPolls: number[];
}

export const storage = {
  // Identity management
  saveIdentity: (identity: StoredIdentity): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.IDENTITY, JSON.stringify(identity));
    }
  },

  loadIdentity: (): StoredIdentity | null => {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem(STORAGE_KEYS.IDENTITY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse stored identity:", error);
      return null;
    }
  },

  clearIdentity: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.IDENTITY);
    }
  },

  addRegisteredPoll: (pollId: number): void => {
    if (typeof window === "undefined") return;

    const stored = storage.loadIdentity();
    if (!stored) return;

    if (!stored.registeredPolls.includes(pollId)) {
      stored.registeredPolls.push(pollId);
      storage.saveIdentity(stored);
    }
  },

  isRegisteredForPoll: (pollId: number): boolean => {
    const stored = storage.loadIdentity();
    return stored ? stored.registeredPolls.includes(pollId) : false;
  },

  // Export identity as downloadable JSON
  exportIdentity: (identity: StoredIdentity): void => {
    const blob = new Blob([JSON.stringify(identity, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semaphore-identity-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import identity from file
  importIdentity: (file: File): Promise<StoredIdentity> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") {
            throw new Error("Invalid file content");
          }
          const identity: StoredIdentity = JSON.parse(result);

          // Validate structure
          if (!identity.identityString || !identity.createdAt) {
            throw new Error("Invalid identity file structure");
          }

          resolve(identity);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },
};
