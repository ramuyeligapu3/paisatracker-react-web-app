// Notifier for global API loading state (used by axios interceptors + ApiLoadingProvider)
const listeners = new Set();

export function addApiLoadingListener(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notifyApiLoading(delta) {
  listeners.forEach((cb) => cb(delta));
}
