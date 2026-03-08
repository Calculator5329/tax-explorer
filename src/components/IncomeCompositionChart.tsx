import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { incomeComposition, INCOME_SOURCES } from '../data/incomeComposition'
import type { IncomeComposition } from '../data/incomeComposition'

const MARGIN = { top: 20, right: 20, bottom: 60, left: 50 }

export default function IncomeCompositionChart() {
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

    // X scale
    const x = d3.scaleBand<string>()
      .domain(incomeComposition.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.2)

    // Stack
    const sourceKeys = INCOME_SOURCES.map(s => s.key)
    const stackData = incomeComposition.map(d => {
      const obj: Record<string, number | string> = { label: d.label }
      for (const key of sourceKeys) {
        obj[key] = d[key as keyof IncomeComposition] as number
      }
      return obj
    })

    const stack = d3.stack<Record<string, number | string>>()
      .keys(sourceKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    const series = stack(stackData)

    // Y scale — always 0 to 1 (100%)
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0])

    // Color map
    const colorMap = Object.fromEntries(INCOME_SOURCES.map(s => [s.key, s.color]))

    // Draw bars
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
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(+d * 100).toFixed(0)}%`))
      .selectAll('text')
        .attr('fill', '#9aa0a6')
        .attr('font-size', '0.75rem')

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
        .attr('stroke', '#2d3748')
        .attr('stroke-dasharray', '2,4')

    g.selectAll('.grid .domain').remove()
    g.selectAll('.domain').attr('stroke', '#2d3748')
    g.selectAll('.tick line').attr('stroke', '#2d3748')

  }, [dimensions])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
