import type { StateData } from './types'

const nationalAverage: StateData = {
  name: 'National Average',
  abbreviation: 'US',
  buckets: [
    {
      label: 'Bottom 20%',
      avgIncome: 13600,
      federalIncome: -0.02,
      payroll: 0.082,
      stateIncome: -0.002,
      property: 0.044,
      salesExcise: 0.07,
      otherExcise: 0.015,
    },
    {
      label: '20-40%',
      avgIncome: 31000,
      federalIncome: 0.01,
      payroll: 0.098,
      stateIncome: 0.012,
      property: 0.038,
      salesExcise: 0.058,
      otherExcise: 0.012,
    },
    {
      label: '40-60%',
      avgIncome: 52200,
      federalIncome: 0.052,
      payroll: 0.112,
      stateIncome: 0.024,
      property: 0.031,
      salesExcise: 0.048,
      otherExcise: 0.009,
    },
    {
      label: '60-80%',
      avgIncome: 86200,
      federalIncome: 0.079,
      payroll: 0.119,
      stateIncome: 0.035,
      property: 0.029,
      salesExcise: 0.038,
      otherExcise: 0.007,
    },
    {
      label: '80-90%',
      avgIncome: 127800,
      federalIncome: 0.108,
      payroll: 0.121,
      stateIncome: 0.044,
      property: 0.028,
      salesExcise: 0.031,
      otherExcise: 0.005,
    },
    {
      label: '90-95%',
      avgIncome: 178400,
      federalIncome: 0.135,
      payroll: 0.108,
      stateIncome: 0.051,
      property: 0.026,
      salesExcise: 0.024,
      otherExcise: 0.004,
    },
    {
      label: '95-99%',
      avgIncome: 316800,
      federalIncome: 0.168,
      payroll: 0.072,
      stateIncome: 0.055,
      property: 0.023,
      salesExcise: 0.016,
      otherExcise: 0.003,
    },
    {
      label: '99-99.9%',
      avgIncome: 1102000,
      federalIncome: 0.218,
      payroll: 0.024,
      stateIncome: 0.058,
      property: 0.019,
      salesExcise: 0.010,
      otherExcise: 0.001,
    },
    {
      label: '99.9-99.99%',
      avgIncome: 5225500,
      federalIncome: 0.242,
      payroll: 0.005,
      stateIncome: 0.052,
      property: 0.014,
      salesExcise: 0.005,
      otherExcise: 0.001,
    },
    {
      label: 'Top 0.01%',
      avgIncome: 29220000,
      federalIncome: 0.231,
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
    stateIncome: b.stateIncome * (1.4 + i * 0.09),  // progressive state income tax
    property: b.property * 1.15,
    salesExcise: b.salesExcise * 0.95,  // slightly lower sales tax, clothing exempt
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
