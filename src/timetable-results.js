/**
 * Timeline Rendering for Themis v2.
 * Renders the center panel: result selector, band cards with member dots,
 * transition cost indicators, and break insertion.
 */

import { saveState } from './state.js';
import { escapeHTML, PART_LABELS, parseTimeToMinutes, formatMinutesToTime, buildBreakMap } from './utils.js';

/**
 * Render result selector pills in the timeline header.
 */
export function renderResultSelector(container, appState) {
  if (!appState.results || appState.results.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <span class="result-label">Result:</span>
    ${appState.results.map((r, i) => `
      <button type="button" class="result-pill ${i === appState.selectedResultIndex ? 'active' : ''}" data-idx="${i}">
        #${i + 1} cost:${r.cost}
      </button>
    `).join('')}
  `;

  container.querySelectorAll('.result-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.dataset.idx, 10);
      document.dispatchEvent(new CustomEvent('themis:selectResult', { detail: { index: idx } }));
    });
  });
}

/**
 * Render the optimized timeline with band cards, cost indicators, and break zones.
 */
export function renderTimeline(container, appState, getPlayerColor, onBreaksChanged, skipAnim = false) {
  const schedule = appState.schedule;
  if (!schedule || schedule.length === 0) {
    const ruleCount = appState.rules ? appState.rules.length : 0;
    container.innerHTML = `
      <div class="error-box">
        <div style="font-weight:600;margin-bottom:0.4rem">解が見つかりません</div>
        <div>現在のルール（${ruleCount}件）の組み合わせを満たすタイムテーブルが存在しません。</div>
        <div style="margin-top:0.5rem;font-size:0.78rem;color:var(--text-1)">
          左パネルの「ルール」を開き、条件を緩和するか一部を削除してください。<br>
          特に「連続出演制限」「出演スパン制限」「隣接指定」は制約が強くなりやすいルールです。
        </div>
      </div>`;
    return;
  }

  const bands = appState.bands;
  const breakMap = buildBreakMap(appState.breaks);

  // Recalculate with breaks
  const recalced = recalcWithBreaks(schedule, appState.breaks, appState.timing);
  const minUnit = appState.timing.minUnit || 5;

  let html = '';

  recalced.forEach((row, idx) => {
    const band = bands[row.bandIndex];
    const prevBand = idx > 0 ? bands[recalced[idx - 1].bandIndex] : null;

    // Transition cost indicator
    if (idx > 0) {
      const cost = row.cost || 0;
      const cls = cost <= 1 ? 'cost-low' : cost <= 2 ? 'cost-med' : 'cost-high';
      html += `
        <div class="transition-indicator">
          <div class="transition-line"></div>
          <span class="transition-cost ${cls}">転換 ${cost}</span>
        </div>
      `;
    }

    // Break before this band (check if break exists after previous band)
    if (idx > 0) {
      const breakDur = breakMap.get(idx - 1);
      if (breakDur !== undefined) {
        html += `
          <div class="break-card">
            <span class="break-label">休憩</span>
            <span class="break-time">${breakDur}分</span>
            <button type="button" class="break-remove-btn" data-after="${idx - 1}">✕</button>
          </div>
        `;
      }
    }

    // Member dots
    const members = band.members.map((m, pi) => {
      if (m === 'n/a') return '';
      const color = getPlayerColor(m);
      return `<span class="member-dot" style="color:${color};background:${color}15">${escapeHTML(m)}<span class="part-label">${PART_LABELS[pi]}</span></span>`;
    }).filter(Boolean).join('');

    html += `
      <div class="band-card" style="${skipAnim ? '' : `animation: fadeSlide 0.25s ease-out ${idx * 0.04}s both`}">
        <div class="band-card-inner">
          <div class="band-order">${idx + 1}</div>
          <div class="band-main">
            <div class="band-name">${escapeHTML(row.name)}</div>
            <div class="band-members">${members}</div>
          </div>
          <div class="band-time-col">
            <span class="band-time">${row.startTime}〜${row.endTime}</span>
            <span class="band-duration">${row.perfTime}min</span>
          </div>
        </div>
      </div>
    `;

    // Add break zone (between bands, if no break exists yet)
    if (idx < recalced.length - 1 && !breakMap.has(idx)) {
      html += `
        <div class="add-break-zone">
          <button type="button" class="add-break-btn" data-after="${idx}">+ 休憩を挿入</button>
        </div>
      `;
    }
  });

  container.innerHTML = html;

  // Wire break removal
  container.querySelectorAll('.break-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const afterIdx = parseInt(btn.dataset.after, 10);
      appState.breaks = appState.breaks.filter((b) => b.afterIndex !== afterIdx);
      saveState('breaks', appState.breaks);
      onBreaksChanged(true);
    });
  });

  // Wire break insertion
  container.querySelectorAll('.add-break-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const afterIdx = parseInt(btn.dataset.after, 10);
      showBreakInput(btn, afterIdx, minUnit, appState, onBreaksChanged);
    });
  });
}

function showBreakInput(anchorBtn, afterIdx, unit, appState, onBreaksChanged) {
  const zone = anchorBtn.parentElement;
  zone.style.opacity = '1';
  zone.innerHTML = `
    <div class="break-input-inline">
      <span class="p-help">休憩（${unit}分単位）</span>
      <input type="number" class="p-input" min="${unit}" step="${unit}" value="${unit}" style="width:55px;text-align:center;font-family:var(--font-mono);font-size:0.75rem" />
      <button type="button" class="p-btn p-btn-accent p-btn-sm">OK</button>
      <button type="button" class="p-btn p-btn-sm cancel-break">✕</button>
    </div>
  `;

  const input = zone.querySelector('input');
  const okBtn = zone.querySelector('.p-btn-accent');
  const cancelBtn = zone.querySelector('.cancel-break');

  input.focus();

  okBtn.addEventListener('click', () => {
    const duration = parseInt(input.value, 10);
    if (!duration || duration < unit || duration % unit !== 0) {
      input.style.borderColor = 'var(--red)';
      return;
    }
    appState.breaks.push({ afterIndex: afterIdx, duration });
    appState.breaks.sort((a, b) => a.afterIndex - b.afterIndex);
    saveState('breaks', appState.breaks);
    onBreaksChanged(true);
  });

  cancelBtn.addEventListener('click', () => {
    // Just restore the add-break button — no re-render
    zone.style.opacity = '';
    zone.innerHTML = `<button type="button" class="add-break-btn" data-after="${afterIdx}">+ 休憩を挿入</button>`;
    zone.querySelector('.add-break-btn').addEventListener('click', () => {
      showBreakInput(zone.querySelector('.add-break-btn'), afterIdx, unit, appState, onBreaksChanged);
    });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') okBtn.click();
    if (e.key === 'Escape') cancelBtn.click();
  });
}

// ─── Timestamp Calculation ───────────────────────────────────────

export function calculateTimestamps(details, bands, minUnit, transitionTime, startTime) {
  const schedule = [];
  let currentMinutes = parseTimeToMinutes(startTime);

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    const band = bands[detail.bandIndex];
    const perfTime = band.estimatedTime;
    const bandStart = currentMinutes;
    const rawEnd = bandStart + perfTime + transitionTime;
    const roundedEnd = Math.ceil(rawEnd / minUnit) * minUnit;

    schedule.push({
      name: detail.name,
      bandIndex: detail.bandIndex,
      cost: detail.cost,
      startTime: formatMinutesToTime(bandStart),
      endTime: formatMinutesToTime(roundedEnd),
      startMinutes: bandStart,
      endMinutes: roundedEnd,
      perfTime,
    });

    currentMinutes = roundedEnd;
  }

  return schedule;
}

function recalcWithBreaks(originalSchedule, breaks, timing) {
  const minUnit = timing.minUnit || 5;
  const transitionTime = timing.transitionTime || 5;
  let currentMinutes = parseTimeToMinutes(timing.startTime || '12:00');

  const breakMap = new Map();
  for (const b of breaks) {
    breakMap.set(b.afterIndex, b.duration);
  }

  const result = [];

  for (let i = 0; i < originalSchedule.length; i++) {
    const orig = originalSchedule[i];
    const bandStart = currentMinutes;
    const rawEnd = bandStart + orig.perfTime + transitionTime;
    const roundedEnd = Math.ceil(rawEnd / minUnit) * minUnit;

    result.push({
      ...orig,
      startTime: formatMinutesToTime(bandStart),
      endTime: formatMinutesToTime(roundedEnd),
      startMinutes: bandStart,
      endMinutes: roundedEnd,
    });

    currentMinutes = roundedEnd;

    const breakDuration = breakMap.get(i);
    if (breakDuration !== undefined) {
      currentMinutes += breakDuration;
    }
  }

  return result;
}
