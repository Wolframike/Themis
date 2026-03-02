/**
 * Final Export — Step 5.
 *
 * Break insertion between performances and clipboard export.
 */

import { saveState, loadState } from './state.js';
import { PART_LABELS_SHORT } from './timetable-results.js';

const STATE_BREAKS = 'breaks';

// ─── Step 5: Break Insertion & Export ─────────────────────────────

/**
 * Display the finalized timetable with break insertion controls and export.
 *
 * @param {HTMLElement} container
 * @param {Array<{name: string, bandIndex: number, cost: number|null, startTime: string, endTime: string, startMinutes: number, endMinutes: number, perfTime: number}>} schedule
 * @param {{minUnit: number, transitionTime: number, startTime: string}} timing
 * @param {function} onBack - go back to Step 4
 * @param {Array<{name: string, members: string[], estimatedTime: number}>} bands - band data for member display
 */
export function initFinalExport(container, schedule, timing, onBack, bands) {
  const minUnit = timing.minUnit || 5;

  // Load saved breaks or start empty
  let breaks = loadState(STATE_BREAKS, []);
  // Validate saved breaks against current schedule length
  breaks = breaks.filter((b) => b.afterIndex >= 0 && b.afterIndex < schedule.length - 1);

  // Current computed schedule (recalculated with breaks)
  let computedSchedule = recalcWithBreaks(schedule, breaks, timing);

  render();

  function render() {
    container.innerHTML = buildStepHTML(computedSchedule, breaks, minUnit, bands);

    // Back button
    container.querySelector('#back-to-timing').addEventListener('click', () => {
      onBack();
    });

    // "+" buttons for inserting breaks
    container.querySelectorAll('.btn-add-break').forEach((btn) => {
      btn.addEventListener('click', () => {
        const afterIdx = parseInt(btn.dataset.after, 10);
        // Check if break already exists at this position
        if (breaks.some((b) => b.afterIndex === afterIdx)) return;
        // Prompt for duration
        showBreakInput(btn, afterIdx, minUnit);
      });
    });

    // Remove break buttons
    container.querySelectorAll('.btn-remove-break').forEach((btn) => {
      btn.addEventListener('click', () => {
        const afterIdx = parseInt(btn.dataset.after, 10);
        breaks = breaks.filter((b) => b.afterIndex !== afterIdx);
        saveState(STATE_BREAKS, breaks);
        computedSchedule = recalcWithBreaks(schedule, breaks, timing);
        render();
      });
    });

    // Copy to clipboard
    const copyBtn = container.querySelector('#copy-clipboard');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = buildClipboardText(computedSchedule, breaks, bands);
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = '\u2714 \u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F';
          copyBtn.classList.add('btn-copied');
          setTimeout(() => {
            copyBtn.textContent = '\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC';
            copyBtn.classList.remove('btn-copied');
          }, 2000);
        });
      });
    }
  }

  function showBreakInput(anchorBtn, afterIdx, unit) {
    // Replace the "+" button content inside the <td>, keeping valid table HTML
    const td = anchorBtn.closest('td');
    td.innerHTML = `
      <div class="break-input-row">
        <label class="break-input-label">
          休憩時間（${unit}分単位）
          <input type="number" class="form-input break-duration-input" min="${unit}" step="${unit}" value="${unit}" />
        </label>
        <button type="button" class="btn btn-accent btn-confirm-break">追加</button>
        <button type="button" class="btn btn-secondary btn-cancel-break">取消</button>
      </div>
    `;

    const input = td.querySelector('.break-duration-input');
    const confirmBtn = td.querySelector('.btn-confirm-break');
    const cancelBtn = td.querySelector('.btn-cancel-break');

    confirmBtn.addEventListener('click', () => {
      const duration = parseInt(input.value, 10);
      if (!duration || duration < unit || duration % unit !== 0) {
        input.style.borderColor = '#e74c3c';
        return;
      }
      breaks.push({ afterIndex: afterIdx, duration });
      breaks.sort((a, b) => a.afterIndex - b.afterIndex);
      saveState(STATE_BREAKS, breaks);
      computedSchedule = recalcWithBreaks(schedule, breaks, timing);
      render();
    });

    cancelBtn.addEventListener('click', () => {
      render();
    });

    input.focus();
  }
}

// ─── Recalculate Timestamps with Breaks ──────────────────────────

/**
 * Recalculate all timestamps, inserting break durations where specified.
 *
 * @param {Array} originalSchedule - schedule from Step 4 (original, unmodified)
 * @param {Array<{afterIndex: number, duration: number}>} breaks
 * @param {{minUnit: number, transitionTime: number, startTime: string}} timing
 * @returns {Array} - new schedule with recalculated times
 */
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

    // Add break after this band if specified
    const breakDuration = breakMap.get(i);
    if (breakDuration !== undefined) {
      currentMinutes += breakDuration;
    }
  }

  return result;
}

// ─── Clipboard Export ────────────────────────────────────────────

function buildClipboardText(schedule, breaks, bands) {
  const breakMap = new Map();
  for (const b of breaks) {
    breakMap.set(b.afterIndex, b.duration);
  }

  const lines = [];

  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    const timeRange = `${row.startTime}\u301C${row.endTime}`;
    const band = bands && bands[row.bandIndex];
    const memberStr = band ? band.members.join('\t') : '';
    lines.push(`${timeRange}\t${row.name}\t${memberStr}\t${row.perfTime}\u5206`);

    const breakDuration = breakMap.get(i);
    if (breakDuration !== undefined) {
      lines.push(`\t\u4F11\u61A9 (${breakDuration}\u5206)`);
    }
  }

  return lines.join('\n');
}

// ─── HTML Building ───────────────────────────────────────────────

function buildStepHTML(schedule, breaks, minUnit, bands) {
  const breakMap = new Map();
  for (const b of breaks) {
    breakMap.set(b.afterIndex, b.duration);
  }

  // Calculate total event duration
  const firstStart = schedule.length > 0 ? schedule[0].startTime : '--:--';
  const lastEnd = schedule.length > 0 ? schedule[schedule.length - 1].endTime : '--:--';

  const colSpan = 4 + PART_LABELS_SHORT.length; // #, time, name, perfTime + 6 parts

  const rows = [];
  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    const band = bands && bands[row.bandIndex];
    const memberCells = band
      ? band.members.map((m) => `<td>${escapeHTML(m)}</td>`).join('')
      : PART_LABELS_SHORT.map(() => '<td>-</td>').join('');

    rows.push(`
      <tr>
        <td>${i + 1}</td>
        <td class="timestamp-cell">${row.startTime}\u301C${row.endTime}</td>
        <td>${escapeHTML(row.name)}</td>
        ${memberCells}
        <td>${row.perfTime}\u5206</td>
      </tr>
    `);


    // Break insert zone (between rows, not after the last one)
    if (i < schedule.length - 1) {
      const existingBreak = breakMap.get(i);
      if (existingBreak !== undefined) {
        // Show the break row with a remove button
        rows.push(`
          <tr class="break-row">
            <td colspan="${colSpan}">
              <div class="break-display">
                <span class="break-label">\u4F11\u61A9 ${existingBreak}\u5206</span>
                <button type="button" class="btn-remove-break" data-after="${i}" title="\u524A\u9664">\u2715</button>
              </div>
            </td>
          </tr>
        `);
      } else {
        // Show the "+" insert button
        rows.push(`
          <tr class="break-insert-row">
            <td colspan="${colSpan}">
              <button type="button" class="btn-add-break" data-after="${i}" title="\u4F11\u61A9\u3092\u8FFD\u52A0">+</button>
            </td>
          </tr>
        `);
      }
    }
  }

  return `
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-timing" class="btn btn-secondary">\u2190 \u30BF\u30A4\u30DF\u30F3\u30B0\u8A2D\u5B9A\u306B\u623B\u308B</button>
        <h2 class="section-title section-title-inline">Step 5: \u6700\u7D42\u8ABF\u6574\u30FB\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8</h2>
      </div>

      <p class="subsection-desc">
        \u30D0\u30F3\u30C9\u9593\u306B\u4F11\u61A9\u3092\u633F\u5165\u3067\u304D\u307E\u3059\u3002\u300C+\u300D\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u4F11\u61A9\u6642\u9593\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002<br>
        \u4F11\u61A9\u6642\u9593\u306F\u6700\u5C0F\u6642\u9593\u5358\u4F4D\uFF08${minUnit}\u5206\uFF09\u306E\u500D\u6570\u3067\u306E\u307F\u6307\u5B9A\u3067\u304D\u307E\u3059\u3002
      </p>

      <div class="subsection">
        <h3 class="subsection-title">\u6700\u7D42\u30BF\u30A4\u30E0\u30C6\u30FC\u30D6\u30EB</h3>
        <p class="subsection-desc">${firstStart} \u301C ${lastEnd}</p>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table final-table">
            <thead>
              <tr>
                <th>#</th>
                <th>\u6642\u9593</th>
                <th>\u30D0\u30F3\u30C9\u540D</th>
                ${PART_LABELS_SHORT.map((l) => `<th>${l}</th>`).join('')}
                <th>\u6F14\u594F\u6642\u9593</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="copy-clipboard" class="btn btn-accent">\u30AF\u30EA\u30C3\u30D7\u30DC\u30FC\u30C9\u306B\u30B3\u30D4\u30FC</button>
      </div>
    </section>
  `;
}

// ─── Helpers ─────────────────────────────────────────────────────

function parseTimeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatMinutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
