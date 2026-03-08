// src/App.tsx
import { useState, useCallback } from 'react'
import TaxChart from './components/TaxChart'
import Tooltip from './components/Tooltip'
import Legend from './components/Legend'
import EffectiveRateChart from './components/EffectiveRateChart'
import WaterfallChart from './components/WaterfallChart'
import HistoricalChart from './components/HistoricalChart'
import IncomeCompositionChart from './components/IncomeCompositionChart'
import { getAllStates, getStateData } from './data/taxData'
import { INCOME_SOURCES } from './data/incomeComposition'
import type { BucketData } from './data/types'
import './App.css'

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

  const handleHover = useCallback((event: MouseEvent, bucket: BucketData | null) => {
    setTooltip({ bucket, x: event.clientX, y: event.clientY })
  }, [])

  const toggleCompareState = (abbr: string) => {
    setCompareStates(prev =>
      prev.includes(abbr)
        ? prev.filter(s => s !== abbr)
        : prev.length < 5 ? [...prev, abbr] : prev
    )
  }

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

      <div className="dashboard-grid">
        <div className="panel main-chart">
          <div className="panel-title">Effective Tax Rate by Income Group</div>
          <div className="chart-container">
            <TaxChart buckets={stateData.buckets} onHover={handleHover} />
          </div>
          <Legend />
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
            <WaterfallChart income={income} buckets={stateData.buckets} />
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
        Data sources: ITEP "Who Pays?" 7th Edition, CBO Distributional Analysis, IRS SOI, SSA, Saez-Zucman
      </div>

      <Tooltip bucket={tooltip.bucket} x={tooltip.x} y={tooltip.y} />
    </div>
  )
}

export default App
