/**
 * 0/1 Knapsack Algorithm using Dynamic Programming with Cardinality Constraint
 *
 * EXACT BIN PRIORITY & KNAPSACK SELECTION SPECIFICATION (DAA EVALUATION REFERENCE):
 * --------------------------------------------------------------------------------
 * 1. Initial Priority Assignment:
 *    - Categorical levels:
 *      * 'Low'    -> Numeric Priority Value = 1
 *      * 'Medium' -> Numeric Priority Value = 2
 *      * 'High'   -> Numeric Priority Value = 3
 *
 * 2. Multi-Day Priority Escalation Policy (calculateEscalatedPriority in binService.js):
 *    - Bins that remain uncollected for multiple consecutive days escalate in priority:
 *      * If pendingDuration >= 3 days: Priority becomes 'High' (Value = 3).
 *      * If pendingDuration == 2 days: 'Low' -> 'Medium' (2); 'Medium' -> 'High' (3).
 *      * If pendingDuration < 2 days:  Original manual priority is preserved.
 *
 * 3. Exact Lexicographic Objective Function in DP:
 *    - Let S be the subset of bins selected for a truck of capacity W.
 *    - Constraints:
 *        Sum(wasteKg_i for i in S) <= W
 *        |S| <= maxItems (default 10, strictly matching Held-Karp O(n² 2ⁿ) TSP limits)
 *    - Primary Objective: Maximize Count |S| = Sum(1 for i in S)
 *    - Secondary Objective (Tie-breaker): Maximize Total Priority P(S) = Sum(PriorityValue_i for i in S)
 *    - Comparing candidate subset C with current best B:
 *      C is strictly preferred if:
 *        Count(C) > Count(B) OR
 *        (Count(C) == Count(B) AND Priority(C) > Priority(B))
 */

export const PRIORITY_WEIGHTS = {
  'Low': 1,
  'Medium': 2,
  'High': 3
};

/**
 * Returns numeric priority weight for algorithmic evaluation
 * @param {string|number} priorityStr - 'Low', 'Medium', 'High' or integer
 * @returns {number} 1, 2, or 3
 */
export function getPriorityValue(priorityStr) {
  if (typeof priorityStr === 'number') return priorityStr;
  return PRIORITY_WEIGHTS[priorityStr] || 1;
}

/**
 * Solves the lexicographic 0/1 Knapsack problem using Dynamic Programming.
 * Respects truck capacity W and maximum trip item count maxItems (to prevent TSP exponential explosion).
 *
 * @param {Array} bins - List of eligible waste bins [{ id, wasteKg, priority, ... }]
 * @param {number} capacity - Truck capacity in kilograms
 * @param {number} [maxItems=10] - Maximum collection items per trip (Held-Karp compatibility)
 * @returns {Object} Selected bins, unselected bins, metrics, and capacity stats
 */
export function solveKnapsack(bins, capacity, maxItems = 10) {
  const cap = Math.floor(Math.max(0, capacity));
  const n = bins.length;
  const limitItems = Math.max(1, maxItems);

  if (n === 0 || cap === 0) {
    return {
      selectedBins: [],
      unselectedBins: [...bins],
      totalWaste: 0,
      totalPriority: 0,
      selectedCount: 0,
      capacity: cap,
      remainingCapacity: cap,
      capacityUtilization: 0
    };
  }

  // dpPriority[w][k] = maximum priority score achievable with weight w and exactly/at most k items
  // dpValid[w][k] = 1 if state (w, k) is reachable, 0 otherwise
  // We keep a 3D table or flattened arrays:
  // (n + 1) items x (cap + 1) weight x (limitItems + 1) items
  // To keep memory optimal, we use DP table of size (n + 1) * (cap + 1) * (limitItems + 1)
  const W_SIZE = cap + 1;
  const K_SIZE = limitItems + 1;
  const WK_SIZE = W_SIZE * K_SIZE;

  // Flattened index: item_i * WK_SIZE + w * K_SIZE + k
  // dpMaxPriority stores the best priority for (i, w, k)
  // take stores 1 if item i was taken
  const dpMaxPriority = new Int32Array((n + 1) * WK_SIZE);
  const dpReachable = new Uint8Array((n + 1) * WK_SIZE);
  const take = new Uint8Array((n + 1) * WK_SIZE);

  const getIdx = (i, w, k) => i * WK_SIZE + w * K_SIZE + k;

  // Base case: i = 0, w = 0, k = 0 is reachable with 0 priority
  dpReachable[getIdx(0, 0, 0)] = 1;

  for (let i = 1; i <= n; i++) {
    const bin = bins[i - 1];
    const weight = Math.round(bin.wasteKg);
    const prioVal = getPriorityValue(bin.priority);

    for (let w = 0; w <= cap; w++) {
      for (let k = 0; k <= limitItems; k++) {
        const curIdx = getIdx(i, w, k);
        const prevIdx = getIdx(i - 1, w, k);

        // Option 1: Do not take item i
        if (dpReachable[prevIdx]) {
          dpReachable[curIdx] = 1;
          dpMaxPriority[curIdx] = dpMaxPriority[prevIdx];
        }

        // Option 2: Take item i (if w >= weight and k >= 1)
        if (w >= weight && k >= 1) {
          const takePrevIdx = getIdx(i - 1, w - weight, k - 1);
          if (dpReachable[takePrevIdx]) {
            const candPriority = dpMaxPriority[takePrevIdx] + prioVal;
            if (!dpReachable[curIdx] || candPriority > dpMaxPriority[curIdx]) {
              dpReachable[curIdx] = 1;
              dpMaxPriority[curIdx] = candPriority;
              take[curIdx] = 1;
            }
          }
        }
      }
    }
  }

  // Find optimal (w, k):
  // 1. Maximize k (number of bins collected, up to limitItems)
  // 2. Tie-break: Maximize priority
  // 3. Tie-break: Minimize weight used
  let bestK = 0;
  let bestPriority = -1;
  let bestW = 0;

  for (let k = limitItems; k >= 0; k--) {
    let foundForK = false;
    for (let w = 0; w <= cap; w++) {
      const idx = getIdx(n, w, k);
      if (dpReachable[idx]) {
        foundForK = true;
        const prio = dpMaxPriority[idx];
        if (prio > bestPriority) {
          bestPriority = prio;
          bestW = w;
          bestK = k;
        }
      }
    }
    if (foundForK && bestK > 0) {
      // Because we search k descending, the first k with a reachable solution is the maximal count!
      break;
    }
  }

  // Backtrack to recover selected items
  const selectedBins = [];
  const selectedIds = new Set();
  let currW = bestW;
  let currK = bestK;

  for (let i = n; i >= 1; i--) {
    const curIdx = getIdx(i, currW, currK);
    if (take[curIdx] === 1) {
      const selectedBin = bins[i - 1];
      selectedBins.unshift(selectedBin);
      selectedIds.add(selectedBin.id);
      currW -= Math.round(selectedBin.wasteKg);
      currK -= 1;
    }
  }

  const unselectedBins = bins.filter(b => !selectedIds.has(b.id));
  const totalWaste = selectedBins.reduce((sum, b) => sum + b.wasteKg, 0);
  const totalPriority = selectedBins.reduce((sum, b) => sum + getPriorityValue(b.priority), 0);
  const remainingCapacity = Math.max(0, cap - totalWaste);
  const capacityUtilization = cap > 0 ? parseFloat(((totalWaste / cap) * 100).toFixed(1)) : 0;

  return {
    selectedBins,
    unselectedBins,
    totalWaste: parseFloat(totalWaste.toFixed(2)),
    totalPriority,
    selectedCount: selectedBins.length,
    capacity: cap,
    remainingCapacity: parseFloat(remainingCapacity.toFixed(2)),
    capacityUtilization
  };
}
