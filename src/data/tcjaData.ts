import type { BucketData } from './types'

// Post-2026 TCJA expiration adjustments
// When TCJA expires: top rate goes 37%→39.6%, brackets compress,
// standard deduction halves, personal exemptions return but net effect
// is higher rates for most. CBO/TPC estimates.
//
// These are ADDITIVE adjustments to the current (2025 law) rates.
// federalIncome and capitalGains adjustments only — payroll/state/local unchanged.

export const tcjaAdjustments: Pick<BucketData, 'federalIncome' | 'capitalGains'>[] = [
  // Bottom 20%: loss of expanded standard deduction + CTC reduction
  { federalIncome: 0.015, capitalGains: 0.000 },
  // 20-40%: standard deduction halves, bracket compression
  { federalIncome: 0.020, capitalGains: 0.000 },
  // 40-60%: ~2.5pp increase
  { federalIncome: 0.025, capitalGains: 0.001 },
  // 60-80%: bracket changes + lost deduction benefit
  { federalIncome: 0.028, capitalGains: 0.001 },
  // 80-90%: bracket rate increases
  { federalIncome: 0.030, capitalGains: 0.002 },
  // 90-95%: moving into higher brackets
  { federalIncome: 0.032, capitalGains: 0.003 },
  // 95-99%: significant bracket impact
  { federalIncome: 0.035, capitalGains: 0.004 },
  // 99-99.9%: top rate 37→39.6% + bracket compression
  { federalIncome: 0.038, capitalGains: 0.005 },
  // 99.9-99.99%: top rate increase on ordinary income
  { federalIncome: 0.035, capitalGains: 0.005 },
  // Top 0.01%: modest increase — most income is cap gains (unchanged)
  { federalIncome: 0.025, capitalGains: 0.003 },
]

export function applyTcjaExpiration(buckets: BucketData[]): BucketData[] {
  return buckets.map((bucket, i) => {
    const adj = tcjaAdjustments[i]
    if (!adj) return bucket
    return {
      ...bucket,
      federalIncome: bucket.federalIncome + adj.federalIncome,
      capitalGains: bucket.capitalGains + adj.capitalGains,
    }
  })
}
