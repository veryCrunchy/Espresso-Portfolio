import type { PreMIDActivity } from '#shared/types/premid';

interface ActivityStore {
  activity: PreMIDActivity | null
  updatedAt: number
}

// In-memory store — persists for the lifetime of the server process.
// Activity is automatically considered stale after 20 minutes (per PreMID spec).
const store: ActivityStore = { activity: null, updatedAt: 0 };

const TIMEOUT_MS = 20 * 60 * 1000;

export function setPreMIDActivity(activity: PreMIDActivity | null) {
  store.activity = activity;
  store.updatedAt = Date.now();
}

export function getPreMIDActivity(): PreMIDActivity | null {
  if (!store.activity) return null;
  if (Date.now() - store.updatedAt > TIMEOUT_MS) {
    store.activity = null;
    return null;
  }
  return store.activity;
}
