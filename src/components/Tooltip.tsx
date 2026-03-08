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
