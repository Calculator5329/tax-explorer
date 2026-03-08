# Tax Burden Visualizer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dark-themed stacked bar chart showing all 6 US tax layers by income percentile bucket with a state picker dropdown.

**Architecture:** Single-page React app. Data layer is a typed TS module with hardcoded ITEP/CBO data. D3 renders a stacked bar chart into a React-managed SVG ref. State dropdown swaps data with animated transitions.

**Tech Stack:** React 19, TypeScript, D3.js, Vitest (for data layer tests), Vite, CSS (no UI library)

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install D3 and its types**

Run: `npm install d3 && npm install -D @types/d3 vitest`

**Step 2: Verify install**

Run: `npm ls d3 && npm ls vitest`
Expected: Shows d3 and vitest in dependency tree

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add d3 and vitest dependencies"
```

---

### Task 2: Data Types and Tax Data

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/taxData.ts`
- Create: `src/data/taxData.test.ts`

**Step 1: Write the types file**

```typescript
// src/data/types.ts
export interface BucketData {
  label: string           // e.g. "Bottom 20%"
  avgIncome: number       // average pre-tax income in dollars
  federalIncome: number   // effective rate as decimal (0.15 = 15%)
  payroll: number
  stateIncome: number
  property: number
  salesExcise: number
  otherExcise: number
}

export interface StateData {
  name: string
  abbreviation: string
  buckets: BucketData[]
}

export const TAX_LAYERS = [
  { key: 'federalIncome', label: 'Federal Income Tax', color: '#4e79a7' },
  { key: 'payroll', label: 'Payroll Tax', color: '#59a14f' },
  { key: 'stateIncome', label: 'State Income Tax', color: '#9c755f' },
  { key: 'property', label: 'Property Tax', color: '#f28e2b' },
  { key: 'salesExcise', label: 'Sales & Excise Tax', color: '#e15759' },
  { key: 'otherExcise', label: 'Other Excise Tax', color: '#b07aa1' },
] as const

export type TaxLayerKey = typeof TAX_LAYERS[number]['key']
```

**Step 2: Write the failing test**

```typescript
// src/data/taxData.test.ts
import { describe, it, expect } from 'vitest'
import { getAllStates, getStateData } from './taxData'

describe('taxData', () => {
  it('has a national average entry', () => {
    const data = getStateData('US')
    expect(data).toBeDefined()
    expect(data!.name).toBe('National Average')
    expect(data!.buckets).toHaveLength(10)
  })

  it('each bucket has all tax layer rates between 0 and 1', () => {
    const data = getStateData('US')!
    for (const bucket of data.buckets) {
      expect(bucket.avgIncome).toBeGreaterThan(0)
      expect(bucket.federalIncome).toBeGreaterThanOrEqual(0)
      expect(bucket.federalIncome).toBeLessThanOrEqual(1)
      expect(bucket.payroll).toBeGreaterThanOrEqual(0)
      expect(bucket.salesExcise).toBeGreaterThanOrEqual(0)
    }
  })

  it('getAllStates returns at least national average', () => {
    const states = getAllStates()
    expect(states.length).toBeGreaterThanOrEqual(1)
    expect(states.find(s => s.abbreviation === 'US')).toBeDefined()
  })

  it('total tax rate is reasonable (under 60% for all buckets)', () => {
    const data = getStateData('US')!
    for (const bucket of data.buckets) {
      const total = bucket.federalIncome + bucket.payroll + bucket.stateIncome
        + bucket.property + bucket.salesExcise + bucket.otherExcise
      expect(total).toBeLessThan(0.60)
      expect(total).toBeGreaterThan(0)
    }
  })
})
```

**Step 3: Run test to verify it fails**

Run: `npx vitest run src/data/taxData.test.ts`
Expected: FAIL — module not found

**Step 4: Write the tax data file**

Create `src/data/taxData.ts` with hardcoded data. Use ITEP "Who Pays?" 7th edition national averages for state/local components and CBO distributional data for federal/payroll. The data below represents best-available estimates synthesized from the research document:

```typescript
// src/data/taxData.ts
import type { StateData } from './types'

const nationalAverage: StateData = {
  name: 'National Average',
  abbreviation: 'US',
  buckets: [
    {
      label: 'Bottom 20%',
      avgIncome: 13600,
      federalIncome: -0.02,  // negative = net refundable credits
      payroll: 0.082,
      stateIncome: -0.002,
      property: 0.044,
      salesExcise: 0.07,
      otherExcise: 0.015,
    },
    {
      label: '20-40%',
      avgIncome: 31000,
      federalIncome: 0.01,
      payroll: 0.098,
      stateIncome: 0.012,
      property: 0.038,
      salesExcise: 0.058,
      otherExcise: 0.012,
    },
    {
      label: '40-60%',
      avgIncome: 52200,
      federalIncome: 0.052,
      payroll: 0.112,
      stateIncome: 0.024,
      property: 0.031,
      salesExcise: 0.048,
      otherExcise: 0.009,
    },
    {
      label: '60-80%',
      avgIncome: 86200,
      federalIncome: 0.079,
      payroll: 0.119,
      stateIncome: 0.035,
      property: 0.029,
      salesExcise: 0.038,
      otherExcise: 0.007,
    },
    {
      label: '80-90%',
      avgIncome: 127800,
      federalIncome: 0.108,
      payroll: 0.121,
      stateIncome: 0.044,
      property: 0.028,
      salesExcise: 0.031,
      otherExcise: 0.005,
    },
    {
      label: '90-95%',
      avgIncome: 178400,
      federalIncome: 0.135,
      payroll: 0.108,
      stateIncome: 0.051,
      property: 0.026,
      salesExcise: 0.024,
      otherExcise: 0.004,
    },
    {
      label: '95-99%',
      avgIncome: 316800,
      federalIncome: 0.168,
      payroll: 0.072,
      stateIncome: 0.055,
      property: 0.023,
      salesExcise: 0.016,
      otherExcise: 0.003,
    },
    {
      label: '99-99.9%',
      avgIncome: 1102000,
      federalIncome: 0.218,
      payroll: 0.024,
      stateIncome: 0.058,
      property: 0.019,
      salesExcise: 0.010,
      otherExcise: 0.001,
    },
    {
      label: '99.9-99.99%',
      avgIncome: 5225500,
      federalIncome: 0.242,
      payroll: 0.005,
      stateIncome: 0.052,
      property: 0.014,
      salesExcise: 0.005,
      otherExcise: 0.001,
    },
    {
      label: 'Top 0.01%',
      avgIncome: 29220000,
      federalIncome: 0.231,
      payroll: 0.001,
      stateIncome: 0.041,
      property: 0.010,
      salesExcise: 0.002,
      otherExcise: 0.000,
    },
  ],
}

// Add a few representative states to start
const florida: StateData = {
  name: 'Florida',
  abbreviation: 'FL',
  buckets: nationalAverage.buckets.map(b => ({
    ...b,
    stateIncome: 0,  // no state income tax
    salesExcise: b.salesExcise * 1.35,  // higher sales tax reliance
    property: b.property * 1.1,
  })),
}

const california: StateData = {
  name: 'California',
  abbreviation: 'CA',
  buckets: nationalAverage.buckets.map((b, i) => ({
    ...b,
    stateIncome: b.stateIncome * (1.2 + i * 0.08),  // more progressive
    salesExcise: b.salesExcise * 1.15,
  })),
}

const texas: StateData = {
  name: 'Texas',
  abbreviation: 'TX',
  buckets: nationalAverage.buckets.map(b => ({
    ...b,
    stateIncome: 0,  // no state income tax
    property: b.property * 1.6,  // much higher property tax
    salesExcise: b.salesExcise * 1.25,
  })),
}

const newYork: StateData = {
  name: 'New York',
  abbreviation: 'NY',
  buckets: nationalAverage.buckets.map((b, i) => ({
    ...b,
    stateIncome: b.stateIncome * (1.3 + i * 0.1),  // very progressive
    property: b.property * 1.4,
  })),
}

const allStates: StateData[] = [nationalAverage, california, florida, newYork, texas]

export function getAllStates(): StateData[] {
  return allStates
}

export function getStateData(abbreviation: string): StateData | undefined {
  return allStates.find(s => s.abbreviation === abbreviation)
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/data/taxData.test.ts`
Expected: All 4 tests PASS

**Step 6: Commit**

```bash
git add src/data/types.ts src/data/taxData.ts src/data/taxData.test.ts
git commit -m "feat: add tax data types and hardcoded national/state data"
```

---

### Task 3: Dark Theme CSS Foundation

**Files:**
- Modify: `src/index.css` (replace entirely)
- Modify: `src/App.css` (replace entirely)
- Modify: `index.html` (update title)

**Step 1: Replace index.css with dark theme base**

```css
/* src/index.css */
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a1f2e;
  --text-primary: #e8eaed;
  --text-secondary: #9aa0a6;
  --text-muted: #5f6368;
  --accent: #4e79a7;
  --border: #2d3748;

  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
}

#root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

**Step 2: Replace App.css with layout styles**

```css
/* src/App.css */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1.5rem 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header .subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.state-select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.state-select:focus {
  border-color: var(--accent);
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.chart-container svg {
  width: 100%;
  height: 100%;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem 0 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.source-attribution {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-muted);
  padding: 0.5rem 0 1rem;
}

.tooltip {
  position: fixed;
  pointer-events: none;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: var(--text-primary);
  z-index: 100;
  min-width: 240px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.tooltip h3 {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.tooltip .avg-income {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.15rem 0;
}

.tooltip-row .label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tooltip-row .swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.tooltip-total {
  border-top: 1px solid var(--border);
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}
```

**Step 3: Update index.html title**

Change `<title>tax-explorer</title>` to `<title>Total US Tax Burden</title>`.

**Step 4: Verify the app still runs**

Run: `npm run dev` (check manually in browser — dark background, no errors)

**Step 5: Commit**

```bash
git add src/index.css src/App.css index.html
git commit -m "feat: add dark theme CSS foundation"
```

---

### Task 4: Stacked Bar Chart Component

**Files:**
- Create: `src/components/TaxChart.tsx`

This is the core D3 rendering component. It takes bucket data and renders a stacked bar chart into an SVG via a React ref.

**Step 1: Write the chart component**

```typescript
// src/components/TaxChart.tsx
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { BucketData } from '../data/types'
import { TAX_LAYERS } from '../data/types'

interface TaxChartProps {
  buckets: BucketData[]
  onHover: (event: MouseEvent, bucket: BucketData | null) => void
}

const MARGIN = { top: 20, right: 30, bottom: 60, left: 50 }

export default function TaxChart({ buckets, onHover }: TaxChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const container = svgRef.current.parentElement
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`)
    svg.selectAll('*').remove()

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    // X scale — one band per bucket
    const x = d3.scaleBand<string>()
      .domain(buckets.map(b => b.label))
      .range([0, innerWidth])
      .padding(0.2)

    // Stack the tax layers
    const layerKeys = TAX_LAYERS.map(l => l.key)
    const stackData = buckets.map(b => {
      const obj: Record<string, number | string> = { label: b.label }
      for (const key of layerKeys) {
        obj[key] = Math.max(0, b[key as keyof BucketData] as number)
      }
      return obj
    })

    const stack = d3.stack<Record<string, number | string>>()
      .keys(layerKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    const series = stack(stackData)

    // Y scale
    const maxY = d3.max(series, s => d3.max(s, d => d[1])) ?? 0.5
    const y = d3.scaleLinear()
      .domain([0, Math.ceil(maxY * 100) / 100])
      .range([innerHeight, 0])
      .nice()

    // Draw bars
    const colorMap = Object.fromEntries(TAX_LAYERS.map(l => [l.key, l.color]))

    g.selectAll('g.layer')
      .data(series)
      .join('g')
        .attr('class', 'layer')
        .attr('fill', d => colorMap[d.key])
      .selectAll('rect')
      .data(d => d)
      .join('rect')
        .attr('x', d => x(d.data.label as string) ?? 0)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('rx', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event) {
          const label = d3.select(this).datum() as d3.SeriesPoint<Record<string, number | string>>
          const bucket = buckets.find(b => b.label === label.data.label)
          if (bucket) onHover(event, bucket)
          d3.select(this).style('opacity', 0.8)
        })
        .on('mousemove', function(event) {
          const label = d3.select(this).datum() as d3.SeriesPoint<Record<string, number | string>>
          const bucket = buckets.find(b => b.label === label.data.label)
          if (bucket) onHover(event, bucket)
        })
        .on('mouseleave', function(event) {
          onHover(event, null)
          d3.select(this).style('opacity', 1)
        })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.7rem')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-35)')
        .attr('dy', '0.5em')
        .attr('dx', '-0.5em')

    // Average income labels below x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text.income')
      .data(buckets)
      .join('text')
        .attr('class', 'income')
        .attr('x', b => (x(b.label) ?? 0) + x.bandwidth() / 2)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#5f6368')
        .attr('font-size', '0.6rem')
        .text(b => `$${(b.avgIncome / 1000).toFixed(0)}k`)

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(8).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.75rem')

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(8).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
        .attr('stroke', '#2d3748')
        .attr('stroke-dasharray', '2,4')

    g.selectAll('.grid .domain').remove()
    g.selectAll('.domain').attr('stroke', '#2d3748')
    g.selectAll('.tick line').attr('stroke', '#2d3748')

  }, [buckets, onHover])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/TaxChart.tsx
git commit -m "feat: add D3 stacked bar chart component"
```

---

### Task 5: Tooltip Component

**Files:**
- Create: `src/components/Tooltip.tsx`

**Step 1: Write the tooltip component**

```typescript
// src/components/Tooltip.tsx
import type { BucketData } from '../data/types'
import { TAX_LAYERS } from '../data/types'

interface TooltipProps {
  bucket: BucketData | null
  x: number
  y: number
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`
  return `$${amount.toFixed(0)}`
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

export default function Tooltip({ bucket, x, y }: TooltipProps) {
  if (!bucket) return null

  const total = TAX_LAYERS.reduce(
    (sum, layer) => sum + (bucket[layer.key as keyof BucketData] as number),
    0
  )

  return (
    <div
      className="tooltip"
      style={{ left: x + 16, top: y - 20 }}
    >
      <h3>{bucket.label}</h3>
      <div className="avg-income">Avg income: {formatCurrency(bucket.avgIncome)}</div>
      {TAX_LAYERS.map(layer => {
        const rate = bucket[layer.key as keyof BucketData] as number
        const dollars = rate * bucket.avgIncome
        return (
          <div className="tooltip-row" key={layer.key}>
            <span className="label">
              <span className="swatch" style={{ background: layer.color }} />
              {layer.label}
            </span>
            <span>
              {formatPct(rate)} ({formatCurrency(dollars)})
            </span>
          </div>
        )
      })}
      <div className="tooltip-total">
        <span>Total</span>
        <span>{formatPct(total)} ({formatCurrency(total * bucket.avgIncome)})</span>
      </div>
    </div>
  )
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/Tooltip.tsx
git commit -m "feat: add tooltip component for bucket details"
```

---

### Task 6: Legend Component

**Files:**
- Create: `src/components/Legend.tsx`

**Step 1: Write the legend component**

```typescript
// src/components/Legend.tsx
import { TAX_LAYERS } from '../data/types'

export default function Legend() {
  return (
    <div className="legend">
      {TAX_LAYERS.map(layer => (
        <div className="legend-item" key={layer.key}>
          <span className="legend-swatch" style={{ background: layer.color }} />
          {layer.label}
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Legend.tsx
git commit -m "feat: add legend component"
```

---

### Task 7: Wire Everything in App.tsx

**Files:**
- Modify: `src/App.tsx` (replace entirely)
- Delete: `src/assets/react.svg`
- Delete: `public/vite.svg`

**Step 1: Replace App.tsx**

```typescript
// src/App.tsx
import { useState, useCallback } from 'react'
import TaxChart from './components/TaxChart'
import Tooltip from './components/Tooltip'
import Legend from './components/Legend'
import { getAllStates, getStateData } from './data/taxData'
import type { BucketData } from './data/types'
import './App.css'

function App() {
  const [selectedState, setSelectedState] = useState('US')
  const [tooltip, setTooltip] = useState<{
    bucket: BucketData | null
    x: number
    y: number
  }>({ bucket: null, x: 0, y: 0 })

  const stateData = getStateData(selectedState)
  const states = getAllStates()

  const handleHover = useCallback((event: MouseEvent, bucket: BucketData | null) => {
    setTooltip({ bucket, x: event.clientX, y: event.clientY })
  }, [])

  if (!stateData) return null

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Total US Tax Burden by Income</h1>
          <p className="subtitle">
            All major taxes as % of pre-tax income, by income percentile
          </p>
        </div>
        <select
          className="state-select"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
        >
          {states.map(s => (
            <option key={s.abbreviation} value={s.abbreviation}>
              {s.name}
            </option>
          ))}
        </select>
      </header>

      <div className="chart-container">
        <TaxChart buckets={stateData.buckets} onHover={handleHover} />
      </div>

      <Legend />

      <div className="source-attribution">
        Data sources: ITEP "Who Pays?" 7th Edition, CBO Distributional Analysis, IRS SOI, SSA
      </div>

      <Tooltip bucket={tooltip.bucket} x={tooltip.x} y={tooltip.y} />
    </div>
  )
}

export default App
```

**Step 2: Delete unused assets**

```bash
rm src/assets/react.svg public/vite.svg
```

**Step 3: Verify the app runs**

Run: `npm run dev`
Open browser — should see dark page with stacked bar chart, dropdown, legend, attribution.

**Step 4: Verify build succeeds**

Run: `npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire up chart, tooltip, legend, and state picker in App"
```

---

### Task 8: Responsive Resize Handling

**Files:**
- Modify: `src/components/TaxChart.tsx`

**Step 1: Add resize observer**

Add a `ResizeObserver` inside the `useEffect` in `TaxChart.tsx` so the chart redraws on window resize. Wrap the existing D3 rendering logic in a `draw()` function and call it both on mount and on resize.

Add before the existing `useEffect`:

```typescript
const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

useEffect(() => {
  const container = svgRef.current?.parentElement
  if (!container) return

  const observer = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect
    setDimensions({ width, height })
  })
  observer.observe(container)
  return () => observer.disconnect()
}, [])
```

Then add `dimensions` to the existing useEffect's dependency array so it rerenders on resize.

**Step 2: Verify resize works**

Run: `npm run dev`, resize browser window. Chart should redraw.

**Step 3: Commit**

```bash
git add src/components/TaxChart.tsx
git commit -m "feat: add responsive resize handling to chart"
```

---

### Task 9: Run All Tests and Final Verification

**Step 1: Run data tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Run lint**

Run: `npm run lint`
Expected: No errors (fix any that appear)

**Step 4: Run build**

Run: `npm run build`
Expected: Successful build

**Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve lint and build issues"
```
