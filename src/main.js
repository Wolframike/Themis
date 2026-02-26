import './style.css';
import { initTheme, setTheme } from './theme.js';
import { loadState, saveState } from './state.js';
import { initDataEntry } from './data-entry.js';
import { initConditions, buildOptimizerConstraints } from './conditions.js';
import { solve } from './optimizer.js';
import { initResultsSelection, initTimingConfig } from './timetable-results.js';
import { initFinalExport } from './final-export.js';

// Theme switcher setup
const themeSwitcher = document.getElementById('theme-switcher');

// Initialize theme
const currentTheme = initTheme();
updateThemeSwitcher(currentTheme);

// Theme switcher buttons
themeSwitcher.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-btn');
  if (!btn) return;
  const theme = btn.dataset.theme;
  const newTheme = setTheme(theme);
  updateThemeSwitcher(newTheme);
});

function updateThemeSwitcher(activeTheme) {
  if (!themeSwitcher) return;
  themeSwitcher.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === activeTheme);
  });
}

// ─── Step Navigation ──────────────────────────────────────────────

const mainEl = document.querySelector('.app-main');

// Shared state across steps
let lastResults = null;
let lastCostWeights = null;
let lastBands = null;
let lastSelected = null;

function showStep1() {
  initDataEntry(mainEl, { onProceed: showStep2 });
}

function showStep2() {
  const players = loadState('players', []);
  const bands = loadState('bands', []);

  if (bands.length < 2) {
    alert('タイムテーブルを生成するには、最低2つのバンドが必要です。');
    return;
  }

  initConditions(mainEl, players, bands, showStep1);
}

function showStep3(costWeights, rules) {
  const bands = loadState('bands', []);
  lastBands = bands;
  lastCostWeights = costWeights;

  // Build optimizer constraints from UI rules
  const constraints = buildOptimizerConstraints(rules);

  // Run the optimizer
  try {
    lastResults = solve(bands, {
      distinguishGuitar: true,
      freeLeave: false,
      costWeights,
      constraints,
    }, 5);
  } catch (e) {
    alert(`最適化エラー: ${e.message}`);
    return;
  }

  initResultsSelection(mainEl, lastResults, bands, costWeights, showStep2, showStep4);
}

function showStep4(selected) {
  lastSelected = selected;
  const bands = lastBands || loadState('bands', []);
  const costWeights = lastCostWeights;

  initTimingConfig(
    mainEl,
    selected.details,
    bands,
    selected.cost,
    () => {
      // Back to step 3 — re-run with same params
      if (lastResults && lastCostWeights) {
        initResultsSelection(mainEl, lastResults, bands, lastCostWeights, showStep2, showStep4);
      } else {
        showStep2();
      }
    },
    (schedule) => {
      // Save schedule for Step 5
      saveState('schedule', schedule);
      showStep5(schedule);
    },
  );
}

function showStep5(schedule) {
  const timing = loadState('timing', { minUnit: 5, transitionTime: 5, startTime: '12:00' });

  const bands = lastBands || loadState('bands', []);
  initFinalExport(mainEl, schedule, timing, () => {
    // Back to step 4 — re-use cached selected result
    if (lastSelected) {
      showStep4(lastSelected);
    } else {
      showStep2();
    }
  }, bands);
}

// Listen for generate event from conditions UI
document.addEventListener('themis:generate', (e) => {
  const { costWeights, rules } = e.detail;
  showStep3(costWeights, rules);
});

// Listen for schedule ready event (alternative entry to Step 5)
document.addEventListener('themis:scheduleReady', (e) => {
  const { schedule } = e.detail;
  showStep5(schedule);
});

// Start at Step 1
showStep1();
