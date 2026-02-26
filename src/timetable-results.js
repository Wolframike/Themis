/**
 * Timetable Results & Timing — Steps 3 & 4.
 *
 * Step 3: Display top 5 optimizer results for user selection.
 * Step 4: Timing configuration and timestamp calculation.
 */

import { saveState, loadState } from './state.js';
import { computeScheduleDetails, PART_NAMES } from './optimizer.js';

const STATE_SELECTED_PATH = 'selectedPath';
const STATE_TIMING = 'timing';

const PART_LABELS_SHORT = ['Vo.', 'L.Gt', 'B.Gt', 'Ba.', 'Dr.', 'Key.'];

// ─── Step 3: Timetable Selection ──────────────────────────────────

/**
 * Display the top K timetable results for user selection.
 *
 * @param {HTMLElement} container
 * @param {Array<{path: number[], cost: number}>} results - from solve()
 * @param {Array<{name: string, members: string[], estimatedTime: number}>} bands
 * @param {number[]} costWeights
 * @param {function} onBack - go back to Step 2
 * @param {function} onSelect - called with {path, cost, details} when user selects
 */
export function initResultsSelection(container, results, bands, costWeights, onBack, onSelect) {
  if (results.length === 0) {
    container.innerHTML = `
      <section class="section">
        <div class="step-nav">
          <button type="button" id="back-btn" class="btn btn-secondary">\u2190 条件設定に戻る</button>
          <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
        </div>
        <div class="error-box">
          <p>条件を満たすタイムテーブルが見つかりませんでした。</p>
          <p>条件を緩和して再度お試しください。</p>
        </div>
      </section>
    `;
    container.querySelector('#back-btn').addEventListener('click', onBack);
    return;
  }

  const detailsPerResult = results.map((r) =>
    computeScheduleDetails(bands, r.path, true, false, costWeights),
  );

  container.innerHTML = `
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-btn" class="btn btn-secondary">\u2190 条件設定に戻る</button>
        <h2 class="section-title section-title-inline">Step 3: タイムテーブル選択</h2>
      </div>
      <p class="subsection-desc">上位${results.length}件のタイムテーブルを表示しています。使用するものを選択してください。</p>

      ${results
        .map(
          (r, idx) => `
        <div class="result-card" data-index="${idx}">
          <div class="result-header">
            <span class="result-rank">#${idx + 1}</span>
            <span class="result-cost">合計転換コスト: ${r.cost}</span>
            <button type="button" class="btn btn-accent btn-select-result" data-index="${idx}">これを選択</button>
          </div>
          <div class="band-table-wrap">
            <table class="band-table result-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>バンド名</th>
                  ${PART_LABELS_SHORT.map((l) => `<th>${l}</th>`).join('')}
                  <th>転換コスト</th>
                </tr>
              </thead>
              <tbody>
                ${detailsPerResult[idx]
                  .map(
                    (row, ri) => `
                  <tr>
                    <td>${ri + 1}</td>
                    <td>${escapeHTML(row.name)}</td>
                    ${row.members.map((m) => `<td>${escapeHTML(m)}</td>`).join('')}
                    <td>${row.cost === null ? '-' : row.cost}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `,
        )
        .join('')}
    </section>
  `;

  container.querySelector('#back-btn').addEventListener('click', onBack);

  container.querySelectorAll('.btn-select-result').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const selected = results[idx];
      saveState(STATE_SELECTED_PATH, selected.path);
      onSelect({
        path: selected.path,
        cost: selected.cost,
        details: detailsPerResult[idx],
      });
    });
  });
}

// ─── Step 4: Timing Configuration & Timestamps ───────────────────

/**
 * Display timing configuration and calculated timestamps.
 *
 * @param {HTMLElement} container
 * @param {Array<{bandIndex: number, name: string, members: string[], cost: number|null}>} details
 * @param {Array<{name: string, members: string[], estimatedTime: number}>} bands
 * @param {number} totalCost
 * @param {function} onBack - go back to Step 3
 * @param {function} onProceed - go to Step 5 (breaks/export), called with timestamped schedule
 */
export function initTimingConfig(container, details, bands, totalCost, onBack, onProceed) {
  const savedTiming = loadState(STATE_TIMING, {
    minUnit: 5,
    transitionTime: 5,
    startTime: '12:00',
  });

  container.innerHTML = buildTimingHTML(details, bands, savedTiming, totalCost);

  container.querySelector('#back-to-results').addEventListener('click', onBack);

  const minUnitInput = container.querySelector('#min-unit');
  const transTimeInput = container.querySelector('#transition-time');
  const startTimeInput = container.querySelector('#start-time');
  const calcBtn = container.querySelector('#calc-timestamps');
  const timestampBody = container.querySelector('#timestamp-body');
  const proceedBtn = container.querySelector('#proceed-to-export');

  let currentSchedule = null;

  calcBtn.addEventListener('click', () => {
    const minUnit = parseInt(minUnitInput.value, 10) || 5;
    const transitionTime = parseInt(transTimeInput.value, 10) || 5;
    const startTime = startTimeInput.value || '12:00';

    // Save timing config
    saveState(STATE_TIMING, { minUnit, transitionTime, startTime });

    // Calculate timestamps
    currentSchedule = calculateTimestamps(details, bands, minUnit, transitionTime, startTime);

    // Render
    renderTimestampTable(timestampBody, currentSchedule);
    proceedBtn.classList.remove('hidden');
  });

  // Auto-calculate on load if we have saved timing
  if (savedTiming.startTime) {
    currentSchedule = calculateTimestamps(
      details,
      bands,
      savedTiming.minUnit,
      savedTiming.transitionTime,
      savedTiming.startTime,
    );
    renderTimestampTable(timestampBody, currentSchedule);
    proceedBtn.classList.remove('hidden');
  }

  proceedBtn.addEventListener('click', () => {
    if (currentSchedule && onProceed) {
      onProceed(currentSchedule);
    }
  });
}

// ─── Timestamp Calculation Engine ─────────────────────────────────

/**
 * Calculate timestamps for each band in the schedule.
 *
 * Logic:
 * - Band starts at currentTime
 * - Band performance takes estimatedTime minutes
 * - Add transitionTime to get raw end
 * - Round up to next multiple of minUnit
 * - That becomes the start of the next band
 *
 * @param {Array<{bandIndex: number, name: string}>} details
 * @param {Array<{estimatedTime: number}>} bands
 * @param {number} minUnit - minimum time unit in minutes
 * @param {number} transitionTime - transition time in minutes
 * @param {string} startTime - "HH:MM" format
 * @returns {Array<{name: string, startTime: string, endTime: string, bandIndex: number, cost: number|null}>}
 */
export function calculateTimestamps(details, bands, minUnit, transitionTime, startTime) {
  const schedule = [];
  let currentMinutes = parseTimeToMinutes(startTime);

  for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    const band = bands[detail.bandIndex];
    const perfTime = band.estimatedTime;

    const bandStart = currentMinutes;

    // Raw end = start + performance + transition
    const rawEnd = bandStart + perfTime + transitionTime;

    // Round up to next multiple of minUnit
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

    // Next band starts at the rounded end
    currentMinutes = roundedEnd;
  }

  return schedule;
}

function parseTimeToMinutes(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatMinutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── HTML Templates ───────────────────────────────────────────────

function buildTimingHTML(details, bands, timing, totalCost) {
  return `
    <section class="section">
      <div class="step-nav">
        <button type="button" id="back-to-results" class="btn btn-secondary">\u2190 タイムテーブル選択に戻る</button>
        <h2 class="section-title section-title-inline">Step 4: タイミング設定</h2>
      </div>

      <p class="subsection-desc">選択されたタイムテーブル（合計転換コスト: ${totalCost}）にタイムスタンプを設定します。</p>

      <div class="subsection">
        <h3 class="subsection-title">タイミング設定</h3>
        <p class="subsection-desc">
          「最小時間単位」は、各バンドの終了時刻を丸める単位です。<br>
          例: 5分に設定すると、演奏＋転換の合計が12分でも終了時刻は15分に切り上げられます。
        </p>
        <div class="timing-form">
          <label class="form-label">
            最小時間単位（分）
            <input type="number" id="min-unit" class="form-input" min="1" value="${timing.minUnit}" />
          </label>
          <label class="form-label">
            転換時間（分）
            <input type="number" id="transition-time" class="form-input" min="0" value="${timing.transitionTime}" />
          </label>
          <label class="form-label">
            開始時刻
            <input type="time" id="start-time" class="form-input" value="${timing.startTime}" />
          </label>
          <button type="button" id="calc-timestamps" class="btn btn-primary">タイムスタンプ計算</button>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">タイムテーブル</h3>
        <div class="band-table-wrap">
          <table class="band-table timestamp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>時間</th>
                <th>バンド名</th>
                <th>演奏時間</th>
                <th>転換コスト</th>
              </tr>
            </thead>
            <tbody id="timestamp-body">
              <tr><td colspan="5" class="text-muted text-center">「タイムスタンプ計算」を押して計算してください</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="subsection actions-bar">
        <button type="button" id="proceed-to-export" class="btn btn-accent hidden">\u2192 最終調整へ (Step 5)</button>
      </div>
    </section>
  `;
}

function renderTimestampTable(tbody, schedule) {
  tbody.innerHTML = schedule
    .map(
      (row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="timestamp-cell">${row.startTime}\u301C${row.endTime}</td>
      <td>${escapeHTML(row.name)}</td>
      <td>${row.perfTime}分</td>
      <td>${row.cost === null ? '-' : row.cost}</td>
    </tr>
  `,
    )
    .join('');
}

// Exported for Step 5 member breakdown
export { PART_LABELS_SHORT };

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
