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
