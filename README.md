# WasteWise — Smart Municipal Waste Collection Optimizer
> **A Comprehensive Academic Design and Analysis of Algorithms (DAA) Major Project**  
> Developed for second-year Computer Science students demonstrating practical algorithm integration for municipal logistics.

---

## 1. Project Overview

**WasteWise** is a web-based municipal waste collection planning and route optimization system. It models a municipal ward's road network, waste receptacles, and garbage truck fleet to solve key logistics challenges:

1. **Shortest Path Road Distances:** Accurately calculating street distances between the Central Depot and waste receptacles along a weighted road graph using **Dijkstra's Algorithm**.
2. **Service Zone Partitioning:** Assigning bins to garbage trucks according to non-overlapping road distance zones from the depot:
   - **Zone 1 (0 – 3.0 km):** Truck 1 (Inner Ward)
   - **Zone 2 (> 3.0 – 6.0 km):** Truck 2 (Mid Sector)
   - **Zone 3 (> 6.0 – 12.0 km):** Truck 3 (Outer Perimeter)
3. **Capacity-Constrained Bin Selection:** Selecting waste bins for each truck without exceeding carrying limits using **0/1 Knapsack Dynamic Programming** under a **lexicographic objective** (maximizing bins collected first, tie-breaking on total priority value).
4. **Optimal Tour Sequencing:** Determining the most efficient visiting order for collected bins starting and ending at the Central Depot using **Held-Karp Dynamic Programming (Bitmask TSP)**.
5. **Interactive GIS Visualization:** Visualizing the road network junctions, color-coded bins (pending, collected, selected), and actual truck street routes using **Leaflet and OpenStreetMap**.
6. **Unified Collection Execution:** A streamlined, reliable workflow where clicking **Execute Collection** verifies constraints, recalculates optimal routes using live data, and executes collection in one unified step.
7. **Multi-Day Collection Lifecycle:** Simulating consecutive operational collection cycles (Day 1 $\to$ Day 2 $\to \dots$), carrying forward pending bins with **priority escalation**, regenerating waste for collected bins, and resetting trucks back to depot.
8. **Infrastructure Connectivity Analysis:** Comparing **Prim's Algorithm** and **Kruskal's Algorithm (with Disjoint Set Union)** to evaluate minimal network connectivity costs.
9. **Empirical Benchmarking Suite:** Isolating and measuring pure algorithmic execution times in milliseconds across variable input sizes.

---

## 2. Exact Bin Priority Formulation & DAA Specification

### Priority Formula and Variables
- **File Location:** `src/algorithms/knapsack.js` and `src/services/binService.js`
- **Initial Categorical Priority:** Assigned during bin creation or demo initialization:
  $$\text{PriorityLevel} \in \{\text{'Low'}, \text{'Medium'}, \text{'High'}\}$$
- **Numeric Priority Function $\text{PriorityValue}(b)$:**
  $$\text{PriorityValue}(b) = \begin{cases} 1 & \text{if } \text{priority} = \text{'Low'} \\ 2 & \text{if } \text{priority} = \text{'Medium'} \\ 3 & \text{if } \text{priority} = \text{'High'} \end{cases}$$
- **Multi-Day Escalation Policy $\text{calculateEscalatedPriority}(P, \text{duration})$:**
  To prevent bin starvation across consecutive collection cycles:
  $$\text{NewPriority} = \begin{cases} \text{'High'} & \text{if } \text{pendingDuration} \ge 3 \\ \text{Elevate 1 tier} & \text{if } \text{pendingDuration} = 2 \quad (\text{'Low'} \to \text{'Medium'}, \text{'Medium'} \to \text{'High'}) \\ \text{Unchanged} & \text{if } \text{pendingDuration} < 2 \end{cases}$$
- **Influence on 0/1 Knapsack Selection:**
  Waste quantity $w_i$ acts as the weight constraint $\sum_{i \in S} w_i \le W$.
  The optimization prioritizes maximizing the count of bins collected. If two subsets $S_1, S_2$ yield the same bin count $|S_1| = |S_2|$, the knapsack decision selects the subset maximizing total priority:
  $$\sum_{i \in S} \text{PriorityValue}(i)$$

---

## 3. Technology Stack

- **Frontend:** React 18
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS (Dark Theme)
- **Mapping:** Leaflet & React Leaflet with OpenStreetMap tiles
- **Charts & Data Visualization:** Recharts
- **Icons:** Lucide React
- **Persistence:** LocalStorage with JSON state hydration & cache management
- **Testing:** Node.js automated test runner (`test_algorithms.js`)

---

## 4. Getting Started

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Running Verification Suite
```bash
node test_algorithms.js
```

### Production Build
```bash
npm run build
npm run preview
```
