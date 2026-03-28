/**
 * Conditions Panel for Themis v2.
 * Cost weights, rules, timing — all as collapsible panels in the left rail.
 */

import { saveState, loadState } from './state.js';
import { escapeHTML, PART_LABELS } from './utils.js';
import { DEFAULT_COST_WEIGHTS } from './optimizer.js';

const DEFAULT_WEIGHTS = DEFAULT_COST_WEIGHTS;

const RULE_TYPES = {
  BAND_POSITION: 'bandPosition',
  BAND_ORDER: 'bandOrder',
  PLAYER_APPEARANCE: 'playerAppearance',
  CONSECUTIVE_LIMIT: 'consecutiveLimit',
  BAND_ADJACENCY: 'bandAdjacency',
  APPEARANCE_SPAN: 'appearanceSpan',
};

/**
 * Initialize conditions panels (cost, rules, timing).
 */
export function initConditionsPanel(container, appState, onConditionsChanged, onTimingChanged) {
  // ─── Cost Panel ────────────────────────────────────────────────
  const costSection = document.createElement('div');
  costSection.className = 'panel-section open';
  costSection.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon cost">⚖</span>
        <span class="panel-title">転換コスト</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-help" style="margin-bottom:0.5rem">パートごとのメンバー交代コスト（0〜3）</div>
      <div class="cost-mini-grid" id="cost-grid">
        ${PART_LABELS.map((label, i) => `
          <div class="cost-cell">
            <span class="cost-cell-label">${label}</span>
            <input type="number" min="0" max="3" value="${appState.costWeights[i]}" data-idx="${i}" class="cost-weight-input" />
          </div>
        `).join('')}
      </div>
      <div style="margin-top:0.6rem">
        <label class="p-toggle-wrap">
          <input type="checkbox" class="p-toggle-input" id="distinguish-guitar" ${appState.distinguishGuitar ? 'checked' : ''} />
          <span class="p-toggle-track"></span>
          <span class="p-toggle-text">ギターを区別する</span>
        </label>
      </div>
    </div>
  `;

  costSection.querySelector('.panel-header').addEventListener('click', () => {
    costSection.classList.toggle('open');
  });

  // Cost weight inputs
  costSection.querySelectorAll('.cost-weight-input').forEach((input) => {
    const handler = () => {
      let val = parseInt(input.value, 10);
      const idx = parseInt(input.dataset.idx, 10);
      if (isNaN(val)) val = DEFAULT_WEIGHTS[idx];
      val = Math.max(0, Math.min(3, val));
      input.value = val;
      appState.costWeights[idx] = val;
      saveState('costWeights', appState.costWeights);
      onConditionsChanged();
    };
    input.addEventListener('change', handler);
    input.addEventListener('blur', handler);
    input.addEventListener('focus', () => input.select());
  });

  // Guitar toggle
  costSection.querySelector('#distinguish-guitar').addEventListener('change', (e) => {
    appState.distinguishGuitar = e.target.checked;
    saveState('distinguishGuitar', appState.distinguishGuitar);
    onConditionsChanged();
  });

  container.appendChild(costSection);

  // ─── Rules Panel ───────────────────────────────────────────────
  const rulesSection = document.createElement('div');
  rulesSection.className = 'panel-section';
  rulesSection.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon rules">⚑</span>
        <span class="panel-title">ルール</span>
        <span class="panel-badge" id="rules-count-badge">${appState.rules.length} rules</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-row">
        <label class="p-label">ルール種類</label>
        <select class="p-select" id="rule-type-select">
          <option value="${RULE_TYPES.BAND_POSITION}">バンドの配置指定</option>
          <option value="${RULE_TYPES.BAND_ORDER}">バンドの順序指定</option>
          <option value="${RULE_TYPES.PLAYER_APPEARANCE}">メンバーの出演位置</option>
          <option value="${RULE_TYPES.CONSECUTIVE_LIMIT}">連続出演制限</option>
          <option value="${RULE_TYPES.BAND_ADJACENCY}">バンドの隣接指定</option>
          <option value="${RULE_TYPES.APPEARANCE_SPAN}">出演スパン制限</option>
        </select>
      </div>
      <div id="rule-config"></div>
      <div class="p-row p-inline" style="margin-top:0.3rem">
        <button class="p-btn p-btn-accent p-btn-sm" id="add-rule-btn">ルールを追加</button>
      </div>
      <div id="rule-error"></div>
      <div id="rules-list" style="margin-top:0.5rem"></div>
      <div id="rules-validation" style="margin-top:0.4rem"></div>
    </div>
  `;

  rulesSection.querySelector('.panel-header').addEventListener('click', () => {
    rulesSection.classList.toggle('open');
  });

  const ruleTypeSelect = rulesSection.querySelector('#rule-type-select');
  const ruleConfigArea = rulesSection.querySelector('#rule-config');
  const addRuleBtn = rulesSection.querySelector('#add-rule-btn');
  const ruleErrorEl = rulesSection.querySelector('#rule-error');
  const rulesList = rulesSection.querySelector('#rules-list');
  const rulesCountBadge = rulesSection.querySelector('#rules-count-badge');
  const validationArea = rulesSection.querySelector('#rules-validation');

  // Edit state: index of rule being edited, or -1
  let editingIndex = -1;

  function updateRulesBadge() {
    rulesCountBadge.textContent = `${appState.rules.length} rules`;
  }

  function setBuilderMode(mode) {
    if (mode === 'edit') {
      addRuleBtn.textContent = '保存';
      addRuleBtn.dataset.mode = 'edit';
      // Show cancel button
      let cancelBtn = rulesSection.querySelector('#cancel-edit-btn');
      if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.className = 'p-btn p-btn-sm';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.addEventListener('click', () => {
          cancelEdit();
        });
        addRuleBtn.parentElement.appendChild(cancelBtn);
      }
      cancelBtn.classList.remove('hidden');
    } else {
      addRuleBtn.textContent = 'ルールを追加';
      addRuleBtn.dataset.mode = 'add';
      const cancelBtn = rulesSection.querySelector('#cancel-edit-btn');
      if (cancelBtn) cancelBtn.classList.add('hidden');
    }
  }

  function cancelEdit() {
    editingIndex = -1;
    setBuilderMode('add');
    ruleErrorEl.innerHTML = '';
    renderConfig();
    rerenderRules();
  }

  function renderConfig() {
    renderRuleConfig(ruleConfigArea, ruleTypeSelect.value, appState.bands, appState.players);
    wirePositionClamping(ruleConfigArea, appState.bands.length);
  }

  ruleTypeSelect.addEventListener('change', () => {
    // If switching type while editing, cancel the edit
    if (editingIndex >= 0) cancelEdit();
    renderConfig();
  });
  renderConfig();

  // Re-render config when bands/players change (so dropdowns stay current)
  document.addEventListener('themis:dataChanged', () => {
    renderConfig();
    runValidation();
  });

  function rerenderRules() {
    renderRulesList(rulesList, appState.rules, editingIndex, {
      onDelete(idx) {
        // If deleting the rule we're editing, cancel edit
        if (editingIndex === idx) cancelEdit();
        else if (editingIndex > idx) editingIndex--;
        appState.rules.splice(idx, 1);
        saveState('rules', appState.rules);
        updateRulesBadge();
        rerenderRules();
        runValidation();
        onConditionsChanged();
      },
      onEdit(idx) {
        editingIndex = idx;
        const rule = appState.rules[idx];
        ruleTypeSelect.value = rule.type;
        renderConfig();
        populateRuleConfig(ruleConfigArea, rule);
        setBuilderMode('edit');
        rerenderRules();
      },
    });
    updateRulesBadge();
  }

  addRuleBtn.addEventListener('click', () => {
    ruleErrorEl.innerHTML = '';
    const result = readRuleConfig(ruleConfigArea, ruleTypeSelect.value, appState.bands, appState.players, appState.rules, editingIndex);
    if (result && result.error) {
      ruleErrorEl.innerHTML = `<div class="rule-error-msg">${escapeHTML(result.error)}</div>`;
      return;
    }
    if (!result) return;

    if (editingIndex >= 0) {
      // Save edit: replace the rule in place
      appState.rules[editingIndex] = result;
      editingIndex = -1;
      setBuilderMode('add');
    } else {
      appState.rules.push(result);
    }

    saveState('rules', appState.rules);
    renderConfig();
    rerenderRules();
    runValidation();
    onConditionsChanged();
  });

  // ─── Rule Validation ───────────────────────────────────────────
  function runValidation() {
    const warnings = validateRules(appState.rules, appState.bands);
    document.dispatchEvent(new CustomEvent('themis:rulesValidated', { detail: { warnings } }));
  }

  rerenderRules();
  setBuilderMode('add');
  // Run initial validation
  runValidation();

  container.appendChild(rulesSection);

  // ─── Timing Panel ──────────────────────────────────────────────
  const timingSection = document.createElement('div');
  timingSection.className = 'panel-section';
  timingSection.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon time">◷</span>
        <span class="panel-title">タイミング</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-row">
        <label class="p-label">開始時刻</label>
        <input class="p-input" type="time" id="timing-start" value="${appState.timing.startTime}" style="font-family:var(--font-mono)" />
      </div>
      <div class="p-row">
        <label class="p-label">転換時間（分）</label>
        <input class="p-input" type="number" id="timing-transition" value="${appState.timing.transitionTime}" min="0" style="width:70px;font-family:var(--font-mono)" />
      </div>
      <div class="p-row">
        <label class="p-label">最小時間単位（分）</label>
        <input class="p-input" type="number" id="timing-unit" value="${appState.timing.minUnit}" min="1" style="width:70px;font-family:var(--font-mono)" />
        <div class="p-help">全ての時刻をこの分数の倍数に丸めます<br>（例: 5 → 12:03は12:05に）</div>
      </div>
    </div>
  `;

  timingSection.querySelector('.panel-header').addEventListener('click', () => {
    timingSection.classList.toggle('open');
  });

  function saveTiming() {
    const minUnit = parseInt(timingSection.querySelector('#timing-unit').value, 10) || 5;
    const transitionTime = parseInt(timingSection.querySelector('#timing-transition').value, 10) || 5;
    const startTime = timingSection.querySelector('#timing-start').value || '12:00';
    appState.timing = { minUnit, transitionTime, startTime };
    saveState('timing', appState.timing);
  }

  ['#timing-start', '#timing-transition', '#timing-unit'].forEach((sel) => {
    timingSection.querySelector(sel).addEventListener('change', () => {
      saveTiming();
      document.dispatchEvent(new CustomEvent('themis:timingChanged'));
    });
  });

  container.appendChild(timingSection);
}

// ─── Rule Config Rendering ──────────────────────────────────────

function renderRuleConfig(container, ruleType, bands, players) {
  const bandOpts = bands.map((b, i) => `<option value="${i}">${escapeHTML(b.name)}</option>`).join('');
  const playerOpts = players.map((p) => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');

  switch (ruleType) {
    case RULE_TYPES.BAND_POSITION:
      container.innerHTML = `
        <div class="rule-builder-row">
          <select id="rc-band" class="p-select">${bandOpts}</select>
          <span>は</span>
          <input type="number" id="rc-position" class="p-input p-input-narrow" min="1" max="${bands.length}" value="1" />
          <span>番目</span>
          <select id="rc-pos-mode" class="p-select">
            <option value="exactly">ちょうど</option>
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;
      break;
    case RULE_TYPES.BAND_ORDER:
      container.innerHTML = `
        <div class="rule-builder-row">
          <select id="rc-band-a" class="p-select">${bandOpts}</select>
          <span>は</span>
          <select id="rc-band-b" class="p-select">${bandOpts}</select>
          <span>の</span>
          <select id="rc-order-dir" class="p-select">
            <option value="before">前</option>
            <option value="after">後</option>
          </select>
        </div>
      `;
      break;
    case RULE_TYPES.PLAYER_APPEARANCE:
      container.innerHTML = `
        <div class="rule-builder-row">
          <select id="rc-player" class="p-select">${playerOpts}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="p-input p-input-narrow" min="1" max="${bands.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="p-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;
      break;
    case RULE_TYPES.CONSECUTIVE_LIMIT:
      container.innerHTML = `
        <div class="rule-builder-row">
          <span>同一メンバー連続最大</span>
          <input type="number" id="rc-consec-limit" class="p-input p-input-narrow" min="1" max="${bands.length}" value="2" />
          <span>バンド</span>
        </div>
        <div id="consec-warning" class="rule-warning" style="display:none;">
          1に設定すると、解が見つからない場合があります。
        </div>
      `;
      {
        const cInput = container.querySelector('#rc-consec-limit');
        const cWarn = container.querySelector('#consec-warning');
        if (cInput && cWarn) {
          cInput.addEventListener('input', () => {
            cWarn.style.display = parseInt(cInput.value, 10) === 1 ? '' : 'none';
          });
        }
      }
      break;
    case RULE_TYPES.BAND_ADJACENCY:
      container.innerHTML = `
        <div class="rule-builder-row">
          <select id="rc-adj-band-a" class="p-select">${bandOpts}</select>
          <span>を</span>
          <select id="rc-adj-band-b" class="p-select">${bandOpts}</select>
          <span>の</span>
          <select id="rc-adj-dir" class="p-select">
            <option value="rightBefore">直前</option>
            <option value="rightAfter">直後</option>
          </select>
          <span>に</span>
        </div>
      `;
      break;

    case RULE_TYPES.APPEARANCE_SPAN:
      container.innerHTML = `
        <div class="rule-builder-row">
          <select id="rc-span-player" class="p-select">${playerOpts}</select>
          <span>の最初の出演から最後の出演までは</span>
          <input type="number" id="rc-span-limit" class="p-input p-input-narrow" min="1" max="${bands.length}" value="3" />
          <span>バンド以内</span>
        </div>
      `;
      break;
  }
}

function populateRuleConfig(container, rule) {
  switch (rule.type) {
    case RULE_TYPES.BAND_POSITION: {
      const bandSel = container.querySelector('#rc-band');
      const modeSel = container.querySelector('#rc-pos-mode');
      const posInput = container.querySelector('#rc-position');
      if (bandSel) bandSel.value = String(rule.bandIndex);
      if (modeSel) modeSel.value = rule.mode;
      if (posInput) posInput.value = rule.position;
      break;
    }
    case RULE_TYPES.BAND_ORDER: {
      const bandASel = container.querySelector('#rc-band-a');
      const bandBSel = container.querySelector('#rc-band-b');
      const dirSel = container.querySelector('#rc-order-dir');
      if (bandASel) bandASel.value = String(rule.before);
      if (bandBSel) bandBSel.value = String(rule.after);
      if (dirSel) dirSel.value = 'before';
      break;
    }
    case RULE_TYPES.PLAYER_APPEARANCE: {
      const playerSel = container.querySelector('#rc-player');
      const modeSel = container.querySelector('#rc-appear-mode');
      const posInput = container.querySelector('#rc-appear-pos');
      if (playerSel) playerSel.value = rule.player;
      if (modeSel) modeSel.value = rule.mode;
      if (posInput) posInput.value = rule.position;
      break;
    }
    case RULE_TYPES.CONSECUTIVE_LIMIT: {
      const input = container.querySelector('#rc-consec-limit');
      if (input) input.value = rule.limit;
      break;
    }
    case RULE_TYPES.BAND_ADJACENCY: {
      const bandASel = container.querySelector('#rc-adj-band-a');
      const bandBSel = container.querySelector('#rc-adj-band-b');
      const dirSel = container.querySelector('#rc-adj-dir');
      if (bandASel) bandASel.value = String(rule.bandA);
      if (bandBSel) bandBSel.value = String(rule.bandB);
      if (dirSel) dirSel.value = rule.direction;
      break;
    }
    case RULE_TYPES.APPEARANCE_SPAN: {
      const playerSel = container.querySelector('#rc-span-player');
      const limitInput = container.querySelector('#rc-span-limit');
      if (playerSel) playerSel.value = rule.player;
      if (limitInput) limitInput.value = rule.spanLimit;
      break;
    }
  }
}

function readRuleConfig(container, ruleType, bands, players, existingRules, editingIndex) {
  const n = bands.length;

  // Only block rules that are self-evidently nonsensical within the rule itself.
  // Cross-rule interactions and data-dependent feasibility are handled by
  // validateRules (warnings) and the solver (post-optimization empty result).

  switch (ruleType) {
    case RULE_TYPES.BAND_POSITION: {
      const bandIdx = parseInt(container.querySelector('#rc-band')?.value, 10);
      const mode = container.querySelector('#rc-pos-mode')?.value;
      const pos = parseInt(container.querySelector('#rc-position')?.value, 10);
      if (isNaN(bandIdx) || isNaN(pos) || pos < 1) return null;
      if (pos > n) return { error: `${pos}番目は存在しません（バンドは${n}つ）。` };
      return { type: RULE_TYPES.BAND_POSITION, bandIndex: bandIdx, bandName: bands[bandIdx]?.name || '', mode, position: pos };
    }
    case RULE_TYPES.BAND_ORDER: {
      const bandA = parseInt(container.querySelector('#rc-band-a')?.value, 10);
      const bandB = parseInt(container.querySelector('#rc-band-b')?.value, 10);
      const dir = container.querySelector('#rc-order-dir')?.value;
      if (isNaN(bandA) || isNaN(bandB)) return null;
      if (bandA === bandB) return { error: '同じバンドを指定することはできません。' };
      const before = dir === 'before' ? bandA : bandB;
      const after = dir === 'before' ? bandB : bandA;
      return { type: RULE_TYPES.BAND_ORDER, before, after, beforeName: bands[before]?.name || '', afterName: bands[after]?.name || '' };
    }
    case RULE_TYPES.PLAYER_APPEARANCE: {
      const player = container.querySelector('#rc-player')?.value;
      const mode = container.querySelector('#rc-appear-mode')?.value;
      const pos = parseInt(container.querySelector('#rc-appear-pos')?.value, 10);
      if (!player || isNaN(pos) || pos < 1) return null;
      return { type: RULE_TYPES.PLAYER_APPEARANCE, player, mode, position: pos };
    }
    case RULE_TYPES.CONSECUTIVE_LIMIT: {
      const limit = parseInt(container.querySelector('#rc-consec-limit')?.value, 10);
      if (isNaN(limit) || limit < 1) return null;
      return { type: RULE_TYPES.CONSECUTIVE_LIMIT, limit };
    }
    case RULE_TYPES.BAND_ADJACENCY: {
      const bandA = parseInt(container.querySelector('#rc-adj-band-a')?.value, 10);
      const bandB = parseInt(container.querySelector('#rc-adj-band-b')?.value, 10);
      const direction = container.querySelector('#rc-adj-dir')?.value;
      if (isNaN(bandA) || isNaN(bandB)) return null;
      if (bandA === bandB) return { error: '同じバンドを指定することはできません。' };
      return { type: RULE_TYPES.BAND_ADJACENCY, bandA, bandB, bandAName: bands[bandA]?.name || '', bandBName: bands[bandB]?.name || '', direction };
    }
    case RULE_TYPES.APPEARANCE_SPAN: {
      const player = container.querySelector('#rc-span-player')?.value;
      const spanLimit = parseInt(container.querySelector('#rc-span-limit')?.value, 10);
      if (!player || isNaN(spanLimit) || spanLimit < 1) return null;
      return { type: RULE_TYPES.APPEARANCE_SPAN, player, spanLimit };
    }
  }
  return null;
}

// ─── Rules List ──────────────────────────────────────────────────

function renderRulesList(container, rules, editingIndex, callbacks) {
  if (rules.length === 0) {
    container.innerHTML = '<div style="font-size:0.68rem;color:var(--text-3)">ルールなし — デフォルトで最適化</div>';
    return;
  }

  container.innerHTML = rules.map((r, i) => {
    const isEditing = i === editingIndex;
    return `
      <div class="rule-chip ${isEditing ? 'rule-editing' : ''}" data-index="${i}">
        <span class="rule-chip-text">${describeRule(r)}</span>
        <span class="rule-chip-actions">
          ${isEditing
            ? '<span class="rule-editing-label">編集中</span>'
            : `<button type="button" class="rule-edit-btn" data-index="${i}" title="編集">✎</button>`
          }
          <button type="button" class="x" data-index="${i}" title="削除">✕</button>
        </span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.x').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onDelete(parseInt(btn.dataset.index, 10));
    });
  });

  container.querySelectorAll('.rule-edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      callbacks.onEdit(parseInt(btn.dataset.index, 10));
    });
  });
}

function describeRule(rule) {
  switch (rule.type) {
    case RULE_TYPES.BAND_POSITION:
      if (rule.mode === 'exactly') return `${escapeHTML(rule.bandName)} → ${rule.position}番目`;
      if (rule.mode === 'after') return `${escapeHTML(rule.bandName)} → ${rule.position}番目以降`;
      return `${escapeHTML(rule.bandName)} → ${rule.position}番目以前`;
    case RULE_TYPES.BAND_ORDER:
      return `${escapeHTML(rule.beforeName)} → ${escapeHTML(rule.afterName)}の前`;
    case RULE_TYPES.PLAYER_APPEARANCE:
      return `${escapeHTML(rule.player)} → ${rule.position}番目${rule.mode === 'before' ? '以前' : '以降'}`;
    case RULE_TYPES.CONSECUTIVE_LIMIT:
      return `連続制限: 最大${rule.limit}バンド`;
    case RULE_TYPES.BAND_ADJACENCY:
      return `${escapeHTML(rule.bandAName)} → ${escapeHTML(rule.bandBName)}の${rule.direction === 'rightBefore' ? '直前' : '直後'}`;
    case RULE_TYPES.APPEARANCE_SPAN:
      return `${escapeHTML(rule.player)} → 出演スパン${rule.spanLimit}バンド以内`;
    default:
      return '不明なルール';
  }
}

// ─── Rule Validation ─────────────────────────────────────────────

/**
 * Validate rules for contradictions and impossibilities.
 * Returns an array of warning strings (empty = all good).
 */
export function validateRules(rules, bands) {
  const warnings = [];
  const n = bands.length;
  if (n === 0) return warnings;

  // Only flag things that are PROVABLY impossible — direct contradictions
  // between exactly 2 rules that no permutation can satisfy.
  // Everything else is left to the solver.

  // Band count hard limit (memory/compute wall, not a heuristic)
  if (n > 20) {
    warnings.push(`バンドが${n}つ登録されていますが、最適化できるのは最大20バンドです。`);
  }

  // Same band fixed to 2 different positions
  const fixedPos = new Map();
  const posOccupied = new Map();
  for (const rule of rules) {
    if (rule.type !== RULE_TYPES.BAND_POSITION || rule.mode !== 'exactly') continue;
    if (fixedPos.has(rule.bandIndex)) {
      const prev = fixedPos.get(rule.bandIndex);
      if (prev !== rule.position) {
        warnings.push(`「${rule.bandName}」が${prev}番目と${rule.position}番目の両方に固定されています。`);
      }
    }
    fixedPos.set(rule.bandIndex, rule.position);

    if (!posOccupied.has(rule.position)) posOccupied.set(rule.position, new Map());
    posOccupied.get(rule.position).set(rule.bandIndex, rule.bandName);
  }

  // 2 different bands at same exact position
  for (const [pos, bandMap] of posOccupied) {
    if (bandMap.size > 1) {
      warnings.push(`${pos}番目に複数のバンド（${[...bandMap.values()].join('、')}）が固定されています。`);
    }
  }

  // Direct ordering cycle: A before B AND B before A
  const orderEdges = rules.filter((r) => r.type === RULE_TYPES.BAND_ORDER);
  for (const a of orderEdges) {
    for (const b of orderEdges) {
      if (a.before === b.after && a.after === b.before) {
        warnings.push(`「${bands[a.before]?.name}」と「${bands[a.after]?.name}」が互いに相手の前に配置するよう指定されています（矛盾）。`);
      }
    }
  }

  return warnings;
}

// ─── Optimizer Constraint Builder ────────────────────────────────

export function buildOptimizerConstraints(uiRules) {
  const constraints = {
    fixedLast: null,
    rules: [],
    fixedPositions: [],
    bandOrdering: [],
    playerAppearance: [],
    consecutiveLimit: null,
    bandAdjacency: [],
    appearanceSpan: [],
  };

  for (const rule of uiRules) {
    switch (rule.type) {
      case RULE_TYPES.BAND_POSITION:
        if (rule.mode === 'exactly') {
          constraints.fixedPositions.push({ bandIndex: rule.bandIndex, exactPosition: rule.position });
        } else if (rule.mode === 'after') {
          constraints.rules.push({ bandIndex: rule.bandIndex, minPosition: rule.position, requiredBefore: [] });
        } else {
          constraints.rules.push({ bandIndex: rule.bandIndex, maxPosition: rule.position, requiredBefore: [] });
        }
        break;
      case RULE_TYPES.BAND_ORDER:
        constraints.bandOrdering.push({ before: rule.before, after: rule.after });
        break;
      case RULE_TYPES.PLAYER_APPEARANCE:
        constraints.playerAppearance.push({ player: rule.player, position: rule.position, mode: rule.mode });
        break;
      case RULE_TYPES.CONSECUTIVE_LIMIT:
        if (constraints.consecutiveLimit === null || rule.limit < constraints.consecutiveLimit) {
          constraints.consecutiveLimit = rule.limit;
        }
        break;
      case RULE_TYPES.BAND_ADJACENCY: {
        const before = rule.direction === 'rightBefore' ? rule.bandA : rule.bandB;
        const after = rule.direction === 'rightBefore' ? rule.bandB : rule.bandA;
        constraints.bandAdjacency.push({ before, after });
        break;
      }
      case RULE_TYPES.APPEARANCE_SPAN:
        constraints.appearanceSpan.push({ player: rule.player, spanLimit: rule.spanLimit });
        break;
    }
  }

  return constraints;
}

function wirePositionClamping(container, maxPos) {
  const inputs = container.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    const handler = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > maxPos && maxPos > 0) val = maxPos;
      input.value = val;
    };
    input.addEventListener('blur', handler);
    input.addEventListener('change', handler);
  });
}

