/**
 * Timetable Optimizer — Held-Karp bitmask DP solver
 *
 * Finds the optimal band performance order that minimizes
 * transition cost (member changes between consecutive bands).
 *
 * Ported from references/timetable_optimizer.py
 */

// Slot indices
const SLOT_VOCAL = 0;
const SLOT_LEAD_GUITAR = 1;
const SLOT_BACKING_GUITAR = 2;
const SLOT_BASS = 3;
const SLOT_KEYBOARD = 5;


const DEFAULT_COST_WEIGHTS = [0, 1, 1, 1, 0, 1];

function slotCost(a, b, freeLeave) {
  if (a === b) return 0;
  if (freeLeave && a !== 'n/a' && b === 'n/a') return 0;
  return 1;
}

/**
 * Compute transition cost between two consecutive bands.
 */
export function transitionCost(membersA, membersB, distinguishGuitar, freeLeave, costWeights) {
  const w = costWeights || DEFAULT_COST_WEIGHTS;
  let cost = 0;

  if (distinguishGuitar) {
    for (let i = 0; i <= 5; i++) {
      cost += slotCost(membersA[i], membersB[i], freeLeave) * w[i];
    }
  } else {
    cost += slotCost(membersA[SLOT_VOCAL], membersB[SLOT_VOCAL], freeLeave) * w[SLOT_VOCAL];

    const gw = Math.max(w[SLOT_LEAD_GUITAR], w[SLOT_BACKING_GUITAR]);
    const opt1 =
      slotCost(membersA[SLOT_LEAD_GUITAR], membersB[SLOT_LEAD_GUITAR], freeLeave) * gw +
      slotCost(membersA[SLOT_BACKING_GUITAR], membersB[SLOT_BACKING_GUITAR], freeLeave) * gw;
    const opt2 =
      slotCost(membersA[SLOT_LEAD_GUITAR], membersB[SLOT_BACKING_GUITAR], freeLeave) * gw +
      slotCost(membersA[SLOT_BACKING_GUITAR], membersB[SLOT_LEAD_GUITAR], freeLeave) * gw;
    cost += Math.min(opt1, opt2);

    for (let i = SLOT_BASS; i <= SLOT_KEYBOARD; i++) {
      cost += slotCost(membersA[i], membersB[i], freeLeave) * w[i];
    }
  }

  return cost;
}

function popcount(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/**
 * Solve the optimal ordering using Held-Karp bitmask DP.
 *
 * Appearance span constraints are handled by converting them to
 * playerAppearance (position window) constraints and running the
 * core DP for each valid window placement.
 *
 * @param {Array<{name: string, members: string[]}>} bands
 * @param {Object} options
 * @param {number} [topK=3]
 * @returns {Array<{path: number[], cost: number}>}
 */
export function solve(bands, options = {}, topK = 3) {
  const {
    distinguishGuitar = true,
    freeLeave = false,
    costWeights,
    constraints = {},
  } = options;

  const {
    fixedLast = null,
    rules = [],
    fixedPositions = [],
    bandOrdering = [],
    playerAppearance = [],
    consecutiveLimit = null,
    bandAdjacency = [],
    appearanceSpan = [],
  } = constraints;

  const n = bands.length;

  // ─── Appearance Span → Window Enumeration ────────────────────
  // Convert each span rule into position-window constraints and
  // run the core DP per window. Collect best results across all.
  if (appearanceSpan.length > 0) {
    const spanInfos = appearanceSpan.map((as) => {
      let count = 0;
      for (const band of bands) {
        if (band.members.some((m) => m === as.player)) count++;
      }
      return { player: as.player, spanLimit: as.spanLimit, bandCount: count };
    });

    // Window start positions for each span rule
    const windowRanges = spanInfos.map((si) => {
      const positions = [];
      for (let start = 1; start <= n - si.spanLimit + 1; start++) {
        positions.push(start);
      }
      return positions;
    });

    // Cartesian product of window starts (capped for sanity)
    const allResults = [];
    const seenPaths = new Set();
    let tried = 0;
    const maxCombinations = 200;

    function enumerate(idx, current) {
      if (tried >= maxCombinations) return;
      if (idx === windowRanges.length) {
        tried++;

        // Build extra playerAppearance constraints from windows
        const extraPA = [];
        for (let i = 0; i < spanInfos.length; i++) {
          const start = current[i];
          const end = start + spanInfos[i].spanLimit - 1;
          extraPA.push({ player: spanInfos[i].player, position: start, mode: 'after' });
          extraPA.push({ player: spanInfos[i].player, position: end, mode: 'before' });
        }

        try {
          const subResults = solve(bands, {
            distinguishGuitar, freeLeave, costWeights,
            constraints: {
              fixedLast, rules, fixedPositions, bandOrdering,
              playerAppearance: [...playerAppearance, ...extraPA],
              consecutiveLimit, bandAdjacency,
              appearanceSpan: [],
            },
          }, topK);

          for (const r of subResults) {
            const key = r.path.join(',');
            if (!seenPaths.has(key)) {
              seenPaths.add(key);
              allResults.push(r);
            }
          }
        } catch {
          // Window combination may conflict with other constraints — skip
        }
        return;
      }

      for (const val of windowRanges[idx]) {
        current.push(val);
        enumerate(idx + 1, current);
        current.pop();
        if (tried >= maxCombinations) return;
      }
    }

    enumerate(0, []);
    allResults.sort((a, b) => a.cost - b.cost);
    return allResults.slice(0, topK);
  }

  // ─── Core Held-Karp DP ───────────────────────────────────────

  const permIndices = [];
  for (let i = 0; i < n; i++) {
    if (i !== fixedLast) permIndices.push(i);
  }
  const pn = permIndices.length;

  if (pn > 20) {
    throw new Error(`Too many bands for bitmask DP (${pn}). Max supported is 20.`);
  }

  const globalToLocal = new Map();
  permIndices.forEach((gi, li) => globalToLocal.set(gi, li));

  // Local constraint mappings
  const localRules = rules
    .filter((r) => globalToLocal.has(r.bandIndex))
    .map((r) => ({
      localIndex: globalToLocal.get(r.bandIndex),
      maxPosition: r.maxPosition || null,
      minPosition: r.minPosition || null,
      requiredBefore: (r.requiredBefore || [])
        .filter((gi) => globalToLocal.has(gi))
        .map((gi) => globalToLocal.get(gi)),
    }));

  const localFixedPositions = fixedPositions
    .filter((fp) => globalToLocal.has(fp.bandIndex))
    .map((fp) => ({
      localIndex: globalToLocal.get(fp.bandIndex),
      position: fp.exactPosition,
    }));

  const localBandOrdering = bandOrdering
    .filter((bo) => globalToLocal.has(bo.before) && globalToLocal.has(bo.after))
    .map((bo) => ({
      before: globalToLocal.get(bo.before),
      after: globalToLocal.get(bo.after),
    }));

  const localPlayerAppearance = [];
  for (const pa of playerAppearance) {
    const bandIndices = [];
    for (let i = 0; i < n; i++) {
      if (i === fixedLast) continue;
      if (bands[i].members.some((m) => m === pa.player)) {
        if (globalToLocal.has(i)) bandIndices.push(globalToLocal.get(i));
      }
    }
    if (bandIndices.length > 0) {
      localPlayerAppearance.push({
        localBands: bandIndices,
        position: pa.position,
        mode: pa.mode,
      });
    }
  }

  const localBandAdjacency = bandAdjacency
    .filter((ba) => globalToLocal.has(ba.before) && globalToLocal.has(ba.after))
    .map((ba) => ({
      before: globalToLocal.get(ba.before),
      after: globalToLocal.get(ba.after),
    }));

  // Pre-compute shared-member matrix for consecutive limit (K=1)
  let sharesMember = null;
  if (consecutiveLimit === 1) {
    sharesMember = Array.from({ length: pn }, () => new Uint8Array(pn));
    for (let i = 0; i < pn; i++) {
      for (let j = i + 1; j < pn; j++) {
        const mI = bands[permIndices[i]].members;
        const mJ = bands[permIndices[j]].members;
        let shared = false;
        for (let s = 0; s < mI.length; s++) {
          if (mI[s] !== 'n/a') {
            for (let t = 0; t < mJ.length; t++) {
              if (mI[s] === mJ[t]) { shared = true; break; }
            }
          }
          if (shared) break;
        }
        if (shared) {
          sharesMember[i][j] = 1;
          sharesMember[j][i] = 1;
        }
      }
    }
  }

  // Pre-compute member sets for consecutive limit (K>=2)
  let bandMemberSets = null;
  if (consecutiveLimit !== null && consecutiveLimit >= 2) {
    bandMemberSets = permIndices.map((gi) =>
      new Set(bands[gi].members.filter((m) => m !== 'n/a')),
    );
  }

  // Cost matrix
  const costMatrix = Array.from({ length: pn }, () => new Int32Array(pn));
  for (let i = 0; i < pn; i++) {
    for (let j = 0; j < pn; j++) {
      if (i !== j) {
        costMatrix[i][j] = transitionCost(
          bands[permIndices[i]].members,
          bands[permIndices[j]].members,
          distinguishGuitar, freeLeave, costWeights,
        );
      }
    }
  }

  let costToFixed = null;
  if (fixedLast !== null) {
    costToFixed = new Int32Array(pn);
    for (let i = 0; i < pn; i++) {
      costToFixed[i] = transitionCost(
        bands[permIndices[i]].members,
        bands[fixedLast].members,
        distinguishGuitar, freeLeave, costWeights,
      );
    }
  }

  // DP arrays
  const INF = 0x7fffffff;
  const states = 1 << pn;
  const fullMask = states - 1;
  const dp = new Int32Array(pn * states).fill(INF);
  const parent = new Int32Array(pn * states).fill(-1);

  function canStartWith(localIdx) {
    for (const rule of localRules) {
      if (rule.localIndex === localIdx) {
        if (rule.requiredBefore.length > 0) return false;
        if (rule.minPosition && 1 < rule.minPosition) return false;
      }
    }
    for (const fp of localFixedPositions) {
      if (fp.localIndex === localIdx && fp.position !== 1) return false;
      if (fp.localIndex !== localIdx && fp.position === 1) return false;
    }
    for (const bo of localBandOrdering) {
      if (bo.after === localIdx) return false;
    }
    for (const pa of localPlayerAppearance) {
      if (pa.mode === 'after' && pa.localBands.includes(localIdx) && 1 < pa.position) {
        return false;
      }
    }
    for (const adj of localBandAdjacency) {
      if (adj.after === localIdx) return false;
    }
    return true;
  }

  function canPlace(nxt, mask, pos, last) {
    for (const rule of localRules) {
      if (rule.localIndex !== nxt) continue;
      if (rule.maxPosition && pos > rule.maxPosition) return false;
      if (rule.minPosition && pos < rule.minPosition) return false;
      if (rule.requiredBefore.length > 0) {
        let found = false;
        for (const req of rule.requiredBefore) {
          if (mask & (1 << req)) { found = true; break; }
        }
        if (!found) return false;
      }
    }

    for (const fp of localFixedPositions) {
      if (fp.localIndex === nxt && fp.position !== pos) return false;
      if (fp.localIndex !== nxt && fp.position === pos) return false;
    }

    for (const bo of localBandOrdering) {
      if (bo.after === nxt && !(mask & (1 << bo.before))) return false;
    }

    for (const pa of localPlayerAppearance) {
      if (!pa.localBands.includes(nxt)) continue;
      if (pa.mode === 'before' && pos > pa.position) return false;
      if (pa.mode === 'after' && pos < pa.position) return false;
    }

    if (sharesMember && last >= 0 && sharesMember[last][nxt]) {
      return false;
    }

    if (bandMemberSets && consecutiveLimit >= 2) {
      const win = [nxt];
      let curBand = last;
      let curMask = mask;
      for (let k = 0; k <= consecutiveLimit - 1; k++) {
        win.push(curBand);
        if (win.length === consecutiveLimit + 1) break;
        const prev = parent[curBand * states + curMask];
        if (prev === -1) break;
        curMask ^= (1 << curBand);
        curBand = prev;
      }
      if (win.length === consecutiveLimit + 1) {
        const first = bandMemberSets[win[0]];
        for (const m of first) {
          let inAll = true;
          for (let k = 1; k < win.length; k++) {
            if (!bandMemberSets[win[k]].has(m)) { inAll = false; break; }
          }
          if (inAll) return false;
        }
      }
    }

    for (const adj of localBandAdjacency) {
      if (adj.after === nxt && last !== adj.before) return false;
      if (adj.before === last && nxt !== adj.after) return false;
    }

    return true;
  }

  // Base cases
  for (let i = 0; i < pn; i++) {
    if (!canStartWith(i)) continue;
    dp[i * states + (1 << i)] = 0;
  }

  // Main DP
  for (let mask = 1; mask < states; mask++) {
    for (let last = 0; last < pn; last++) {
      const idx = last * states + mask;
      if (dp[idx] === INF) continue;
      if (!(mask & (1 << last))) continue;

      const currentCost = dp[idx];
      const nextPos = popcount(mask) + 1;

      for (let nxt = 0; nxt < pn; nxt++) {
        if (mask & (1 << nxt)) continue;
        if (!canPlace(nxt, mask, nextPos, last)) continue;

        const newMask = mask | (1 << nxt);
        const newCost = currentCost + costMatrix[last][nxt];
        const nxtIdx = nxt * states + newMask;
        if (newCost < dp[nxtIdx]) {
          dp[nxtIdx] = newCost;
          parent[nxtIdx] = last;
        }
      }
    }
  }

  // Collect and reconstruct
  const candidates = [];
  for (let last = 0; last < pn; last++) {
    const idx = last * states + fullMask;
    if (dp[idx] === INF) continue;
    const total = costToFixed !== null ? dp[idx] + costToFixed[last] : dp[idx];
    candidates.push({ last, cost: total });
  }

  if (candidates.length === 0) return [];

  candidates.sort((a, b) => a.cost - b.cost);

  const results = [];
  const seen = new Set();

  for (const candidate of candidates) {
    if (results.length >= topK) break;

    const pathLocal = [];
    let mask = fullMask;
    let cur = candidate.last;
    while (cur !== -1) {
      pathLocal.push(cur);
      const prev = parent[cur * states + mask];
      mask ^= (1 << cur);
      cur = prev;
    }
    pathLocal.reverse();

    const pathGlobal = pathLocal.map((li) => permIndices[li]);
    if (fixedLast !== null) pathGlobal.push(fixedLast);

    const key = pathGlobal.join(',');
    if (seen.has(key)) continue;
    seen.add(key);

    // Post-filter: consecutive limit for K >= 2
    if (consecutiveLimit !== null && consecutiveLimit >= 2) {
      if (!checkConsecutiveLimit(pathGlobal, bands, consecutiveLimit)) continue;
    }

    results.push({ path: pathGlobal, cost: candidate.cost });
  }

  return results;
}

/**
 * Check if a path satisfies the consecutive performance limit.
 */
function checkConsecutiveLimit(path, bands, limit) {
  const memberConsec = new Map();

  for (let i = 0; i < path.length; i++) {
    const currentMembers = new Set(
      bands[path[i]].members.filter((m) => m !== 'n/a'),
    );
    const newConsec = new Map();

    for (const member of currentMembers) {
      const prev = memberConsec.get(member) || 0;
      const count = prev + 1;
      if (count > limit) return false;
      newConsec.set(member, count);
    }

    memberConsec.clear();
    for (const [m, c] of newConsec) {
      memberConsec.set(m, c);
    }
  }

  return true;
}

/**
 * Compute detailed per-row transition costs for a given path.
 */
export function computeScheduleDetails(bands, path, distinguishGuitar, freeLeave, costWeights) {
  return path.map((bandIdx, i) => {
    const band = bands[bandIdx];
    const cost =
      i === 0
        ? null
        : transitionCost(
            bands[path[i - 1]].members,
            band.members,
            distinguishGuitar, freeLeave, costWeights,
          );
    return {
      bandIndex: bandIdx,
      name: band.name,
      members: band.members,
      cost,
    };
  });
}

export { DEFAULT_COST_WEIGHTS };
