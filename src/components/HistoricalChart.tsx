// src/components/HistoricalChart.tsx
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { historicalRates, PERCENTILE_LINES } from '../data/historicalData'
import type { HistoricalPoint } from '../data/historicalData'

const MARGIN = { top: 20, right: 90, bottom: 35, left: 50 }

export default function HistoricalChart() {
  const svgRef = useRef<SVGSVGElement>(null)
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

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = dimensions.width
    const height = dimensions.height
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    // X scale — years
    const x = d3.scaleLinear()
      .domain([1950, 2022])
      .range([0, innerWidth])

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, 0.60])
      .range([innerHeight, 0])

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
        .attr('stroke', '#2d3748')
        .attr('stroke-dasharray', '2,4')
    g.selectAll('.grid .domain').remove()

    // Draw lines for each percentile group
    for (const pLine of PERCENTILE_LINES) {
      const line = d3.line<HistoricalPoint>()
        .x(d => x(d.year))
        .y(d => y(d[pLine.key]))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(historicalRates)
        .attr('fill', 'none')
        .attr('stroke', pLine.color)
        .attr('stroke-width', 2)
        .attr('d', line)

      // Label at end of line
      const lastPoint = historicalRates[historicalRates.length - 1]
      g.append('text')
        .attr('x', innerWidth + 6)
        .attr('y', y(lastPoint[pLine.key]))
        .attr('fill', pLine.color)
        .attr('font-size', '0.65rem')
        .attr('font-weight', '600')
        .attr('dominant-baseline', 'middle')
        .text(pLine.label)
    }

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(8).tickFormat(d => String(d)))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.7rem')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.7rem')

    g.selectAll('.domain').attr('stroke', '#2d3748')
    g.selectAll('.tick line').attr('stroke', '#2d3748')

  }, [dimensions])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
