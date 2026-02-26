/**
 * localStorage-backed state management for Themis.
 *
 * Provides a simple get/set/delete API with JSON serialization,
 * namespaced under a common key prefix.
 */

const PREFIX = 'themis_';

/**
 * Save a value to localStorage.
 * @param {string} key
 * @param {*} value - will be JSON-serialized
 */
export function saveState(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

/**
 * Load a value from localStorage.
 * @param {string} key
 * @param {*} defaultValue - returned if key does not exist
 * @returns {*}
 */
export function loadState(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Remove a value from localStorage.
 * @param {string} key
 */
export function removeState(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Ignore
  }
}

/**
 * Clear all Themis-namespaced state.
 */
export function clearAllState() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
