import type { StateData } from './types'

// Capital gains shares by bucket (from incomeComposition.ts)
// Cap gains effective rate: 15% for middle brackets, 20% + 3.8% NIIT = 23.8% for top
// The capitalGains field = capGainsShare * income * capGainsRate / income = share * rate
// federalIncome is the remainder on ordinary income

const nationalAverage: StateData = {
  name: 'National Average',
  abbreviation: 'US',
  buckets: [
    {
      label: 'Bottom 20%',
      avgIncome: 13600,
      federalIncome: -0.02,
      capitalGains: 0.000,   // ~1% cap gains share, 0% rate bracket
      payroll: 0.082,
      stateIncome: -0.002,
      property: 0.044,
      salesExcise: 0.07,
      otherExcise: 0.015,
    },
    {
      label: '20-40%',
      avgIncome: 31000,
      federalIncome: 0.009,
      capitalGains: 0.001,   // ~1% share, 0% rate
      payroll: 0.098,
      stateIncome: 0.012,
      property: 0.038,
      salesExcise: 0.058,
      otherExcise: 0.012,
    },
    {
      label: '40-60%',
      avgIncome: 52200,
      federalIncome: 0.049,
      capitalGains: 0.003,   // ~2% share, 15% rate
      payroll: 0.112,
      stateIncome: 0.024,
      property: 0.031,
      salesExcise: 0.048,
      otherExcise: 0.009,
    },
    {
      label: '60-80%',
      avgIncome: 86200,
      federalIncome: 0.074,
      capitalGains: 0.005,   // ~3% share, 15% rate
      payroll: 0.119,
      stateIncome: 0.035,
      property: 0.029,
      salesExcise: 0.038,
      otherExcise: 0.007,
    },
    {
      label: '80-90%',
      avgIncome: 127800,
      federalIncome: 0.102,
      capitalGains: 0.006,   // ~4% share, 15% rate
      payroll: 0.121,
      stateIncome: 0.044,
      property: 0.028,
      salesExcise: 0.031,
      otherExcise: 0.005,
    },
    {
      label: '90-95%',
      avgIncome: 178400,
      federalIncome: 0.124,
      capitalGains: 0.011,   // ~7% share, 15% rate
      payroll: 0.108,
      stateIncome: 0.051,
      property: 0.026,
      salesExcise: 0.024,
      otherExcise: 0.004,
    },
    {
      // ~12% capital gains share at 20% rate
      label: '95-99%',
      avgIncome: 316800,
      federalIncome: 0.131,
      capitalGains: 0.024,
      payroll: 0.072,
      stateIncome: 0.055,
      property: 0.023,
      salesExcise: 0.016,
      otherExcise: 0.003,
    },
    {
      // ~22% capital gains share at 23.8% rate (20% + 3.8% NIIT)
      label: '99-99.9%',
      avgIncome: 1102000,
      federalIncome: 0.143,
      capitalGains: 0.052,
      payroll: 0.024,
      stateIncome: 0.058,
      property: 0.019,
      salesExcise: 0.010,
      otherExcise: 0.001,
    },
    {
      // ~35% capital gains share at 23.8% rate
      label: '99.9-99.99%',
      avgIncome: 5225500,
      federalIncome: 0.122,
      capitalGains: 0.083,
      payroll: 0.005,
      stateIncome: 0.052,
      property: 0.014,
      salesExcise: 0.005,
      otherExcise: 0.001,
    },
    {
      // ~50% capital gains share at 23.8% rate
      label: 'Top 0.01%',
      avgIncome: 29220000,
      federalIncome: 0.063,
      capitalGains: 0.119,
      payroll: 0.001,
      stateIncome: 0.041,
      property: 0.010,
      salesExcise: 0.002,
      otherExcise: 0.000,
    },
  ],
}

const florida: StateData = {
  name: 'Florida',
  abbreviation: 'FL',
  buckets: nationalAverage.buckets.map(b => ({
    ...b,
    stateIncome: 0,
    salesExcise: b.salesExcise * 1.35,
    property: b.property * 1.1,
  })),
}

const california: StateData = {
  name: 'California',
  abbreviation: 'CA',
  buckets: nationalAverage.buckets.map((b, i) => ({
    ...b,
    // CA taxes capital gains as ordinary income — higher state rate on cap gains
    stateIncome: b.stateIncome * (1.2 + i * 0.08),
    salesExcise: b.salesExcise * 1.15,
  })),
}

const texas: StateData = {
  name: 'Texas',
  abbreviation: 'TX',
  buckets: nationalAverage.buckets.map(b => ({
    ...b,
    stateIncome: 0,
    property: b.property * 1.6,
    salesExcise: b.salesExcise * 1.25,
  })),
}

const minnesota: StateData = {
  name: 'Minnesota',
  abbreviation: 'MN',
  buckets: nationalAverage.buckets.map((b, i) => ({
    ...b,
    stateIncome: b.stateIncome * (1.4 + i * 0.09),
    property: b.property * 1.15,
    salesExcise: b.salesExcise * 0.95,
  })),
}

const newYork: StateData = {
  name: 'New York',
  abbreviation: 'NY',
  buckets: nationalAverage.buckets.map((b, i) => ({
    ...b,
    stateIncome: b.stateIncome * (1.3 + i * 0.1),
    property: b.property * 1.4,
  })),
}

const allStates: StateData[] = [nationalAverage, california, florida, minnesota, newYork, texas]

export function getAllStates(): StateData[] {
  return allStates
}

export function getStateData(abbreviation: string): StateData | undefined {
  return allStates.find(s => s.abbreviation === abbreviation)
}
