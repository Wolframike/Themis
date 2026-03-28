/**
 * Theme management for Themis v2.
 */

import { saveState, loadState } from './state.js';

const THEME_KEY = 'theme';
const VALID_THEMES = ['dark', 'light'];

function getSystemPreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const saved = loadState(THEME_KEY);
  const theme = VALID_THEMES.includes(saved) ? saved : getSystemPreference();
  applyTheme(theme);
  return theme;
}

export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return initTheme();
  applyTheme(theme);
  saveState(THEME_KEY, theme);
  return theme;
}
