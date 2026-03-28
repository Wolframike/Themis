/**
 * Shared utilities for Themis v2.
 */

export const PART_LABELS = ['Vo.', 'L.Gt', 'B.Gt', 'Ba.', 'Dr.', 'Key.'];

export const MEMBER_COLORS = [
  'var(--m1)', 'var(--m2)', 'var(--m3)', 'var(--m4)', 'var(--m5)',
  'var(--m6)', 'var(--m7)', 'var(--m8)', 'var(--m9)', 'var(--m10)',
];

export function escapeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function parseTimeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function formatMinutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getPlayerColor(players, name) {
  const idx = players.indexOf(name);
  if (idx >= 0) return MEMBER_COLORS[idx % MEMBER_COLORS.length];
  return 'var(--text-2)';
}

export function buildBreakMap(breaks) {
  const map = new Map();
  for (const b of breaks) map.set(b.afterIndex, b.duration);
  return map;
}
