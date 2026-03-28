/**
 * Data Entry Panel for Themis v2.
 * Renders as a collapsible panel in the left rail.
 */

import { saveState, loadState } from './state.js';
import { parseSpreadsheet } from './spreadsheet-parser.js';
import { escapeHTML, PART_LABELS } from './utils.js';
const PART_KEYS = ['vocal', 'leadGuitar', 'backingGuitar', 'bass', 'drums', 'keyboard'];

/**
 * Initialize the data entry panel section.
 * Appends into the left panel container.
 */
export function initDataPanel(container, appState, onDataChanged) {
  const savedEmpty = loadState('emptyIndicator', 'n/a');
  const savedMode = loadState('entryMode', 'paste');

  // Create panel section
  const section = document.createElement('div');
  section.className = 'panel-section open';
  section.dataset.panel = 'data';

  section.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-icon data">☰</span>
        <span class="panel-title">バンドデータ</span>
        <span class="panel-badge" id="band-count-badge">${appState.bands.length} bands</span>
      </div>
      <span class="panel-chevron">▸</span>
    </div>
    <div class="panel-body">
      <div class="p-tabs">
        <button type="button" class="p-tab ${savedMode === 'paste' ? 'active' : ''}" data-tab="paste">Paste</button>
        <button type="button" class="p-tab ${savedMode !== 'paste' ? 'active' : ''}" data-tab="manual">Manual</button>
      </div>

      <!-- Paste tab -->
      <div id="data-tab-paste" class="${savedMode !== 'paste' ? 'hidden' : ''}">
        <div class="p-row p-inline">
          <label class="p-label" style="margin:0;flex:0 0 auto">空席表記</label>
          <input class="p-input" id="empty-indicator" style="width:55px;text-align:center;font-family:var(--font-mono)" value="${escapeHTML(savedEmpty)}" />
          <div style="flex:1"></div>
          <button class="p-btn p-btn-accent p-btn-sm" id="paste-btn">解析</button>
        </div>
        <div class="p-row">
          <textarea class="p-textarea" id="paste-input" rows="3" placeholder="King Gnu&#9;井口&#9;常田&#9;n/a&#9;新井&#9;勢喜&#9;井口&#9;20分"></textarea>
          <div class="p-help">時間の数値はすべて「分」として扱います</div>
        </div>
        <div id="paste-feedback"></div>
      </div>

      <!-- Manual tab -->
      <div id="data-tab-manual" class="${savedMode === 'paste' ? 'hidden' : ''}">
        <div class="p-row">
          <label class="p-label">プレイヤー</label>
          <div class="p-tag-wrap" id="player-tag-wrap">
            <div id="player-chips"></div>
            <input type="text" class="p-tag-input" id="player-tag-input" placeholder="名前を入力 + Enter" />
          </div>
        </div>

        <div class="p-row">
          <label class="p-label">バンド名</label>
          <input type="text" class="p-input" id="band-name-input" placeholder="バンド名" />
        </div>
        <div class="p-row">
          <label class="p-label">パート</label>
          <div class="manual-form-parts" id="manual-parts">
            ${PART_LABELS.map((label, i) => `
              <label class="p-label">
                ${label}
                <select class="p-select part-dropdown" id="part-${PART_KEYS[i]}">
                  <option value="n/a">— 空き —</option>
                </select>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="p-row p-inline">
          <label class="p-label" style="margin:0;flex:0 0 auto">時間(分)</label>
          <input type="number" class="p-input" id="band-time-input" style="width:55px;font-family:var(--font-mono)" min="1" placeholder="5" />
          <div style="flex:1"></div>
          <button class="p-btn p-btn-accent p-btn-sm" id="add-band-btn">追加</button>
        </div>
      </div>

      <!-- Band list -->
      <div class="p-row" style="margin-top:0.6rem">
        <label class="p-label">登録済みバンド</label>
        <div class="band-mini-list" id="band-mini-list"></div>
      </div>

      <!-- Clear -->
      <div style="display:flex;justify-content:flex-end;margin-top:0.3rem" id="clear-area">
        <button class="p-btn p-btn-danger p-btn-sm" id="clear-all-btn">全データ削除</button>
      </div>
    </div>
  `;

  container.appendChild(section);

  // --- Wire panel toggle ---
  section.querySelector('.panel-header').addEventListener('click', () => {
    section.classList.toggle('open');
  });

  // --- State refs ---
  const bandCountBadge = section.querySelector('#band-count-badge');
  const pasteFeedback = section.querySelector('#paste-feedback');
  const pasteInput = section.querySelector('#paste-input');
  const emptyInput = section.querySelector('#empty-indicator');
  const pasteBtn = section.querySelector('#paste-btn');
  const playerChips = section.querySelector('#player-chips');
  const playerInput = section.querySelector('#player-tag-input');
  const bandNameInput = section.querySelector('#band-name-input');
  const bandTimeInput = section.querySelector('#band-time-input');
  const addBandBtn = section.querySelector('#add-band-btn');
  const bandMiniList = section.querySelector('#band-mini-list');
  const clearArea = section.querySelector('#clear-area');

  function updateBadge() {
    bandCountBadge.textContent = `${appState.bands.length} bands`;
  }

  // Delegated band delete listener (wired once, not per render)
  bandMiniList.addEventListener('click', (e) => {
    const btn = e.target.closest('.band-mini-delete');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    appState.bands.splice(idx, 1);
    saveState('bands', appState.bands);
    renderBandList();
    updateBadge();
    onDataChanged();
  });

  // --- Tab switching ---
  section.querySelectorAll('.p-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      section.querySelectorAll('.p-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.tab;
      section.querySelector('#data-tab-paste').classList.toggle('hidden', mode !== 'paste');
      section.querySelector('#data-tab-manual').classList.toggle('hidden', mode !== 'manual');
      saveState('entryMode', mode);
    });
  });

  // --- Paste ---
  emptyInput.addEventListener('input', () => {
    saveState('emptyIndicator', emptyInput.value.trim() || 'n/a');
  });

  pasteInput.addEventListener('input', () => {
    pasteInput.style.height = 'auto';
    pasteInput.style.height = pasteInput.scrollHeight + 'px';
  });

  pasteBtn.addEventListener('click', () => {
    const text = pasteInput.value.trim();
    if (!text) {
      pasteFeedback.innerHTML = '<div class="p-error">テキストが入力されていません。</div>';
      return;
    }

    const emptyInd = emptyInput.value.trim() || 'n/a';
    const result = parseSpreadsheet(text, emptyInd);

    if (result.errors.length > 0) {
      pasteFeedback.innerHTML = result.errors.map((e) =>
        `<div class="p-error">${escapeHTML(e.message)}</div>`
      ).join('');
      return;
    }

    // Merge players
    const existingSet = new Set(appState.players);
    for (const p of result.players) {
      if (!existingSet.has(p)) {
        appState.players.push(p);
        existingSet.add(p);
      }
    }
    saveState('players', appState.players);

    // Add bands (reject duplicates, case-insensitive)
    const existingNames = new Set(appState.bands.map((b) => b.name.toLowerCase()));
    const dupes = [];
    let added = 0;
    for (const b of result.bands) {
      if (existingNames.has(b.name.toLowerCase())) {
        dupes.push(b.name);
      } else {
        appState.bands.push(b);
        existingNames.add(b.name.toLowerCase());
        added++;
      }
    }
    saveState('bands', appState.bands);

    pasteInput.value = '';
    let feedbackHtml = '';
    if (added > 0) {
      feedbackHtml += `<div class="p-success">✓ ${added}バンド登録 · ${result.players.length}人検出</div>`;
    }
    if (dupes.length > 0) {
      feedbackHtml += `<div class="p-error" style="margin-top:0.3rem">重複のためスキップ: ${dupes.map(escapeHTML).join('、')}</div>`;
    }
    if (!added && dupes.length > 0) {
      feedbackHtml = `<div class="p-error">全て既に登録済みのバンドです: ${dupes.map(escapeHTML).join('、')}</div>`;
    }
    pasteFeedback.innerHTML = feedbackHtml;

    renderPlayerChips();
    refreshDropdowns();
    renderBandList();
    updateBadge();
    onDataChanged();
  });

  // --- Manual: Player tag input ---
  function renderPlayerChips() {
    playerChips.innerHTML = appState.players.map((p) =>
      `<span class="p-chip">${escapeHTML(p)}<button type="button" class="p-chip-delete" data-name="${escapeHTML(p)}">✕</button></span>`
    ).join('');
  }

  playerChips.addEventListener('click', (e) => {
    const del = e.target.closest('.p-chip-delete');
    if (!del) return;
    appState.players = appState.players.filter((p) => p !== del.dataset.name);
    saveState('players', appState.players);
    renderPlayerChips();
    refreshDropdowns();
    onDataChanged();
  });

  playerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = playerInput.value.trim();
      if (name && !appState.players.includes(name)) {
        appState.players.push(name);
        saveState('players', appState.players);
        renderPlayerChips();
        refreshDropdowns();
      }
      playerInput.value = '';
    }
  });

  // --- Manual: Dropdowns ---
  function refreshDropdowns() {
    section.querySelectorAll('.part-dropdown').forEach((sel) => {
      const current = sel.value;
      sel.innerHTML = '<option value="n/a">— 空き —</option>';
      for (const p of appState.players) {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === current) opt.selected = true;
        sel.appendChild(opt);
      }
    });
  }

  // --- Manual: Add band ---
  addBandBtn.addEventListener('click', () => {
    const name = bandNameInput.value.trim();
    const time = parseInt(bandTimeInput.value, 10);
    if (!name || !time || time <= 0) return;

    if (appState.bands.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      bandNameInput.style.borderColor = 'var(--red)';
      let warn = section.querySelector('#band-dupe-warn');
      if (!warn) {
        warn = document.createElement('div');
        warn.id = 'band-dupe-warn';
        warn.className = 'p-error';
        bandNameInput.parentElement.appendChild(warn);
      }
      warn.textContent = `「${name}」は既に登録されています。`;
      setTimeout(() => { bandNameInput.style.borderColor = ''; if (warn) warn.remove(); }, 3000);
      return;
    }

    const members = PART_KEYS.map((key) => {
      const sel = section.querySelector(`#part-${key}`);
      return sel ? sel.value : 'n/a';
    });

    appState.bands.push({ name, members, estimatedTime: time });
    saveState('bands', appState.bands);

    bandNameInput.value = '';
    bandTimeInput.value = '';

    renderBandList();
    updateBadge();
    onDataChanged();
  });

  // --- Band list ---
  function renderBandList() {
    if (appState.bands.length === 0) {
      bandMiniList.innerHTML = '<div style="font-size:0.68rem;color:var(--text-3);padding:0.3rem 0">バンドが登録されていません</div>';
      return;
    }

    bandMiniList.innerHTML = appState.bands.map((b, i) => `
      <div class="band-mini-item">
        <span class="band-mini-name">${escapeHTML(b.name)}</span>
        <span class="band-mini-time">${b.estimatedTime}分</span>
        <button type="button" class="band-mini-delete" data-index="${i}">✕</button>
      </div>
    `).join('');
  }

  // --- Clear all ---
  let confirmShown = false;

  clearArea.querySelector('#clear-all-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirmShown) return;
    confirmShown = true;

    const btn = clearArea.querySelector('#clear-all-btn');
    btn.classList.add('hidden');

    const bar = document.createElement('div');
    bar.className = 'clear-confirm-bar';
    bar.innerHTML = `
      <span class="clear-confirm-text">全て削除しますか？</span>
      <button type="button" class="p-btn p-btn-danger p-btn-sm" id="confirm-yes">削除</button>
      <button type="button" class="p-btn p-btn-sm" id="confirm-no">取消</button>
    `;
    clearArea.appendChild(bar);

    bar.querySelector('#confirm-yes').addEventListener('click', (ev) => {
      ev.stopPropagation();
      appState.players = [];
      appState.bands = [];
      appState.rules = [];
      appState.breaks = [];
      appState.results = null;
      appState.schedule = null;
      appState.selectedResultIndex = 0;
      saveState('players', []);
      saveState('bands', []);
      saveState('rules', []);
      saveState('breaks', []);
      renderPlayerChips();
      refreshDropdowns();
      renderBandList();
      updateBadge();
      bar.remove();
      btn.classList.remove('hidden');
      confirmShown = false;
      onDataChanged();
    });

    bar.querySelector('#confirm-no').addEventListener('click', (ev) => {
      ev.stopPropagation();
      bar.remove();
      btn.classList.remove('hidden');
      confirmShown = false;
    });
  });

  // --- Initial render ---
  renderPlayerChips();
  refreshDropdowns();
  renderBandList();
}
