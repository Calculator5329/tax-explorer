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
