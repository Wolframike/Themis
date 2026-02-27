/**
 * Data Entry UI for Themis — Step 1.
 *
 * Manages:
 * - Entry mode choice (Manual / Spreadsheet) as top-level decision
 * - Player name list (tag-input in manual mode, auto-detected in paste mode)
 * - Band entry (manual form with part dropdowns + spreadsheet paste)
 * - Persists all data to localStorage via state.js
 */

import { saveState, loadState } from './state.js';
import { parseSpreadsheet } from './spreadsheet-parser.js';

const STATE_PLAYERS = 'players';
const STATE_BANDS = 'bands';
const STATE_EMPTY_INDICATOR = 'emptyIndicator';
const STATE_ENTRY_MODE = 'entryMode';

const PART_LABELS = ['Vo.', 'L.Gt', 'B.Gt', 'Ba.', 'Dr.', 'Key.'];
const PART_KEYS = ['vocal', 'leadGuitar', 'backingGuitar', 'bass', 'drums', 'keyboard'];

/**
 * Initialize the data entry UI. Call once on page load.
 * @param {HTMLElement} container - The .app-main element
 * @param {Object} [options]
 * @param {function} [options.onProceed] - Callback when user proceeds to Step 2
 */
export function initDataEntry(container, options = {}) {
  const { onProceed } = options;
  // Load saved state
  const savedPlayers = loadState(STATE_PLAYERS, []);
  const savedBands = loadState(STATE_BANDS, []);
  const savedEmpty = loadState(STATE_EMPTY_INDICATOR, 'n/a');
  const savedMode = loadState(STATE_ENTRY_MODE, 'manual');

  // Render the full data entry UI
  container.innerHTML = buildDataEntryHTML(savedEmpty, savedMode);

  // State
  let players = savedPlayers;
  let bands = savedBands;

  // --- Tab switching (top-level entry mode) ---
  const tabManual = container.querySelector('#tab-manual');
  const tabPaste = container.querySelector('#tab-paste');

  wireTabSwitching(container, (mode) => {
    saveState(STATE_ENTRY_MODE, mode);
  });

  // --- Player Tag Input (Manual Mode) ---
  const playerInput = container.querySelector('#player-tag-input');
  const playerChips = container.querySelector('#player-chips');

  renderPlayerChips(playerChips, players);

  playerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = playerInput.value.trim();
      if (name && !players.includes(name)) {
        players.push(name);
        saveState(STATE_PLAYERS, players);
        renderPlayerChips(playerChips, players);
        refreshAllDropdowns(container, players);
      }
      playerInput.value = '';
    }
  });

  // Wire chip deletion (delegated)
  playerChips.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.chip-delete');
    if (!delBtn) return;
    const name = delBtn.dataset.name;
    players = players.filter((p) => p !== name);
    saveState(STATE_PLAYERS, players);
    renderPlayerChips(playerChips, players);
    refreshAllDropdowns(container, players);
  });

  // --- Band Manual Entry ---
  const bandForm = container.querySelector('#band-form');
  const bandTableBody = container.querySelector('#band-table-body');

  renderBandTable(bandTableBody, bands, players, container);
  refreshAllDropdowns(container, players);

  bandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = readBandForm(bandForm);
    if (!formData) return;

    bands.push(formData);
    saveState(STATE_BANDS, bands);
    renderBandTable(bandTableBody, bands, players, container);
    bandForm.reset();
  });

  // --- Spreadsheet Paste ---
  const pasteBtn = container.querySelector('#paste-btn');
  const pasteArea = container.querySelector('#paste-input');
  const emptyInput = container.querySelector('#empty-indicator');
  const pasteErrors = container.querySelector('#paste-errors');

  pasteArea.addEventListener('input', () => {
    pasteArea.style.height = 'auto';
    pasteArea.style.height = pasteArea.scrollHeight + 'px';
  });

  emptyInput.value = savedEmpty;
  emptyInput.addEventListener('input', () => {
    saveState(STATE_EMPTY_INDICATOR, emptyInput.value.trim() || 'n/a');
  });

  pasteBtn.addEventListener('click', () => {
    const text = pasteArea.value.trim();
    if (!text) {
      showPasteErrors(pasteErrors, [{ row: 0, message: 'テキストが入力されていません。' }]);
      return;
    }

    const emptyInd = emptyInput.value.trim() || 'n/a';
    const result = parseSpreadsheet(text, emptyInd);

    if (result.errors.length > 0) {
      showPasteErrors(pasteErrors, result.errors);
      return;
    }

    // Merge new players
    const existingSet = new Set(players);
    let newPlayersAdded = false;
    for (const p of result.players) {
      if (!existingSet.has(p)) {
        players.push(p);
        existingSet.add(p);
        newPlayersAdded = true;
      }
    }
    if (newPlayersAdded) {
      saveState(STATE_PLAYERS, players);
      renderPlayerChips(playerChips, players);
      refreshAllDropdowns(container, players);
    }

    // Add bands
    for (const b of result.bands) {
      bands.push(b);
    }
    saveState(STATE_BANDS, bands);
    renderBandTable(bandTableBody, bands, players, container);

    // Clear paste area and errors
    pasteArea.value = '';
    pasteErrors.innerHTML = '';
    showPasteSuccess(pasteErrors, result.bands.length, result.players.length);
  });

  // --- Clear All (inline confirmation to avoid native confirm() glitches) ---
  const clearBtn = container.querySelector('#clear-all-btn');
  const actionsBar = clearBtn.closest('.actions-bar');

  clearBtn.addEventListener('click', () => {
    // Show inline confirmation
    clearBtn.style.display = 'none';
    const confirmBar = document.createElement('div');
    confirmBar.className = 'clear-confirm-bar';
    confirmBar.innerHTML = `
      <span class="clear-confirm-text">\u5168\u3066\u306E\u30C7\u30FC\u30BF\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F</span>
      <button type="button" class="btn btn-danger btn-confirm-yes">\u524A\u9664\u3059\u308B</button>
      <button type="button" class="btn btn-secondary btn-confirm-no">\u30AD\u30E3\u30F3\u30BB\u30EB</button>
    `;
    actionsBar.insertBefore(confirmBar, clearBtn);

    confirmBar.querySelector('.btn-confirm-yes').addEventListener('click', () => {
      players = [];
      bands = [];
      playerInput.value = '';
      saveState(STATE_PLAYERS, players);
      saveState(STATE_BANDS, bands);
      renderPlayerChips(playerChips, players);
      renderBandTable(bandTableBody, bands, players, container);
      refreshAllDropdowns(container, players);
      confirmBar.remove();
      clearBtn.style.display = '';
    });

    confirmBar.querySelector('.btn-confirm-no').addEventListener('click', () => {
      confirmBar.remove();
      clearBtn.style.display = '';
    });
  });

  // --- Proceed to Step 2 ---
  if (onProceed) {
    const proceedBtn = container.querySelector('#proceed-btn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', onProceed);
    }
  }
}

// ─── HTML Template ────────────────────────────────────────────────

function buildDataEntryHTML(savedEmpty, savedMode) {
  const manualActive = savedMode !== 'paste';
  return `
    <section class="section" id="section-players">
      <h2 class="section-title">Step 1: データ入力</h2>

      <div class="subsection">
        <h3 class="subsection-title">入力方法</h3>
        <div class="tab-bar">
          <button type="button" class="tab-btn ${manualActive ? 'active' : ''}" data-tab="manual">手動入力</button>
          <button type="button" class="tab-btn ${!manualActive ? 'active' : ''}" data-tab="paste">スプレッドシート貼り付け</button>
        </div>

        <div class="tab-content ${manualActive ? '' : 'hidden'}" id="tab-manual">
          <div class="subsection">
            <h3 class="subsection-title">参加メンバー</h3>
            <p class="subsection-desc">名前を入力して Enter で追加してください。</p>
            <div class="tag-input-wrap">
              <div id="player-chips" class="tag-input-chips"></div>
              <input type="text" id="player-tag-input" class="tag-input" placeholder="メンバー名を入力..." />
            </div>
          </div>

          <div class="subsection">
            <h3 class="subsection-title">バンド登録</h3>
            <form id="band-form" class="band-form">
              <div class="form-row">
                <label class="form-label">
                  バンド名
                  <input type="text" id="band-name" class="form-input" required placeholder="バンド名を入力" />
                </label>
                <label class="form-label form-label-short">
                  演奏時間（分）
                  <input type="number" id="band-time" class="form-input" required min="1" placeholder="5" />
                </label>
              </div>
              <div class="form-row form-parts-row">
                ${PART_LABELS.map(
                  (label, i) => `
                  <label class="form-label form-label-part">
                    ${label}
                    <select id="part-${PART_KEYS[i]}" class="form-select part-dropdown">
                      <option value="n/a">\u2014 \u7A7A\u304D \u2014</option>
                    </select>
                  </label>
                `,
                ).join('')}
              </div>
              <button type="submit" class="btn btn-primary">バンドを追加</button>
            </form>
          </div>
        </div>

        <div class="tab-content ${!manualActive ? '' : 'hidden'}" id="tab-paste">
          <div class="paste-config">
            <label class="form-label">
              空きスロットの表記
              <input type="text" id="empty-indicator" class="form-input form-input-short" value="${escapeHTML(savedEmpty)}" placeholder="n/a" />
            </label>
            <p class="subsection-desc">
              スプレッドシートからコピーしたデータを貼り付けてください。<br>
              各セルはタブ区切りで、順序は: バンド名 / Vo. / L.Gt / B.Gt / Ba. / Dr. / Key. / 時間<br>
              <strong>バンド名以外のセルにスペースを含めないでください。</strong><br>
              メンバー名は自動的に検出されます。<br>
              ※ 時間の数値はすべて「分」として扱われます。
            </p>
          </div>
          <textarea id="paste-input" class="input-textarea input-textarea-paste" rows="2" placeholder="King Gnu\t井口\t常田\tn/a\t新井\t勢喜\t井口\t20分"></textarea>
          <button type="button" id="paste-btn" class="btn btn-primary">取り込む</button>
          <div id="paste-errors"></div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">登録済みバンド</h3>
        <div class="band-table-wrap">
          <table class="band-table">
            <thead>
              <tr>
                <th>#</th>
                <th>バンド名</th>
                ${PART_LABELS.map((l) => `<th>${l}</th>`).join('')}
                <th>時間</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="band-table-body">
            </tbody>
          </table>
        </div>
        <p id="band-count" class="subsection-desc"></p>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="clear-all-btn" class="btn btn-danger">全データ削除</button>
        <button type="button" id="proceed-btn" class="btn btn-accent">\u2192 条件設定へ (Step 2)</button>
      </div>
    </section>
  `;
}

// ─── Rendering Helpers ────────────────────────────────────────────

function renderPlayerChips(el, players) {
  if (players.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = players
    .map(
      (p) => `<span class="chip chip-removable">${escapeHTML(p)}<button type="button" class="chip-delete" data-name="${escapeHTML(p)}" title="削除">\u2715</button></span>`,
    )
    .join('');
}

function refreshAllDropdowns(container, players) {
  const selects = container.querySelectorAll('.part-dropdown');
  selects.forEach((sel) => {
    const current = sel.value;
    sel.innerHTML = '<option value="n/a">\u2014 \u7A7A\u304D \u2014</option>';
    for (const p of players) {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (p === current) opt.selected = true;
      sel.appendChild(opt);
    }
  });
}

function renderBandTable(tbody, bands, players, container) {
  if (bands.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-muted text-center">バンドが登録されていません</td></tr>';
  } else {
    tbody.innerHTML = bands
      .map(
        (b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHTML(b.name)}</td>
        ${b.members.map((m) => `<td>${escapeHTML(m)}</td>`).join('')}
        <td>${b.estimatedTime}分</td>
        <td><button type="button" class="btn-icon btn-delete" data-index="${i}" title="削除">\u2715</button></td>
      </tr>
    `,
      )
      .join('');

    // Wire delete buttons
    tbody.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        bands.splice(idx, 1);
        saveState(STATE_BANDS, bands);
        renderBandTable(tbody, bands, players, container);
      });
    });
  }

  const countEl = container.querySelector('#band-count');
  if (countEl) {
    countEl.textContent = bands.length > 0 ? `${bands.length}バンド登録済み` : '';
  }
}

function wireTabSwitching(container, onSwitch) {
  const tabBtns = container.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn) => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      const tab = newBtn.dataset.tab;
      container.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      newBtn.classList.add('active');
      container.querySelector('#tab-manual').classList.toggle('hidden', tab !== 'manual');
      container.querySelector('#tab-paste').classList.toggle('hidden', tab !== 'paste');
      if (onSwitch) onSwitch(tab);
    });
  });
}

function readBandForm(form) {
  const name = form.querySelector('#band-name').value.trim();
  const time = parseInt(form.querySelector('#band-time').value, 10);

  if (!name) return null;
  if (!time || time <= 0) return null;

  const members = PART_KEYS.map((key) => {
    const sel = form.querySelector(`#part-${key}`);
    return sel ? sel.value : 'n/a';
  });

  return { name, members, estimatedTime: time };
}

function showPasteErrors(el, errors) {
  el.innerHTML = `
    <div class="paste-error-box">
      ${errors.map((e) => `<p class="error-line">${escapeHTML(e.message)}</p>`).join('')}
    </div>
  `;
}

function showPasteSuccess(el, bandCount, playerCount) {
  el.innerHTML = `
    <div class="paste-success-box">
      <p>${bandCount}バンドを取り込みました。${playerCount > 0 ? `${playerCount}人の新しいメンバーを追加しました。` : ''}</p>
    </div>
  `;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
