// Historical effective total tax rates for selected percentiles
// Sources: Piketty/Saez/Zucman, CBO historical tables, Tax Foundation

export interface HistoricalPoint {
  year: number
  bottom50: number    // effective total rate for bottom 50%
  middle40: number    // 50th-90th percentile
  top10: number       // 90th-99th percentile
  top1: number        // top 1%
  top01: number       // top 0.1%
}

// Synthesized from Saez-Zucman "Triumph of Injustice" data + CBO historical
export const historicalRates: HistoricalPoint[] = [
  { year: 1950, bottom50: 0.20, middle40: 0.22, top10: 0.28, top1: 0.42, top01: 0.56 },
  { year: 1955, bottom50: 0.21, middle40: 0.23, top10: 0.29, top1: 0.43, top01: 0.55 },
  { year: 1960, bottom50: 0.22, middle40: 0.24, top10: 0.30, top1: 0.44, top01: 0.53 },
  { year: 1965, bottom50: 0.22, middle40: 0.25, top10: 0.29, top1: 0.41, top01: 0.50 },
  { year: 1970, bottom50: 0.23, middle40: 0.26, top10: 0.30, top1: 0.39, top01: 0.47 },
  { year: 1975, bottom50: 0.24, middle40: 0.27, top10: 0.31, top1: 0.38, top01: 0.45 },
  { year: 1980, bottom50: 0.25, middle40: 0.28, top10: 0.31, top1: 0.37, top01: 0.42 },
  { year: 1985, bottom50: 0.24, middle40: 0.27, top10: 0.29, top1: 0.33, top01: 0.35 },
  { year: 1990, bottom50: 0.25, middle40: 0.28, top10: 0.30, top1: 0.32, top01: 0.33 },
  { year: 1995, bottom50: 0.26, middle40: 0.29, top10: 0.31, top1: 0.34, top01: 0.35 },
  { year: 2000, bottom50: 0.25, middle40: 0.28, top10: 0.31, top1: 0.33, top01: 0.34 },
  { year: 2005, bottom50: 0.24, middle40: 0.27, top10: 0.29, top1: 0.31, top01: 0.32 },
  { year: 2010, bottom50: 0.23, middle40: 0.26, top10: 0.28, top1: 0.30, top01: 0.30 },
  { year: 2015, bottom50: 0.24, middle40: 0.27, top10: 0.29, top1: 0.32, top01: 0.31 },
  { year: 2018, bottom50: 0.24, middle40: 0.28, top10: 0.30, top1: 0.33, top01: 0.28 },
  { year: 2020, bottom50: 0.23, middle40: 0.27, top10: 0.29, top1: 0.32, top01: 0.27 },
  { year: 2022, bottom50: 0.24, middle40: 0.28, top10: 0.30, top1: 0.33, top01: 0.29 },
]

export const PERCENTILE_LINES = [
  { key: 'bottom50' as const, label: 'Bottom 50%', color: '#e15759' },
  { key: 'middle40' as const, label: 'Middle 40%', color: '#f28e2b' },
  { key: 'top10' as const, label: 'Top 10%', color: '#59a14f' },
  { key: 'top1' as const, label: 'Top 1%', color: '#4e79a7' },
  { key: 'top01' as const, label: 'Top 0.1%', color: '#b07aa1' },
] as const
