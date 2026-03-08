export interface BucketData {
  label: string           // e.g. "Bottom 20%"
  avgIncome: number       // average pre-tax income in dollars
  federalIncome: number   // effective rate as decimal (0.15 = 15%)
  payroll: number
  stateIncome: number
  property: number
  salesExcise: number
  otherExcise: number
}

export interface StateData {
  name: string
  abbreviation: string
  buckets: BucketData[]
}

export const TAX_LAYERS = [
  { key: 'federalIncome', label: 'Federal Income Tax', color: '#4e79a7' },
  { key: 'payroll', label: 'Payroll Tax', color: '#59a14f' },
  { key: 'stateIncome', label: 'State Income Tax', color: '#9c755f' },
  { key: 'property', label: 'Property Tax', color: '#f28e2b' },
  { key: 'salesExcise', label: 'Sales & Excise Tax', color: '#e15759' },
  { key: 'otherExcise', label: 'Other Excise Tax', color: '#b07aa1' },
] as const

export type TaxLayerKey = typeof TAX_LAYERS[number]['key']
