// Income composition by source for each percentile bucket
// Sources: IRS SOI Table 1.4, CBO distributional data, Saez-Zucman

export interface IncomeComposition {
  label: string
  wages: number         // share of income from wages/salaries (0-1)
  capitalGains: number  // long-term capital gains
  dividends: number     // qualified dividends
  business: number      // business/partnership/S-corp income
  interest: number      // interest + other income
}

export const incomeComposition: IncomeComposition[] = [
  { label: 'Bottom 20%',    wages: 0.72, capitalGains: 0.01, dividends: 0.01, business: 0.05, interest: 0.21 },
  { label: '20-40%',        wages: 0.82, capitalGains: 0.01, dividends: 0.01, business: 0.06, interest: 0.10 },
  { label: '40-60%',        wages: 0.85, capitalGains: 0.02, dividends: 0.01, business: 0.07, interest: 0.05 },
  { label: '60-80%',        wages: 0.83, capitalGains: 0.03, dividends: 0.02, business: 0.08, interest: 0.04 },
  { label: '80-90%',        wages: 0.80, capitalGains: 0.04, dividends: 0.02, business: 0.10, interest: 0.04 },
  { label: '90-95%',        wages: 0.74, capitalGains: 0.07, dividends: 0.03, business: 0.12, interest: 0.04 },
  { label: '95-99%',        wages: 0.62, capitalGains: 0.12, dividends: 0.05, business: 0.17, interest: 0.04 },
  { label: '99-99.9%',      wages: 0.40, capitalGains: 0.22, dividends: 0.08, business: 0.26, interest: 0.04 },
  { label: '99.9-99.99%',   wages: 0.20, capitalGains: 0.35, dividends: 0.10, business: 0.30, interest: 0.05 },
  { label: 'Top 0.01%',     wages: 0.10, capitalGains: 0.50, dividends: 0.12, business: 0.22, interest: 0.06 },
]

export const INCOME_SOURCES = [
  { key: 'wages' as const, label: 'Wages & Salaries', color: '#4e79a7' },
  { key: 'capitalGains' as const, label: 'Capital Gains', color: '#e15759' },
  { key: 'business' as const, label: 'Business Income', color: '#59a14f' },
  { key: 'dividends' as const, label: 'Dividends', color: '#f28e2b' },
  { key: 'interest' as const, label: 'Interest & Other', color: '#9c755f' },
] as const
