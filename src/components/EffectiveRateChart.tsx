import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getStateData } from '../data/taxData'
import type { BucketData } from '../data/types'
import { TAX_LAYERS } from '../data/types'

interface EffectiveRateChartProps {
  selectedStates: string[]
}

const MARGIN = { top: 20, right: 100, bottom: 60, left: 50 }

const STATE_COLORS = [
  '#4e79a7', '#e15759', '#59a14f', '#f28e2b', '#b07aa1', '#76b7b2'
]

function getTotalRate(bucket: BucketData): number {
  return TAX_LAYERS.reduce(
    (sum, layer) => sum + (bucket[layer.key as keyof BucketData] as number),
    0
  )
}

export default function EffectiveRateChart({ selectedStates }: EffectiveRateChartProps) {
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

    // Get data for all selected states
    const statesData = selectedStates
      .map(abbr => getStateData(abbr))
      .filter((d): d is NonNullable<typeof d> => d != null)

    if (statesData.length === 0) return

    const bucketLabels = statesData[0].buckets.map(b => b.label)

    // X scale — point scale for bucket labels
    const x = d3.scalePoint<string>()
      .domain(bucketLabels)
      .range([0, innerWidth])
      .padding(0.5)

    // Y scale
    const allRates = statesData.flatMap(s => s.buckets.map(getTotalRate))
    const maxRate = Math.max(d3.max(allRates) ?? 0.4, 0.1)
    const y = d3.scaleLinear()
      .domain([0, Math.ceil(maxRate * 100) / 100])
      .range([innerHeight, 0])
      .nice()

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
        .attr('stroke', '#2d3748')
        .attr('stroke-dasharray', '2,4')
    g.selectAll('.grid .domain').remove()

    // Line generator
    const line = d3.line<BucketData>()
      .x(d => x(d.label) ?? 0)
      .y(d => y(getTotalRate(d)))
      .curve(d3.curveMonotoneX)

    // Draw lines for each state
    statesData.forEach((state, i) => {
      const color = STATE_COLORS[i % STATE_COLORS.length]

      g.append('path')
        .datum(state.buckets)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', line)

      // Dots
      g.selectAll(`circle.state-${i}`)
        .data(state.buckets)
        .join('circle')
          .attr('class', `state-${i}`)
          .attr('cx', d => x(d.label) ?? 0)
          .attr('cy', d => y(getTotalRate(d)))
          .attr('r', 3.5)
          .attr('fill', color)
          .attr('stroke', '#0f1419')
          .attr('stroke-width', 1.5)

      // State label at end of line
      const lastBucket = state.buckets[state.buckets.length - 1]
      g.append('text')
        .attr('x', innerWidth + 8)
        .attr('y', y(getTotalRate(lastBucket)))
        .attr('fill', color)
        .attr('font-size', '0.75rem')
        .attr('font-weight', '600')
        .attr('dominant-baseline', 'middle')
        .text(state.abbreviation)
    })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.65rem')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-35)')
        .attr('dy', '0.5em')
        .attr('dx', '-0.5em')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.75rem')

    g.selectAll('.domain').attr('stroke', '#2d3748')
    g.selectAll('.tick line').attr('stroke', '#2d3748')

  }, [selectedStates, dimensions])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
