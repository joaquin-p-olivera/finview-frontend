// localStorage can throw (private mode, storage full) or hold stale JSON from
// an older version, so every read and write is best effort.
const PREFIX = "finview.";

export const readJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key, value) => {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // Nothing else to do: the app keeps working from memory.
  }
};

// Clears cached server data. Keys in `keep` (the outbox of unsent writes)
// stay.
export const clearAll = (keep = ["outbox"]) => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX) && !keep.includes(key.slice(PREFIX.length)))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Best effort.
  }
};

export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16)
      );
