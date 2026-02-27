/**
 * Conditions UI for Themis — Step 2.
 *
 * Manages:
 * - Per-instrument transition cost weights (0-3)
 * - Band placement rules (fixed position, ordering)
 * - Player appearance rules (all appearances before/after X)
 * - Persists all config to localStorage
 */

import { saveState, loadState } from './state.js';

const STATE_COST_WEIGHTS = 'costWeights';
const STATE_RULES = 'rules';
const STATE_DISTINGUISH_GUITAR = 'distinguishGuitar';

const PART_LABELS = ['Vo.', 'L.Gt', 'B.Gt', 'Ba.', 'Dr.', 'Key.'];
const DEFAULT_WEIGHTS = [0, 1, 1, 1, 0, 1];

const RULE_TYPES = {
  BAND_POSITION: 'bandPosition',
  BAND_ORDER: 'bandOrder',
  PLAYER_APPEARANCE: 'playerAppearance',
};

/**
 * Initialize the conditions UI.
 * @param {HTMLElement} container - The .app-main element
 * @param {string[]} players - List of player names
 * @param {Array<{name: string, members: string[], estimatedTime: number}>} bands - Band data
 * @param {function} onBack - Callback to go back to Step 1
 */
export function initConditions(container, players, bands, onBack) {
  const savedWeights = loadState(STATE_COST_WEIGHTS, [...DEFAULT_WEIGHTS]);
  const savedRules = loadState(STATE_RULES, []);
  const savedDistinguishGuitar = loadState(STATE_DISTINGUISH_GUITAR, true);

  let costWeights = savedWeights.length === 6 ? savedWeights : [...DEFAULT_WEIGHTS];
  let rules = savedRules;
  let distinguishGuitar = savedDistinguishGuitar;

  container.innerHTML = buildConditionsHTML(costWeights, bands, rules, distinguishGuitar);

  // --- Back button ---
  container.querySelector('#back-to-step1').addEventListener('click', onBack);

  // --- Cost weights ---
  const weightInputs = container.querySelectorAll('.cost-weight-input');
  weightInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      const val = parseInt(input.value, 10);
      costWeights[i] = isNaN(val) ? DEFAULT_WEIGHTS[i] : Math.max(0, Math.min(3, val));
      input.value = costWeights[i];
      saveState(STATE_COST_WEIGHTS, costWeights);
    });
  });

  // --- Distinguish Guitar toggle ---
  const guitarToggle = container.querySelector('#distinguish-guitar');
  guitarToggle.addEventListener('change', () => {
    distinguishGuitar = guitarToggle.checked;
    saveState(STATE_DISTINGUISH_GUITAR, distinguishGuitar);
  });

  // --- Add Rule ---
  const ruleTypeSelect = container.querySelector('#rule-type');
  const addRuleBtn = container.querySelector('#add-rule-btn');
  const rulesList = container.querySelector('#rules-list');
  const ruleConfigArea = container.querySelector('#rule-config');

  ruleTypeSelect.addEventListener('change', () => {
    renderRuleConfig(ruleConfigArea, ruleTypeSelect.value, bands, players);
    wirePositionClamping(ruleConfigArea, bands.length);
  });
  // Initial render
  renderRuleConfig(ruleConfigArea, ruleTypeSelect.value, bands, players);
  wirePositionClamping(ruleConfigArea, bands.length);

  function onRuleSave() {
    saveState(STATE_RULES, rules);
  }

  function onRuleEdit(idx) {
    const rule = rules[idx];
    // Remove from list
    rules.splice(idx, 1);
    saveState(STATE_RULES, rules);
    // Populate builder with rule values
    ruleTypeSelect.value = rule.type;
    renderRuleConfig(ruleConfigArea, rule.type, bands, players);
    wirePositionClamping(ruleConfigArea, bands.length);
    populateRuleConfig(ruleConfigArea, rule);
    rerenderRules();
  }

  function rerenderRules() {
    renderRulesList(rulesList, rules, bands, players, onRuleSave, onRuleEdit);
  }

  // Error display for rule validation
  let ruleErrorEl = container.querySelector('#rule-error');
  if (!ruleErrorEl) {
    ruleErrorEl = document.createElement('p');
    ruleErrorEl.id = 'rule-error';
    ruleErrorEl.className = 'rule-error-msg';
    addRuleBtn.parentNode.insertBefore(ruleErrorEl, addRuleBtn.nextSibling);
  }

  addRuleBtn.addEventListener('click', () => {
    ruleErrorEl.textContent = '';
    const result = readRuleConfig(ruleConfigArea, ruleTypeSelect.value, bands, players);
    if (result && result.error) {
      ruleErrorEl.textContent = result.error;
      return;
    }
    if (!result) return;
    rules.push(result);
    saveState(STATE_RULES, rules);
    rerenderRules();
  });

  rerenderRules();

  // --- Proceed button ---
  const proceedBtn = container.querySelector('#proceed-to-generate');
  proceedBtn.addEventListener('click', () => {
    // Dispatch custom event with conditions data
    const event = new CustomEvent('themis:generate', {
      detail: { costWeights, rules, distinguishGuitar },
    });
    document.dispatchEvent(event);
  });
}

/**
 * Get current saved conditions.
 * @returns {{ costWeights: number[], rules: Array }}
 */
export function getSavedConditions() {
  return {
    costWeights: loadState(STATE_COST_WEIGHTS, [...DEFAULT_WEIGHTS]),
    rules: loadState(STATE_RULES, []),
  };
}

// ─── HTML Template ────────────────────────────────────────────────

function buildConditionsHTML(costWeights, bands, rules, distinguishGuitar) {
  return `
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-step1" class="btn btn-secondary">\u2190 Step 1 に戻る</button>
        <h2 class="section-title section-title-inline">Step 2: 条件設定</h2>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">転換コスト（楽器別）</h3>
        <p class="subsection-desc">
          各楽器の転換コスト（0〜3）を設定してください。<br>
          デフォルト: Vo.=0, Dr.=0（変更コスト無し）、その他=1
        </p>
        <div class="cost-grid">
          ${PART_LABELS.map(
            (label, i) => `
            <div class="cost-item">
              <label class="cost-label">${label}</label>
              <input type="number" class="form-input cost-weight-input" min="0" max="3" value="${costWeights[i]}" />
            </div>
          `,
          ).join('')}
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ギター区別</h3>
        <label class="toggle-label">
          <input type="checkbox" id="distinguish-guitar" class="toggle-checkbox" ${distinguishGuitar ? 'checked' : ''} />
          <span class="toggle-switch"></span>
          <span class="toggle-text">リードギターとバッキングギターを区別する</span>
        </label>
        <p class="subsection-desc toggle-desc">
          <strong>ON:</strong> L.Gt と B.Gt は別々のパートとして扱います。同じ人がリードギターからバッキングギターに移動した場合、転換コストが発生します。<br>
          <strong>OFF:</strong> L.Gt と B.Gt を区別しません。同じ人がどちらのギターパートを担当しても転換コストが発生しません（例: バンドAではリードギター、バンドBではバッキングギターでもコスト0）。
        </p>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ルール</h3>
        <p class="subsection-desc">
          条件を追加しない場合、全楽器コスト1（Vo.除く）のデフォルト設定で最適化されます。
        </p>

        <div class="rule-builder">
          <div class="form-row">
            <label class="form-label">
              ルール種類
              <select id="rule-type" class="form-select">
                <option value="${RULE_TYPES.BAND_POSITION}">バンドの配置指定</option>
                <option value="${RULE_TYPES.BAND_ORDER}">バンドの順序指定</option>
                <option value="${RULE_TYPES.PLAYER_APPEARANCE}">メンバーの出演位置</option>
              </select>
            </label>
          </div>
          <div id="rule-config" class="rule-config-area"></div>
          <button type="button" id="add-rule-btn" class="btn btn-primary">ルールを追加</button>
        </div>

        <div id="rules-list" class="rules-list"></div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="proceed-to-generate" class="btn btn-accent">\u2192 タイムテーブル生成</button>
      </div>
    </section>
  `;
}

// ─── Rule Config Rendering ────────────────────────────────────────

function renderRuleConfig(container, ruleType, bands, players) {
  const bandOpts = bands.map((b, i) => `<option value="${i}">${escapeHTML(b.name)}</option>`).join('');
  const playerOpts = players.map((p) => `<option value="${escapeHTML(p)}">${escapeHTML(p)}</option>`).join('');

  switch (ruleType) {
    case RULE_TYPES.BAND_POSITION:
      container.innerHTML = `
        <div class="form-row-sentence">
          <select id="rc-band" class="form-select">${bandOpts}</select>
          <span>は</span>
          <input type="number" id="rc-position" class="form-input form-input-narrow" min="1" max="${bands.length}" value="1" />
          <span>番目</span>
          <select id="rc-pos-mode" class="form-select">
            <option value="exactly">ちょうど</option>
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
        </div>
      `;
      break;

    case RULE_TYPES.BAND_ORDER:
      container.innerHTML = `
        <div class="form-row-sentence">
          <select id="rc-band-a" class="form-select">${bandOpts}</select>
          <span>の演奏は</span>
          <select id="rc-band-b" class="form-select">${bandOpts}</select>
          <span>の</span>
          <select id="rc-order-dir" class="form-select">
            <option value="before">前</option>
            <option value="after">後</option>
          </select>
        </div>
      `;
      break;

    case RULE_TYPES.PLAYER_APPEARANCE:
      container.innerHTML = `
        <div class="form-row-sentence">
          <select id="rc-player" class="form-select">${playerOpts}</select>
          <span>の出演は全て</span>
          <input type="number" id="rc-appear-pos" class="form-input form-input-narrow" min="1" max="${bands.length}" value="1" />
          <span>番目</span>
          <select id="rc-appear-mode" class="form-select">
            <option value="after">以降</option>
            <option value="before">以前</option>
          </select>
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
      // Populate as "A の演奏は B の 前" (A plays before B)
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
  }
}

function readRuleConfig(container, ruleType, bands, players) {
  switch (ruleType) {
    case RULE_TYPES.BAND_POSITION: {
      const bandIdx = parseInt(container.querySelector('#rc-band').value, 10);
      const mode = container.querySelector('#rc-pos-mode').value;
      const pos = parseInt(container.querySelector('#rc-position').value, 10);
      if (isNaN(bandIdx) || isNaN(pos) || pos < 1) return null;
      return {
        type: RULE_TYPES.BAND_POSITION,
        bandIndex: bandIdx,
        bandName: bands[bandIdx]?.name || '',
        mode, // 'exactly' or 'before' (meaning at or before)
        position: pos,
      };
    }
    case RULE_TYPES.BAND_ORDER: {
      const bandA = parseInt(container.querySelector('#rc-band-a').value, 10);
      const bandB = parseInt(container.querySelector('#rc-band-b').value, 10);
      const dir = container.querySelector('#rc-order-dir').value;
      if (isNaN(bandA) || isNaN(bandB)) return null;
      if (bandA === bandB) return { error: '同じバンドを指定することはできません。' };
      // dir="before" → A plays before B; dir="after" → A plays after B
      const before = dir === 'before' ? bandA : bandB;
      const after = dir === 'before' ? bandB : bandA;
      return {
        type: RULE_TYPES.BAND_ORDER,
        before,
        after,
        beforeName: bands[before]?.name || '',
        afterName: bands[after]?.name || '',
      };
    }
    case RULE_TYPES.PLAYER_APPEARANCE: {
      const player = container.querySelector('#rc-player').value;
      const mode = container.querySelector('#rc-appear-mode').value;
      const pos = parseInt(container.querySelector('#rc-appear-pos').value, 10);
      if (!player || isNaN(pos) || pos < 1) return null;
      return {
        type: RULE_TYPES.PLAYER_APPEARANCE,
        player,
        mode,
        position: pos,
      };
    }
  }
  return null;
}

// ─── Rules List Rendering ─────────────────────────────────────────

function renderRulesList(container, rules, bands, players, onDelete, onEdit) {
  if (rules.length === 0) {
    container.innerHTML = '<p class="text-muted">ルールが設定されていません。デフォルト設定で最適化されます。</p>';
    return;
  }

  container.innerHTML = rules
    .map((r, i) => `
      <div class="rule-item" data-index="${i}">
        <span class="rule-text">${describeRule(r)}</span>
        <span class="rule-edit-hint">クリックで編集</span>
        <button type="button" class="btn-icon btn-delete-rule" data-index="${i}" title="\u524A\u9664">\u2715</button>
      </div>
    `)
    .join('');

  container.querySelectorAll('.btn-delete-rule').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      rules.splice(idx, 1);
      onDelete();
      renderRulesList(container, rules, bands, players, onDelete, onEdit);
    });
  });

  if (onEdit) {
    container.querySelectorAll('.rule-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-rule')) return;
        const idx = parseInt(item.dataset.index, 10);
        onEdit(idx);
      });
    });
  }
}

function describeRule(rule) {
  switch (rule.type) {
    case RULE_TYPES.BAND_POSITION:
      if (rule.mode === 'exactly') {
        return `「${escapeHTML(rule.bandName)}」は ${rule.position} 番目ちょうど`;
      }
      if (rule.mode === 'after') {
        return `「${escapeHTML(rule.bandName)}」は ${rule.position} 番目以降`;
      }
      return `「${escapeHTML(rule.bandName)}」は ${rule.position} 番目以前`;
    case RULE_TYPES.BAND_ORDER:
      return `「${escapeHTML(rule.beforeName)}」の演奏は「${escapeHTML(rule.afterName)}」の前`;
    case RULE_TYPES.PLAYER_APPEARANCE:
      if (rule.mode === 'before') {
        return `${escapeHTML(rule.player)} の出演は全て ${rule.position} 番目以前`;
      }
      return `${escapeHTML(rule.player)} の出演は全て ${rule.position} 番目以降`;
    default:
      return '不明なルール';
  }
}

/**
 * Convert UI rules into optimizer constraint format.
 * @param {Array} uiRules - Rules from the conditions UI
 * @returns {Object} constraints object for optimizer.solve()
 */
export function buildOptimizerConstraints(uiRules) {
  const constraints = {
    fixedLast: null,
    rules: [],
    fixedPositions: [],
    bandOrdering: [],
    playerAppearance: [],
  };

  for (const rule of uiRules) {
    switch (rule.type) {
      case RULE_TYPES.BAND_POSITION:
        if (rule.mode === 'exactly') {
          constraints.fixedPositions.push({
            bandIndex: rule.bandIndex,
            exactPosition: rule.position,
          });
        } else if (rule.mode === 'after') {
          // 'after' means at or after this position → minPosition
          constraints.rules.push({
            bandIndex: rule.bandIndex,
            minPosition: rule.position,
            requiredBefore: [],
          });
        } else {
          // 'before' means at or before this position → maxPosition
          constraints.rules.push({
            bandIndex: rule.bandIndex,
            maxPosition: rule.position,
            requiredBefore: [],
          });
        }
        break;

      case RULE_TYPES.BAND_ORDER:
        constraints.bandOrdering.push({
          before: rule.before,
          after: rule.after,
        });
        break;

      case RULE_TYPES.PLAYER_APPEARANCE:
        constraints.playerAppearance.push({
          player: rule.player,
          position: rule.position,
          mode: rule.mode,
        });
        break;
    }
  }

  return constraints;
}

/**
 * Wire blur/change clamping on position number inputs inside the rule config area.
 */
function wirePositionClamping(container, maxPos) {
  const inputs = container.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    const handler = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > maxPos) val = maxPos;
      input.value = val;
    };
    input.addEventListener('blur', handler);
    input.addEventListener('change', handler);
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
