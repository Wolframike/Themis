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
const SLOT_DRUMS = 4;
const SLOT_KEYBOARD = 5;

const PART_NAMES = [
  'Vocal',
  'Lead Guitar',
  'Backing Guitar',
  'Bass',
  'Drums',
  'Keyboard',
];

/**
 * Default cost weights per instrument slot.
 * Index: [Vocal, Lead Guitar, Backing Guitar, Bass, Drums, Keyboard]
 * Vocal defaults to 0 (changes are free), others default to 1.
 */
const DEFAULT_COST_WEIGHTS = [0, 1, 1, 1, 0, 1];

/**
 * Compute the cost of a single slot transition.
 * @param {string} a - member in slot for band A
 * @param {string} b - member in slot for band B
 * @param {boolean} freeLeave - if true, person -> "n/a" costs 0
 * @returns {number} 0 or 1 (before weight is applied)
 */
function slotCost(a, b, freeLeave) {
  if (a === b) return 0;
  if (freeLeave && a !== 'n/a' && b === 'n/a') return 0;
  return 1;
}

/**
 * Compute transition cost between two consecutive bands.
 * Each slot's binary change (0/1) is multiplied by its cost weight.
 * When distinguishGuitar is false, guitar slots are interchangeable.
 *
 * @param {string[]} membersA - 6-element array of member names for band A
 * @param {string[]} membersB - 6-element array of member names for band B
 * @param {boolean} distinguishGuitar
 * @param {boolean} freeLeave
 * @param {number[]} [costWeights] - 6-element array of per-slot cost weights (0-3)
 * @returns {number}
 */
export function transitionCost(membersA, membersB, distinguishGuitar, freeLeave, costWeights) {
  const w = costWeights || DEFAULT_COST_WEIGHTS;
  let cost = 0;

  if (distinguishGuitar) {
    for (let i = 0; i <= 5; i++) {
      cost += slotCost(membersA[i], membersB[i], freeLeave) * w[i];
    }
  } else {
    // Vocal
    cost += slotCost(membersA[SLOT_VOCAL], membersB[SLOT_VOCAL], freeLeave) * w[SLOT_VOCAL];

    // Guitar slots are interchangeable — try both matchings, pick lower cost
    // Use the max guitar weight for both slots when interchangeable
    const gw = Math.max(w[SLOT_LEAD_GUITAR], w[SLOT_BACKING_GUITAR]);
    const opt1 =
      slotCost(membersA[SLOT_LEAD_GUITAR], membersB[SLOT_LEAD_GUITAR], freeLeave) * gw +
      slotCost(membersA[SLOT_BACKING_GUITAR], membersB[SLOT_BACKING_GUITAR], freeLeave) * gw;
    const opt2 =
      slotCost(membersA[SLOT_LEAD_GUITAR], membersB[SLOT_BACKING_GUITAR], freeLeave) * gw +
      slotCost(membersA[SLOT_BACKING_GUITAR], membersB[SLOT_LEAD_GUITAR], freeLeave) * gw;
    cost += Math.min(opt1, opt2);

    // Bass, Drums, Keyboard: normal comparison
    for (let i = SLOT_BASS; i <= SLOT_KEYBOARD; i++) {
      cost += slotCost(membersA[i], membersB[i], freeLeave) * w[i];
    }
  }

  return cost;
}

/**
 * Popcount — count set bits in a 32-bit integer.
 * @param {number} n
 * @returns {number}
 */
function popcount(n) {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

/**
 * Solve the optimal ordering using Held-Karp bitmask DP.
 *
 * @param {Array<{name: string, members: string[]}>} bands
 *   Array of band objects. Each has a `name` and a `members` array of length 6.
 * @param {Object} options
 * @param {boolean} options.distinguishGuitar - treat lead/backing guitar as separate (default true)
 * @param {boolean} options.freeLeave - person -> n/a costs 0 (default false)
 * @param {number[]} options.costWeights - 6-element array of per-slot cost weights (0-3)
 * @param {Object} options.constraints - optional placement constraints
 * @param {number|null} options.constraints.fixedLast - index of band fixed to last position
 * @param {Array<{bandIndex: number, maxPosition: number, requiredBefore: number[]}>} options.constraints.rules
 *   Custom constraint rules for band placement.
 * @param {Array<{bandIndex: number, exactPosition: number}>} options.constraints.fixedPositions
 *   Bands that must be placed at an exact position (1-indexed).
 * @param {Array<{before: number, after: number}>} options.constraints.bandOrdering
 *   Band ordering constraints: band `before` must appear before band `after`.
 * @param {Array<{player: string, position: number, mode: 'before'|'after'}>} options.constraints.playerAppearance
 *   Player appearance constraints: all bands with this player must be before/after position.
 * @param {number} [topK=3] - number of top results to return
 * @returns {Array<{path: number[], cost: number}>} top K results sorted by cost
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
  } = constraints;

  const n = bands.length;

  // Determine which bands participate in the DP permutation
  const permIndices = [];
  for (let i = 0; i < n; i++) {
    if (i !== fixedLast) permIndices.push(i);
  }
  const pn = permIndices.length; // number of bands in permutation

  if (pn > 20) {
    throw new Error(`Too many bands for bitmask DP (${pn}). Max supported is 20.`);
  }

  // Map global band index -> local DP index
  const globalToLocal = new Map();
  permIndices.forEach((gi, li) => globalToLocal.set(gi, li));

  // Pre-build local constraint lookup from legacy rules
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

  // Build local fixed-position constraints
  const localFixedPositions = fixedPositions
    .filter((fp) => globalToLocal.has(fp.bandIndex))
    .map((fp) => ({
      localIndex: globalToLocal.get(fp.bandIndex),
      position: fp.exactPosition,
    }));

  // Build local band-ordering constraints
  const localBandOrdering = bandOrdering
    .filter((bo) => globalToLocal.has(bo.before) && globalToLocal.has(bo.after))
    .map((bo) => ({
      before: globalToLocal.get(bo.before),
      after: globalToLocal.get(bo.after),
    }));

  // Resolve player appearance constraints to band indices
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

  // Pre-compute cost matrix (local indices)
  const costMatrix = Array.from({ length: pn }, () => new Int32Array(pn));
  for (let i = 0; i < pn; i++) {
    for (let j = 0; j < pn; j++) {
      if (i !== j) {
        costMatrix[i][j] = transitionCost(
          bands[permIndices[i]].members,
          bands[permIndices[j]].members,
          distinguishGuitar,
          freeLeave,
          costWeights,
        );
      }
    }
  }

  // Cost to fixed-last band (if any)
  let costToFixed = null;
  if (fixedLast !== null) {
    costToFixed = new Int32Array(pn);
    for (let i = 0; i < pn; i++) {
      costToFixed[i] = transitionCost(
        bands[permIndices[i]].members,
        bands[fixedLast].members,
        distinguishGuitar,
        freeLeave,
        costWeights,
      );
    }
  }

  // Bitmask DP
  const INF = 0x7fffffff;
  const states = 1 << pn;
  const fullMask = states - 1;

  // Use flat arrays for better performance: dp[last * states + mask]
  const dp = new Int32Array(pn * states).fill(INF);
  const parent = new Int32Array(pn * states).fill(-1);

  // Check if a band can be placed as the very first band (position 1)
  function canStartWith(localIdx) {
    // Legacy rules: needs something before it, or minPosition > 1
    for (const rule of localRules) {
      if (rule.localIndex === localIdx) {
        if (rule.requiredBefore.length > 0) return false;
        if (rule.minPosition && 1 < rule.minPosition) return false;
      }
    }
    // Fixed position: must be at position 1
    for (const fp of localFixedPositions) {
      if (fp.localIndex === localIdx && fp.position !== 1) return false;
      if (fp.localIndex !== localIdx && fp.position === 1) return false;
    }
    // Band ordering: if this band must come after another, can't be first
    for (const bo of localBandOrdering) {
      if (bo.after === localIdx) return false;
    }
    // Player appearance 'after': if bands with player must be after pos X and X > 1,
    // this band can still be first (pos 1 < X is fine for 'after' only if pos >= X)
    for (const pa of localPlayerAppearance) {
      if (pa.mode === 'after' && pa.localBands.includes(localIdx) && 1 < pa.position) {
        return false;
      }
    }
    return true;
  }

  // Check if placing `nxt` at position `pos` (1-indexed) with current `mask` is valid
  function canPlace(nxt, mask, pos) {
    // Legacy rules
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

    // Fixed position: this band must be at exactPosition
    for (const fp of localFixedPositions) {
      if (fp.localIndex === nxt && fp.position !== pos) return false;
      if (fp.localIndex !== nxt && fp.position === pos) return false;
    }

    // Band ordering: band `before` must already be placed before band `after`
    for (const bo of localBandOrdering) {
      if (bo.after === nxt && !(mask & (1 << bo.before))) return false;
    }

    // Player appearance constraints
    for (const pa of localPlayerAppearance) {
      if (!pa.localBands.includes(nxt)) continue;
      if (pa.mode === 'before' && pos > pa.position) return false;
      if (pa.mode === 'after' && pos < pa.position) return false;
    }

    return true;
  }

  // Base cases
  for (let i = 0; i < pn; i++) {
    if (!canStartWith(i)) continue;
    dp[i * states + (1 << i)] = 0;
  }

  // Main DP loop
  for (let mask = 1; mask < states; mask++) {
    for (let last = 0; last < pn; last++) {
      const idx = last * states + mask;
      if (dp[idx] === INF) continue;
      if (!(mask & (1 << last))) continue;

      const currentCost = dp[idx];
      const nextPos = popcount(mask) + 1;

      for (let nxt = 0; nxt < pn; nxt++) {
        if (mask & (1 << nxt)) continue; // already placed

        if (!canPlace(nxt, mask, nextPos)) continue;

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

  // Collect top K results
  const candidates = [];
  for (let last = 0; last < pn; last++) {
    const idx = last * states + fullMask;
    if (dp[idx] === INF) continue;
    const total = costToFixed !== null ? dp[idx] + costToFixed[last] : dp[idx];
    candidates.push({ last, cost: total });
  }

  if (candidates.length === 0) {
    return [];
  }

  candidates.sort((a, b) => a.cost - b.cost);

  // Reconstruct paths for top K
  const results = [];
  const seen = new Set();

  for (const candidate of candidates) {
    if (results.length >= topK) break;

    // Reconstruct path
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

    // Convert to global indices
    const pathGlobal = pathLocal.map((li) => permIndices[li]);
    if (fixedLast !== null) pathGlobal.push(fixedLast);

    const key = pathGlobal.join(',');
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({ path: pathGlobal, cost: candidate.cost });
  }

  return results;
}

/**
 * Compute detailed per-row transition costs for a given path.
 *
 * @param {Array<{name: string, members: string[]}>} bands
 * @param {number[]} path - ordered band indices
 * @param {boolean} distinguishGuitar
 * @param {boolean} freeLeave
 * @param {number[]} [costWeights] - per-slot cost weights
 * @returns {Array<{bandIndex: number, name: string, members: string[], cost: number|null}>}
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
            distinguishGuitar,
            freeLeave,
            costWeights,
          );
    return {
      bandIndex: bandIdx,
      name: band.name,
      members: band.members,
      cost,
    };
  });
}

export { PART_NAMES, DEFAULT_COST_WEIGHTS };
