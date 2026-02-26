/**
 * Theme management — Multiple theme support.
 * Supports: dark, light, cyber.
 * Defaults to user's system preference (dark/light), falling back to dark.
 * Persists choice via the state module.
 */

import { saveState, loadState } from './state.js';

const THEME_KEY = 'theme';
const VALID_THEMES = ['dark', 'light', 'cyber'];

/**
 * Detect the user's preferred color scheme.
 * @returns {'dark'|'light'}
 */
function getSystemPreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/**
 * Apply the given theme to the document.
 * @param {string} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Initialize theme from saved state or system preference.
 * @returns {string} the active theme
 */
export function initTheme() {
  const saved = loadState(THEME_KEY);
  const theme = VALID_THEMES.includes(saved) ? saved : getSystemPreference();
  applyTheme(theme);
  return theme;
}

/**
 * Set a specific theme.
 * @param {string} theme - one of VALID_THEMES
 * @returns {string} the new active theme
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return initTheme();
  applyTheme(theme);
  saveState(THEME_KEY, theme);
  return theme;
}

/**
 * Get the list of valid theme names.
 * @returns {string[]}
 */
export function getThemes() {
  return [...VALID_THEMES];
}
