import { describe, it, expect } from 'vitest'
import { getAllStates, getStateData } from './taxData'

describe('taxData', () => {
  it('has a national average entry', () => {
    const data = getStateData('US')
    expect(data).toBeDefined()
    expect(data!.name).toBe('National Average')
    expect(data!.buckets).toHaveLength(10)
  })

  it('each bucket has all tax layer rates between 0 and 1', () => {
    const data = getStateData('US')!
    for (const bucket of data.buckets) {
      expect(bucket.avgIncome).toBeGreaterThan(0)
      expect(bucket.federalIncome).toBeGreaterThanOrEqual(-0.1)
      expect(bucket.federalIncome).toBeLessThanOrEqual(1)
      expect(bucket.payroll).toBeGreaterThanOrEqual(0)
      expect(bucket.salesExcise).toBeGreaterThanOrEqual(0)
    }
  })

  it('getAllStates returns at least national average', () => {
    const states = getAllStates()
    expect(states.length).toBeGreaterThanOrEqual(1)
    expect(states.find(s => s.abbreviation === 'US')).toBeDefined()
  })

  it('total tax rate is reasonable (under 60% for all buckets)', () => {
    const data = getStateData('US')!
    for (const bucket of data.buckets) {
      const total = bucket.federalIncome + bucket.payroll + bucket.stateIncome
        + bucket.property + bucket.salesExcise + bucket.otherExcise
      expect(total).toBeLessThan(0.60)
      expect(total).toBeGreaterThan(0)
    }
  })
})
