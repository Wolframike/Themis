/**
 * Right Panel for Themis v2.
 * Stats, member activity, arc visualization, and clipboard export.
 */

import { saveState } from './state.js';
import { escapeHTML, PART_LABELS, getPlayerColor, parseTimeToMinutes, formatMinutesToTime, buildBreakMap } from './utils.js';

/**
 * Render the entire right panel based on app state.
 */
export function renderRightPanel(container, appState, onBreaksChanged) {
  const bands = appState.bands;
  const schedule = appState.schedule;
  const results = appState.results;

  if (!results || !schedule || schedule.length === 0) {
    // Show placeholder
    container.innerHTML = `
      <div class="right-placeholder">
        最適化を実行すると<br>統計情報が表示されます
      </div>
    `;
    return;
  }

  const selectedResult = results[appState.selectedResultIndex];
  const totalCost = selectedResult ? selectedResult.cost : 0;

  // Calculate total duration with breaks
  const breakMap = buildBreakMap(appState.breaks);

  const timing = appState.timing;
  const firstStart = schedule[0].startTime;

  // Recalculate end time with breaks
  let endMinutes = schedule[schedule.length - 1].endMinutes;
  let totalBreakTime = 0;
  for (const b of appState.breaks) {
    totalBreakTime += b.duration;
  }
  endMinutes = schedule[0].startMinutes;
  for (let i = 0; i < schedule.length; i++) {
    const perfTime = schedule[i].perfTime;
    const transitionTime = timing.transitionTime || 5;
    const minUnit = timing.minUnit || 5;
    const rawEnd = endMinutes + perfTime + transitionTime;
    endMinutes = Math.ceil(rawEnd / minUnit) * minUnit;
    if (breakMap.has(i)) endMinutes += breakMap.get(i);
  }
  const lastEnd = formatMinutesToTime(endMinutes);

  // Compute total duration in human format
  const totalMin = endMinutes - parseTimeToMinutes(firstStart);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const durationStr = hrs > 0 ? `${hrs}:${String(mins).padStart(2, '0')}` : `${mins}`;

  // Transition count
  const transitions = schedule.length - 1;
  const avgCost = transitions > 0 ? (totalCost / transitions).toFixed(1) : '0';

  // Get all unique players from bands in schedule
  const allPlayers = appState.players;
  const scheduleBandIndices = schedule.map((s) => s.bandIndex);

  // Count band appearances per player (in scheduled order)
  const playerCounts = {};
  allPlayers.forEach((p) => { playerCounts[p] = 0; });
  for (const idx of scheduleBandIndices) {
    const band = bands[idx];
    if (!band) continue;
    for (const m of band.members) {
      if (m !== 'n/a' && playerCounts[m] !== undefined) {
        playerCounts[m]++;
      }
    }
  }

  // Sort players by count desc
  const sortedPlayers = [...allPlayers].filter((p) => playerCounts[p] > 0).sort((a, b) => playerCounts[b] - playerCounts[a]);

  // Build member pips (one per band slot in schedule)
  const memberRows = sortedPlayers.slice(0, 12).map((p) => {
    const color = getPlayerColor(allPlayers, p);
    const pips = scheduleBandIndices.map((bi) => {
      const band = bands[bi];
      const isIn = band && band.members.includes(p);
      return `<div class="member-pip" style="background:${isIn ? color : 'var(--bg-3)'}"></div>`;
    }).join('');
    return `
      <div class="member-row" data-member="${escapeHTML(p)}">
        <span class="member-name" style="color:${color}">${escapeHTML(p)}</span>
        <div class="member-pips">${pips}</div>
        <span class="member-count">${playerCounts[p]}×</span>
      </div>
    `;
  }).join('');

  // Build arc SVG
  const arcSvg = buildArcSvg(scheduleBandIndices, bands, allPlayers);

  container.innerHTML = `
    <div class="stat-block">
      <div class="stat-label">total cost</div>
      <div class="stat-value">${totalCost}<span class="unit">pts</span></div>
      <div class="stat-sub">#${appState.selectedResultIndex + 1} of ${results.length} results</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">duration</div>
      <div class="stat-value">${durationStr}<span class="unit">${hrs > 0 ? 'hrs' : 'min'}</span></div>
      <div class="stat-sub">${firstStart} → ${lastEnd}${totalBreakTime > 0 ? ` (休憩${totalBreakTime}分含む)` : ''}</div>
    </div>

    <div class="stat-block">
      <div class="stat-label">transitions</div>
      <div class="stat-value">${transitions}</div>
      <div class="stat-sub">avg ${avgCost} cost / transition</div>
    </div>

    <div class="member-section">
      <div class="member-section-title">
        出演メンバー
        <span style="font-family:var(--font-mono);font-size:0.58rem;color:var(--text-3)">${sortedPlayers.length} players</span>
      </div>
      ${memberRows}
    </div>

    <div class="arc-section" style="position:relative">
      <div class="arc-title">Member Flow <span style="font-size:0.55rem;color:var(--text-3);font-weight:400;margin-left:0.3rem">hover to explore</span></div>
      <svg class="arc-svg" id="arc-svg" viewBox="0 0 240 130">${arcSvg}</svg>
      <div class="arc-tooltip" id="arc-tooltip"></div>
    </div>

    <div class="export-section">
      <button type="button" class="export-btn" id="export-img-btn">画像として保存</button>
      <div class="export-hint">タイムテーブルをPNG画像でダウンロード</div>
      <button type="button" class="export-btn" id="export-btn" style="margin-top:0.5rem;background:var(--bg-3);color:var(--text-1);border:1px solid var(--border)">クリップボードにコピー</button>
      <div class="export-hint">タブ区切りテキストとしてコピー</div>
    </div>
  `;

  // Wire export
  const exportBtn = container.querySelector('#export-btn');
  exportBtn.addEventListener('click', () => {
    const text = buildClipboardText(schedule, appState.breaks, bands);
    navigator.clipboard.writeText(text).then(() => {
      exportBtn.textContent = '✓ コピーしました';
      exportBtn.classList.add('copied');
      setTimeout(() => {
        exportBtn.textContent = 'クリップボードにコピー';
        exportBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Wire image export
  const imgBtn = container.querySelector('#export-img-btn');
  imgBtn.addEventListener('click', () => {
    renderTimetableImage(schedule, appState.breaks, bands, appState.timing, totalCost, allPlayers);
  });

  // ─── Wire Member Flow interactivity ────────────────────────────
  const arcSvgEl = container.querySelector('#arc-svg');
  const tooltip = container.querySelector('#arc-tooltip');

  if (arcSvgEl && tooltip) {
    // Hover on arc paths → show tooltip, highlight member
    arcSvgEl.querySelectorAll('.arc-path').forEach((path) => {
      path.addEventListener('mouseenter', (e) => {
        const member = path.dataset.member;
        highlightMember(container, arcSvgEl, member);
        tooltip.textContent = member;
        tooltip.classList.add('visible');
      });

      path.addEventListener('mousemove', (e) => {
        const rect = tooltip.parentElement.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left + 8) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 24) + 'px';
      });

      path.addEventListener('mouseleave', () => {
        clearHighlight(container, arcSvgEl);
        tooltip.classList.remove('visible');
      });
    });

    // Hover on arc dots → highlight the band
    arcSvgEl.querySelectorAll('.arc-dot').forEach((dot) => {
      dot.addEventListener('mouseenter', () => {
        const bandIdx = dot.dataset.bandSlot;
        if (bandIdx !== undefined) {
          // Highlight all arcs touching this band position
          const pos = parseInt(bandIdx, 10);
          arcSvgEl.classList.add('has-highlight');
          arcSvgEl.querySelectorAll(`.arc-path[data-from="${pos}"], .arc-path[data-to="${pos}"]`).forEach((p) => {
            p.classList.add('arc-active');
          });
          dot.classList.add('arc-active');
        }
      });

      dot.addEventListener('mouseleave', () => {
        clearHighlight(container, arcSvgEl);
      });
    });
  }

  // Member row interaction: hover to preview, click to lock focus
  let lockedMember = null;

  function activateMember(member) {
    // Clear everything first
    deactivateAll();
    // Set new active
    const row = container.querySelector(`.member-row[data-member="${CSS.escape(member)}"]`);
    if (row) row.classList.add('active');
    if (arcSvgEl) highlightMember(container, arcSvgEl, member);
    highlightTimelineMember(member, scheduleBandIndices, bands);
  }

  function deactivateAll() {
    container.querySelectorAll('.member-row.active').forEach((r) => r.classList.remove('active'));
    if (arcSvgEl) clearHighlight(container, arcSvgEl);
    clearTimelineHighlight();
  }

  container.querySelectorAll('.member-row').forEach((row) => {
    const member = row.dataset.member;
    if (!member) return;

    row.addEventListener('mouseenter', () => {
      if (lockedMember) return; // Don't override locked focus
      activateMember(member);
    });

    row.addEventListener('mouseleave', () => {
      if (lockedMember) return;
      deactivateAll();
    });

    row.addEventListener('click', () => {
      if (lockedMember === member) {
        // Unlock
        lockedMember = null;
        deactivateAll();
      } else {
        // Lock to this member
        lockedMember = member;
        activateMember(member);
      }
    });
  });
}

function buildArcSvg(scheduleBandIndices, bands, allPlayers) {
  const n = scheduleBandIndices.length;
  if (n < 2) return '';

  const w = 240;
  const baseY = 110;
  const spacing = w / (n + 1);
  let paths = '';
  let dots = '';
  let labels = '';

  // Band position dots + abbreviated labels
  scheduleBandIndices.forEach((bi, i) => {
    const x = spacing * (i + 1);
    const band = bands[bi];
    const abbr = band ? band.name.slice(0, 3) : String(i + 1);
    dots += `<circle class="arc-dot" data-band-slot="${i}" cx="${x}" cy="${baseY}" r="4" fill="var(--gold)" opacity="0.6" style="cursor:pointer"/>`;
    labels += `<text class="arc-label-text" data-band-slot="${i}" x="${x}" y="${baseY + 14}" text-anchor="middle" font-size="5.5" font-family="Outfit, Noto Sans JP, sans-serif" fill="var(--text-3)">${escapeHTML(abbr)}</text>`;
  });

  // Collect all arcs: { from, to, member, consecutive }
  const arcs = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const bandA = bands[scheduleBandIndices[i]];
      const bandB = bands[scheduleBandIndices[j]];
      if (!bandA || !bandB) continue;

      const shared = bandA.members.filter((m) => m !== 'n/a' && bandB.members.includes(m));
      const uniqueShared = [...new Set(shared)];

      for (const m of uniqueShared) {
        arcs.push({ from: i, to: j, member: m, consecutive: j === i + 1 });
      }
    }
  }

  // Sort: consecutive first, then by span (shorter first) for better layering
  arcs.sort((a, b) => {
    if (a.consecutive !== b.consecutive) return a.consecutive ? -1 : 1;
    return (a.to - a.from) - (b.to - b.from);
  });

  // Track height offset per column-pair to avoid overlap
  const pairHeights = {};

  for (const arc of arcs) {
    const x1 = spacing * (arc.from + 1);
    const x2 = spacing * (arc.to + 1);
    const span = arc.to - arc.from;
    const pairKey = `${arc.from}-${arc.to}`;
    const slotOffset = pairHeights[pairKey] || 0;
    pairHeights[pairKey] = slotOffset + 1;

    // Height scales with span + offset for overlapping arcs at same pair
    const baseHeight = arc.consecutive ? 16 : 22 + span * 6;
    const height = baseHeight + slotOffset * 10;
    const cappedHeight = Math.min(height, baseY - 8);

    const color = getPlayerColor(allPlayers, arc.member);
    const opacity = arc.consecutive ? 0.5 : 0.2;
    const strokeW = arc.consecutive ? 1.5 : 1;
    const dash = arc.consecutive ? '' : 'stroke-dasharray="3,2"';

    paths += `<path class="arc-path" data-member="${escapeHTML(arc.member)}" data-from="${arc.from}" data-to="${arc.to}" d="M${x1},${baseY} Q${(x1 + x2) / 2},${baseY - cappedHeight} ${x2},${baseY}" fill="none" stroke="${color}" stroke-width="${strokeW}" opacity="${opacity}" ${dash} style="cursor:pointer"/>`;
  }

  return paths + dots + labels;
}

// ─── Highlight helpers ───────────────────────────────────────────

function highlightMember(container, svgEl, memberName) {
  svgEl.classList.add('has-highlight');
  svgEl.querySelectorAll(`.arc-path[data-member="${CSS.escape(memberName)}"]`).forEach((p) => {
    p.classList.add('arc-active');
  });
  // Highlight dots that this member touches
  const activePaths = svgEl.querySelectorAll('.arc-path.arc-active');
  const activeSlots = new Set();
  activePaths.forEach((p) => {
    activeSlots.add(p.dataset.from);
    activeSlots.add(p.dataset.to);
  });
  activeSlots.forEach((slot) => {
    svgEl.querySelectorAll(`[data-band-slot="${slot}"]`).forEach((el) => el.classList.add('arc-active'));
  });
}

function clearHighlight(container, svgEl) {
  svgEl.classList.remove('has-highlight');
  svgEl.querySelectorAll('.arc-active').forEach((el) => el.classList.remove('arc-active'));
}

function highlightTimelineMember(memberName, scheduleBandIndices, bands) {
  const timelineBody = document.getElementById('timeline-body');
  if (!timelineBody) return;

  const cards = timelineBody.querySelectorAll('.band-card');
  cards.forEach((card, idx) => {
    if (idx >= scheduleBandIndices.length) return;
    const band = bands[scheduleBandIndices[idx]];
    if (!band) return;
    if (band.members.includes(memberName)) {
      card.classList.add('member-highlight');
      // Highlight the specific member dot
      card.querySelectorAll('.member-dot').forEach((dot) => {
        if (dot.textContent.includes(memberName)) {
          dot.classList.add('member-highlight');
        }
      });
    }
  });
}

function clearTimelineHighlight() {
  const timelineBody = document.getElementById('timeline-body');
  if (!timelineBody) return;
  timelineBody.querySelectorAll('.member-highlight').forEach((el) => el.classList.remove('member-highlight'));
}

// ─── Image Export ────────────────────────────────────────────────

function renderTimetableImage(schedule, breaks, bands, timing, totalCost, allPlayers) {
  const breakMap = buildBreakMap(breaks);

  // Recalculate times with breaks
  const minUnit = timing.minUnit || 5;
  const transitionTime = timing.transitionTime || 5;
  let currentMin = parseTimeToMinutes(timing.startTime || '12:00');

  const rows = [];
  for (let i = 0; i < schedule.length; i++) {
    const s = schedule[i];
    const band = bands[s.bandIndex];
    const startMin = currentMin;
    const rawEnd = startMin + s.perfTime + transitionTime;
    const endMin = Math.ceil(rawEnd / minUnit) * minUnit;

    const rawMembers = band ? band.members : [];
    // Build part:name pairs for non-empty slots
    const memberParts = [];
    for (let j = 0; j < rawMembers.length; j++) {
      if (rawMembers[j] !== 'n/a') {
        memberParts.push({ part: PART_LABELS[j], name: rawMembers[j] });
      }
    }
    rows.push({
      name: s.name,
      start: formatMinutesToTime(startMin),
      end: formatMinutesToTime(endMin),
      perfTime: s.perfTime,
      cost: s.cost,
      memberParts,
    });

    currentMin = endMin;
    if (breakMap.has(i)) {
      rows.push({ isBreak: true, duration: breakMap.get(i) });
      currentMin += breakMap.get(i);
    }
  }

  // --- Canvas setup ---
  const dpr = 2; // Retina
  const padX = 32;
  const padY = 28;
  const rowH = 56;
  const breakH = 28;
  const headerH = 52;
  const footerH = 36;
  const colTime = 110;
  const colName = 160;
  const colMembers = 260;
  const w = padX * 2 + colTime + colName + colMembers;

  let contentH = headerH;
  for (const r of rows) contentH += r.isBreak ? breakH : rowH;
  contentH += footerH;
  const h = padY * 2 + contentH;

  const canvas = document.createElement('canvas');
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // --- Colors (read from CSS) ---
  const cs = getComputedStyle(document.documentElement);
  const bg0 = cs.getPropertyValue('--bg-0').trim() || '#08090c';
  const bg2 = cs.getPropertyValue('--bg-2').trim() || '#14161d';
  const bg3 = cs.getPropertyValue('--bg-3').trim() || '#1a1d27';
  const text0 = cs.getPropertyValue('--text-0').trim() || '#eae8e3';
  const text1 = cs.getPropertyValue('--text-1').trim() || '#b0ada5';
  const text2 = cs.getPropertyValue('--text-2').trim() || '#706d65';
  const gold = cs.getPropertyValue('--gold').trim() || '#d4a843';
  const border = cs.getPropertyValue('--border').trim() || '#1e2130';
  const greenC = cs.getPropertyValue('--green').trim() || '#5a9e6a';
  const redC = cs.getPropertyValue('--red').trim() || '#c94a42';

  // --- Background ---
  ctx.fillStyle = bg0;
  ctx.fillRect(0, 0, w, h);

  // --- Header ---
  let y = padY;
  const firstStart = rows.find((r) => !r.isBreak)?.start || '--:--';
  const lastEnd = rows.filter((r) => !r.isBreak).pop()?.end || '--:--';

  ctx.fillStyle = text0;
  ctx.font = '600 14px Outfit, Noto Sans JP, sans-serif';
  ctx.fillText('タイムテーブル', padX, y + 20);

  ctx.fillStyle = text1;
  ctx.font = '500 10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${firstStart} → ${lastEnd}`, w - padX, y + 20);
  ctx.textAlign = 'left';

  y += headerH;

  // --- Column headers ---
  ctx.fillStyle = bg3;
  ctx.fillRect(padX, y - 4, w - padX * 2, 22);
  ctx.fillStyle = text2;
  ctx.font = '500 8.5px JetBrains Mono, monospace';
  ctx.fillText('TIME', padX + 8, y + 10);
  ctx.fillText('BAND', padX + colTime + 8, y + 10);
  ctx.fillText('MEMBERS', padX + colTime + colName + 8, y + 10);
  y += 22;

  // --- Rows ---
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row.isBreak) {
      // Break row
      ctx.fillStyle = bg3;
      ctx.fillRect(padX, y, w - padX * 2, breakH);
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(padX, y + breakH);
      ctx.stroke();

      ctx.fillStyle = gold;
      ctx.font = '500 10px Outfit, Noto Sans JP, sans-serif';
      ctx.fillText(`休憩 ${row.duration}分`, padX + 12, y + breakH / 2 + 4);
      y += breakH;
      continue;
    }

    // Alternating row background
    const bandRowIdx = rows.slice(0, i).filter((r) => !r.isBreak).length;
    ctx.fillStyle = bandRowIdx % 2 === 0 ? bg2 : bg0;
    ctx.fillRect(padX, y, w - padX * 2, rowH);

    // Subtle bottom border
    ctx.strokeStyle = border;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padX, y + rowH);
    ctx.lineTo(w - padX, y + rowH);
    ctx.stroke();

    // Time
    ctx.fillStyle = gold;
    ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillText(`${row.start}`, padX + 8, y + 18);
    ctx.fillStyle = text2;
    ctx.font = '400 9px JetBrains Mono, monospace';
    ctx.fillText(`〜${row.end}`, padX + 8, y + 32);

    // Band name
    ctx.fillStyle = text0;
    ctx.font = '600 12px Outfit, Noto Sans JP, sans-serif';
    ctx.fillText(row.name, padX + colTime + 8, y + 18);

    ctx.fillStyle = text2;
    ctx.font = '400 8px JetBrains Mono, monospace';
    ctx.fillText(`${row.perfTime}min`, padX + colTime + 8, y + 32);

    // Members — 2 lines, "Part:Name" pairs
    const mx = padX + colTime + colName + 8;
    const maxMemberW = colMembers - 16;
    const half = Math.ceil(row.memberParts.length / 2);
    const line1 = row.memberParts.slice(0, half);
    const line2 = row.memberParts.slice(half);

    [line1, line2].forEach((line, li) => {
      let cx = mx;
      const ly = y + 18 + li * 16;
      for (const mp of line) {
        ctx.fillStyle = text2;
        ctx.font = '400 7px JetBrains Mono, monospace';
        ctx.fillText(mp.part, cx, ly);
        const partW = ctx.measureText(mp.part).width + 2;
        ctx.fillStyle = text1;
        ctx.font = '400 9px Outfit, Noto Sans JP, sans-serif';
        ctx.fillText(mp.name, cx + partW, ly);
        cx += partW + ctx.measureText(mp.name).width + 10;
        if (cx > mx + maxMemberW) break;
      }
    });

    y += rowH;
  }

  // --- Footer ---
  y += 8;
  ctx.fillStyle = text2;
  ctx.font = '400 8px JetBrains Mono, monospace';
  ctx.fillText(new Date().toLocaleDateString('ja-JP'), padX, y + 12);

  // --- Download ---
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'timetable.png';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}

function buildClipboardText(schedule, breaks, bands) {
  const breakMap = buildBreakMap(breaks);

  const lines = [];

  for (let i = 0; i < schedule.length; i++) {
    const row = schedule[i];
    const band = bands && bands[row.bandIndex];
    const memberStr = band ? band.members.join('\t') : '';
    lines.push(`${row.startTime}〜${row.endTime}\t${row.name}\t${memberStr}\t${row.perfTime}分`);

    const breakDuration = breakMap.get(i);
    if (breakDuration !== undefined) {
      lines.push(`\t休憩 (${breakDuration}分)`);
    }
  }

  return lines.join('\n');
}

