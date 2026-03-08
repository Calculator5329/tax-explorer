// src/components/WaterfallChart.tsx
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { BucketData } from '../data/types'
import { TAX_LAYERS } from '../data/types'

interface WaterfallChartProps {
  income: number
  buckets: BucketData[]
}

const MARGIN = { top: 20, right: 20, bottom: 30, left: 70 }

function findBucket(income: number, buckets: BucketData[]): BucketData {
  // Find the bucket closest to the user's income
  let closest = buckets[0]
  let minDiff = Math.abs(income - closest.avgIncome)
  for (const b of buckets) {
    const diff = Math.abs(income - b.avgIncome)
    if (diff < minDiff) {
      minDiff = diff
      closest = b
    }
  }
  return closest
}

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}k`
  return `$${amount.toFixed(0)}`
}

export default function WaterfallChart({ income, buckets }: WaterfallChartProps) {
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
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || income <= 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = dimensions.width
    const height = dimensions.height
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const bucket = findBucket(income, buckets)

    // Build waterfall segments
    type Segment = { label: string; amount: number; start: number; end: number; color: string }
    const segments: Segment[] = []
    let running = income

    for (const layer of TAX_LAYERS) {
      const rate = bucket[layer.key as keyof BucketData] as number
      const amount = Math.round(rate * income)
      if (amount <= 0) continue
      segments.push({
        label: layer.label.replace(' Tax', ''),
        amount,
        start: running,
        end: running - amount,
        color: layer.color,
      })
      running -= amount
    }

    // Add take-home at the end
    segments.push({
      label: 'Take Home',
      amount: running,
      start: 0,
      end: running,
      color: '#2ecc71',
    })

    // X scale — one bar per segment
    const x = d3.scaleBand<string>()
      .domain(segments.map(s => s.label))
      .range([0, innerWidth])
      .padding(0.25)

    // Y scale
    const y = d3.scaleLinear()
      .domain([0, income])
      .range([innerHeight, 0])

    // Draw connector lines between bars
    for (let i = 0; i < segments.length - 2; i++) {
      const seg = segments[i]
      g.append('line')
        .attr('x1', (x(seg.label) ?? 0) + x.bandwidth())
        .attr('x2', x(segments[i + 1].label) ?? 0)
        .attr('y1', y(seg.end))
        .attr('y2', y(seg.end))
        .attr('stroke', '#5f6368')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-width', 1)
    }

    // Draw bars
    segments.forEach((seg, i) => {
      const isLast = i === segments.length - 1
      const barY = isLast ? y(seg.end) : y(seg.start)
      const barHeight = isLast ? innerHeight - y(seg.end) : y(seg.end) - y(seg.start)

      g.append('rect')
        .attr('x', x(seg.label) ?? 0)
        .attr('y', barY)
        .attr('width', x.bandwidth())
        .attr('height', Math.max(0, barHeight))
        .attr('fill', seg.color)
        .attr('rx', 3)
        .attr('opacity', isLast ? 1 : 0.85)

      // Amount label on bar
      g.append('text')
        .attr('x', (x(seg.label) ?? 0) + x.bandwidth() / 2)
        .attr('y', barY - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', seg.color)
        .attr('font-size', '0.7rem')
        .attr('font-weight', '600')
        .text(formatCurrency(seg.amount))
    })

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.65rem')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-25)')
        .attr('dy', '0.5em')
        .attr('dx', '-0.3em')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.7rem')

    g.selectAll('.domain').attr('stroke', '#2d3748')
    g.selectAll('.tick line').attr('stroke', '#2d3748')

  }, [income, buckets, dimensions])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
