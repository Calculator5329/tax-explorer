import { useState, useCallback, useMemo } from 'react'
import TaxChart from './components/TaxChart'
import Tooltip from './components/Tooltip'
import Legend from './components/Legend'
import EffectiveRateChart from './components/EffectiveRateChart'
import WaterfallChart from './components/WaterfallChart'
import HistoricalChart from './components/HistoricalChart'
import IncomeCompositionChart from './components/IncomeCompositionChart'
import { getAllStates, getStateData } from './data/taxData'

import { INCOME_SOURCES } from './data/incomeComposition'
import { TAX_LAYERS } from './data/types'
import type { BucketData } from './data/types'
import './App.css'

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

function getTotalRate(bucket: BucketData): number {
  return TAX_LAYERS.reduce(
    (sum, layer) => sum + (bucket[layer.key as keyof BucketData] as number),
    0
  )
}

function App() {
  const [selectedState, setSelectedState] = useState('US')
  const [compareStates, setCompareStates] = useState<string[]>(['US', 'CA', 'TX'])
  const [income, setIncome] = useState(85000)
  const [tooltip, setTooltip] = useState<{
    bucket: BucketData | null
    x: number
    y: number
  }>({ bucket: null, x: 0, y: 0 })

  const stateData = getStateData(selectedState)
  const states = getAllStates()

  const activeBuckets = stateData?.buckets ?? []

  // Stats computations
  const stats = useMemo(() => {
    if (activeBuckets.length === 0) return null

    const medianBucket = activeBuckets[2] // 40-60%
    const topBucket = activeBuckets[activeBuckets.length - 1]
    const bottomBucket = activeBuckets[0]

    const medianRate = getTotalRate(medianBucket)
    const topRate = getTotalRate(topBucket)

    // Most regressive: biggest ratio of bottom rate to top rate
    const layerRegressivity = TAX_LAYERS.map(layer => {
      const bottomVal = bottomBucket[layer.key as keyof BucketData] as number
      const topVal = topBucket[layer.key as keyof BucketData] as number
      return { label: layer.label, ratio: topVal > 0 ? bottomVal / topVal : 0 }
    }).filter(l => l.ratio > 1)
    layerRegressivity.sort((a, b) => b.ratio - a.ratio)
    const mostRegressive = layerRegressivity[0]?.label.replace(' Tax', '') ?? 'N/A'

    // Cap gains as share of total federal tax at top
    const topCapGains = topBucket.capitalGains
    const topFedTotal = topBucket.federalIncome + topBucket.capitalGains
    const capGainsShare = topFedTotal > 0 ? topCapGains / topFedTotal : 0

    return { medianRate, topRate, mostRegressive, capGainsShare }
  }, [activeBuckets])

  const handleHover = useCallback((event: MouseEvent, bucket: BucketData | null) => {
    setTooltip({ bucket, x: event.clientX, y: event.clientY })
  }, [])

  const handleChartClick = useCallback((bucket: BucketData) => {
    setIncome(bucket.avgIncome)
  }, [])

  const toggleCompareState = (abbr: string) => {
    setCompareStates(prev =>
      prev.includes(abbr)
        ? prev.filter(s => s !== abbr)
        : prev.length < 5 ? [...prev, abbr] : prev
    )
  }

  if (!stateData || !stats) return null

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Total US Tax Burden by Income</h1>
          <p className="subtitle">
            All major taxes as % of pre-tax income, by income percentile
          </p>
        </div>
        <div className="header-controls">
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
        </div>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{formatPct(stats.medianRate)}</div>
          <div className="stat-label">Median Total Rate (40–60%)</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${stats.topRate < stats.medianRate ? 'highlight-red' : ''}`}>
            {formatPct(stats.topRate)}
          </div>
          <div className="stat-label">Top 0.01% Total Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value highlight-accent">{stats.mostRegressive}</div>
          <div className="stat-label">Most Regressive Tax</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatPct(stats.capGainsShare)}</div>
          <div className="stat-label">Cap Gains Share of Fed Tax (Top)</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel main-chart">
          <div className="panel-title">
            Effective Tax Rate by Income Group

          </div>
          <div className="chart-container">
            <TaxChart buckets={activeBuckets} onHover={handleHover} onClick={handleChartClick} />
          </div>
          <Legend />
          <div className="click-hint">Click a bar to update Your Tax Breakdown</div>
        </div>

        <div className="panel half-chart">
          <div className="panel-title">
            State Comparison — Total Effective Rate
            <div className="state-toggles">
              {states.map(s => (
                <button
                  key={s.abbreviation}
                  className={`state-toggle ${compareStates.includes(s.abbreviation) ? 'active' : ''}`}
                  onClick={() => toggleCompareState(s.abbreviation)}
                >
                  {s.abbreviation}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <EffectiveRateChart selectedStates={compareStates} />
          </div>
        </div>

        <div className="panel half-chart">
          <div className="panel-title">
            Your Tax Breakdown
            <div className="income-input-wrapper">
              <span className="income-prefix">$</span>
              <input
                type="number"
                className="income-input"
                value={income}
                onChange={e => setIncome(Math.max(0, Number(e.target.value)))}
                min={0}
                step={5000}
              />
            </div>
          </div>
          <div className="chart-container">
            <WaterfallChart income={income} buckets={activeBuckets} />
          </div>
        </div>

        <div className="panel full-width income-comp-chart">
          <div className="panel-title">Income Composition by Source</div>
          <div className="chart-container">
            <IncomeCompositionChart />
          </div>
          <div className="legend">
            {INCOME_SOURCES.map(s => (
              <div className="legend-item" key={s.key}>
                <span className="legend-swatch" style={{ background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className="panel full-width historical-chart">
          <div className="panel-title">Historical Effective Tax Rates (1950–2022)</div>
          <div className="chart-container">
            <HistoricalChart />
          </div>
        </div>
      </div>

      <div className="source-attribution">
        Data: ITEP "Who Pays?" 7th Edition &middot; CBO Distributional Analysis &middot; IRS SOI &middot; SSA &middot; Saez-Zucman &middot; Tax Policy Center
      </div>

      <Tooltip bucket={tooltip.bucket} x={tooltip.x} y={tooltip.y} />
    </div>
  )
}

export default App
