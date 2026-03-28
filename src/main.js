/**
 * Themis v2 — Command Center Orchestrator
 *
 * No step wizard. Three panels always visible:
 * - Left: config panels (data, cost, rules, timing)
 * - Center: visual timeline
 * - Right: stats + export
 *
 * All panels react to shared state changes.
 */

import './style.css';
import { initTheme, setTheme } from './theme.js';
import { loadState, saveState } from './state.js';
import { initDataPanel } from './data-entry.js';
import { initConditionsPanel, buildOptimizerConstraints } from './conditions.js';
import { renderTimeline, renderResultSelector } from './timetable-results.js';
import { renderRightPanel } from './final-export.js';
import { solve, computeScheduleDetails } from './optimizer.js';
import { escapeHTML, getPlayerColor as getPlayerColorUtil, PART_LABELS } from './utils.js';

// ─── Theme ───────────────────────────────────────────────────────
const currentTheme = initTheme();
const themeSwitcher = document.getElementById('theme-switcher');

function updateThemeButtons(active) {
  themeSwitcher.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === active);
  });
}

updateThemeButtons(currentTheme);

themeSwitcher.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-btn');
  if (!btn) return;
  const t = setTheme(btn.dataset.theme);
  updateThemeButtons(t);
  // Re-render arcs on theme change
  if (appState.results) {
    renderRightPanel(rightPanel, appState, onBreaksChanged);
  }
});

// ─── DOM refs ────────────────────────────────────────────────────
const leftPanel = document.getElementById('left-panel');
const centerPanel = document.getElementById('center-panel');
const rightPanel = document.getElementById('right-panel');
const emptyState = document.getElementById('empty-state');
const timelineContainer = document.getElementById('timeline-container');
const timelineBody = document.getElementById('timeline-body');
const timelineControls = document.getElementById('timeline-controls');
const optimizeBar = document.getElementById('optimize-bar');
const optimizeStatus = document.getElementById('optimize-status');
const optimizeBtn = document.getElementById('optimize-btn');

// ─── App State ───────────────────────────────────────────────────
const appState = {
  players: loadState('players', []),
  bands: loadState('bands', []),
  costWeights: loadState('costWeights', [0, 1, 1, 1, 0, 1]),
  rules: loadState('rules', []),
  distinguishGuitar: loadState('distinguishGuitar', true),
  timing: loadState('timing', { minUnit: 5, transitionTime: 5, startTime: '12:00' }),
  // Optimizer results
  results: null,
  selectedResultIndex: 0,
  schedule: null,
  breaks: loadState('breaks', []),
};

function getPlayerColor(name) {
  return getPlayerColorUtil(appState.players, name);
}

export { appState, getPlayerColor };

// ─── State Change Handlers ───────────────────────────────────────

function onDataChanged() {
  updateCenterPanel();
  updateRightPanel();
  document.dispatchEvent(new CustomEvent('themis:dataChanged'));
  // updateOptimizeBar is called via themis:rulesValidated event chain
}

function onConditionsChanged() {
  // Clear previous results when conditions change
  appState.results = null;
  appState.schedule = null;
  appState.selectedResultIndex = 0;
  updateOptimizeBar();
  updateCenterPanel();
  updateRightPanel();
}

function onResultsChanged() {
  updateCenterPanel();
  updateRightPanel();
}

function onBreaksChanged(skipAnim = false) {
  if (appState.schedule) {
    updateCenterPanel(skipAnim);
    updateRightPanel();
  }
}

// ─── Optimize ────────────────────────────────────────────────────

function runOptimize() {
  const bands = appState.bands;
  if (bands.length < 2) {
    showToast('warn', 'バンドが足りません', '最適化するには最低2つのバンドを登録してください。');
    return;
  }

  const constraints = buildOptimizerConstraints(appState.rules);

  optimizeBtn.textContent = '最適化中...';
  optimizeBtn.disabled = true;

  // Use setTimeout to allow UI to update
  setTimeout(() => {
    try {
      const results = solve(bands, {
        distinguishGuitar: appState.distinguishGuitar,
        freeLeave: false,
        costWeights: appState.costWeights,
        constraints,
      }, 8);

      appState.results = results;
      appState.selectedResultIndex = 0;
      appState.breaks = [];
      saveState('breaks', []);

      if (results.length > 0) {
        appState.schedule = computeSchedule(results[0]);
      } else {
        appState.schedule = null;
        showToast('error',
          '解が見つかりません',
          '設定されたルールの組み合わせを満たすタイムテーブルが存在しません。ルールを緩和するか、一部のルールを削除してください。',
          10000,
        );
      }

      onResultsChanged();
    } catch (e) {
      const msg = friendlyError(e.message);
      showToast('error', msg.title, msg.body);
    } finally {
      optimizeBtn.textContent = '最適化を実行';
      optimizeBtn.disabled = false;
    }
  }, 16);
}

function friendlyError(raw) {
  if (raw.includes('Too many bands')) {
    const match = raw.match(/\((\d+)\)/);
    const count = match ? match[1] : '?';
    return {
      title: 'バンド数が多すぎます',
      body: `現在${count}バンドが登録されていますが、最適化できるのは最大20バンドまでです。バンド数を減らすか、不要なデータを削除してください。`,
    };
  }
  return { title: '最適化エラー', body: raw };
}

optimizeBtn.addEventListener('click', runOptimize);

// ─── Schedule Computation ────────────────────────────────────────

import { calculateTimestamps } from './timetable-results.js';

function computeSchedule(result) {
  const details = computeScheduleDetails(
    appState.bands, result.path,
    appState.distinguishGuitar, false, appState.costWeights,
  );

  const schedule = calculateTimestamps(
    details, appState.bands,
    appState.timing.minUnit,
    appState.timing.transitionTime,
    appState.timing.startTime,
  );

  return schedule;
}

export function selectResult(index) {
  if (!appState.results || index >= appState.results.length) return;
  appState.selectedResultIndex = index;
  appState.schedule = computeSchedule(appState.results[index]);
  // Keep breaks — only filter out invalid indices
  appState.breaks = appState.breaks.filter((b) => b.afterIndex < appState.schedule.length - 1);
  saveState('breaks', appState.breaks);
  onResultsChanged();
}

export function recomputeSchedule() {
  if (!appState.results) return;
  const result = appState.results[appState.selectedResultIndex];
  if (!result) return;
  appState.schedule = computeSchedule(result);
  onResultsChanged();
}

// ─── UI Updates ──────────────────────────────────────────────────

function updateOptimizeBar() {
  const bands = appState.bands;
  if (bands.length < 2) {
    optimizeBar.classList.add('hidden');
    return;
  }

  optimizeBar.classList.remove('hidden');
  const ruleCount = appState.rules.length;
  const warnings = appState._ruleWarnings || [];

  if (warnings.length > 0) {
    optimizeBar.classList.add('has-warnings');
    optimizeStatus.innerHTML = `<span class="opt-warn">⚠ ${warnings.length}件の問題があります</span>`;
    optimizeBtn.disabled = true;
    optimizeBtn.title = warnings[0];
  } else {
    optimizeBar.classList.remove('has-warnings');
    optimizeStatus.innerHTML = `<span class="check">✓</span> ${bands.length} bands · ${ruleCount} rules`;
    optimizeBtn.disabled = false;
    optimizeBtn.title = '';
  }
}

function updateCenterPanel(skipAnim = false) {
  const bands = appState.bands;

  if (bands.length === 0) {
    emptyState.classList.remove('hidden');
    timelineContainer.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  timelineContainer.classList.remove('hidden');

  if (appState.results && appState.results.length > 0 && appState.schedule) {
    // Show result selector + timeline
    renderResultSelector(timelineControls, appState);
    renderTimeline(timelineBody, appState, getPlayerColor, onBreaksChanged, skipAnim);
  } else if (bands.length >= 2) {
    // Show unoptimized band list
    timelineControls.innerHTML = '';
    renderUnoptimizedList(timelineBody, bands);
  } else {
    timelineControls.innerHTML = '';
    timelineBody.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-3);font-size:0.8rem;">最低2つのバンドを登録してください。</div>';
  }
}

function renderUnoptimizedList(container, bands) {
  container.innerHTML = bands.map((band, idx) => {
    const members = band.members.map((m, pi) => {
      if (m === 'n/a') return '';
      const color = getPlayerColor(m);
      return `<span class="member-dot" style="color:${color};background:${color}15">${escapeHTML(m)}<span class="part-label">${PART_LABELS[pi]}</span></span>`;
    }).filter(Boolean).join('');

    return `
      <div class="band-card" style="animation: fadeSlide 0.3s ease-out ${idx * 0.04}s both">
        <div class="band-card-inner">
          <div class="band-order">${idx + 1}</div>
          <div class="band-main">
            <div class="band-name">${escapeHTML(band.name)}</div>
            <div class="band-members">${members}</div>
          </div>
          <div class="band-time-col">
            <span class="band-duration">${band.estimatedTime}min</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateRightPanel() {
  renderRightPanel(rightPanel, appState, onBreaksChanged);
}

// ─── Event-based cross-module communication ─────────────────────

document.addEventListener('themis:selectResult', (e) => {
  selectResult(e.detail.index);
});

document.addEventListener('themis:timingChanged', () => {
  recomputeSchedule();
});

document.addEventListener('themis:rulesValidated', (e) => {
  appState._ruleWarnings = e.detail.warnings;
  updateOptimizeBar();
});

// ─── Init Left Panel ─────────────────────────────────────────────

initDataPanel(leftPanel, appState, onDataChanged);
initConditionsPanel(leftPanel, appState, onConditionsChanged, onResultsChanged);

// ─── Initial Render ──────────────────────────────────────────────

updateOptimizeBar();
updateCenterPanel();
updateRightPanel();

// ─── Resizable Sidebars ──────────────────────────────────────────

{
  const layout = document.querySelector('.layout');
  const LEFT_MIN = 240;
  const LEFT_MAX = 480;
  const RIGHT_MIN = 240;
  const RIGHT_MAX = 440;
  const LEFT_DEFAULT = 340;
  const RIGHT_DEFAULT = 320;

  // Restore saved widths
  let leftW = loadState('panelLeftW', LEFT_DEFAULT);
  let rightW = loadState('panelRightW', RIGHT_DEFAULT);
  leftW = Math.max(LEFT_MIN, Math.min(LEFT_MAX, leftW));
  rightW = Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, rightW));
  layout.style.setProperty('--left-w', leftW + 'px');
  layout.style.setProperty('--right-w', rightW + 'px');

  function initResize(handleId, side) {
    const handle = document.getElementById(handleId);
    if (!handle) return;

    let startX, startW;

    function onMouseDown(e) {
      e.preventDefault();
      handle.classList.add('dragging');
      document.body.classList.add('resizing');
      startX = e.clientX;
      startW = side === 'left' ? leftW : rightW;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
      const dx = e.clientX - startX;
      if (side === 'left') {
        leftW = Math.max(LEFT_MIN, Math.min(LEFT_MAX, startW + dx));
        layout.style.setProperty('--left-w', leftW + 'px');
      } else {
        rightW = Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, startW - dx));
        layout.style.setProperty('--right-w', rightW + 'px');
      }
    }

    function onMouseUp() {
      handle.classList.remove('dragging');
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      saveState('panelLeftW', leftW);
      saveState('panelRightW', rightW);
    }

    handle.addEventListener('mousedown', onMouseDown);
  }

  initResize('resize-left', 'left');
  initResize('resize-right', 'right');
}

// ─── Toast Notifications ─────────────────────────────────────────

function showToast(type, title, body, duration = 6000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-title">${escapeHTML(title)}</div>
    ${body ? `<div class="toast-body">${escapeHTML(body)}</div>` : ''}
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);

  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  });
}
