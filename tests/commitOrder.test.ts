import { validateCommitOrder } from '../src/utils/validateCommits'

describe('commitOrder', () => {
  describe('#.# format', () => {
    it('should return true if order is valid', () => {
      const positions = ['INIT', '1', '1.1:T', '1.2:T', '2', '2.1:T']
      const result = validateCommitOrder(positions)
      expect(result).toBe(true)
    })
    it('should return true if valid with duplicates', () => {
      const positions = [
        'INIT',
        'INIT',
        '1',
        '1',
        '1.1:T',
        '1.1:T',
        '1.1:S',
        '1.1:S',
        '1.2:T',
        '1.2:S',
        '2',
        '2',
        '2.1:T',
        '2.1:S'
      ]
      const result = validateCommitOrder(positions)
      expect(result).toBe(true)
    })
    it('should return false if INIT is out of order', () => {
      const positions = ['INIT', '1', '1.1:T', '1.2:T', 'INIT', '2', '2.1:T']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
    it('should return false if level after step is out of order', () => {
      const positions = ['INIT', '1', '1.1:T', '1.2:T', '2.1:T', '2']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
    it('should return false if level is out of order', () => {
      const positions = ['INIT', '1', '3', '2']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
    it('should return false if step is out of order', () => {
      const positions = ['INIT', '1', '1.1:T', '1.3:T', '1.2:T']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
    it('should return false if solution is before step', () => {
      const positions = ['INIT', '1', '1.1:S', '1.1:T', '1.2:T']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
    it('should return false if solution but no test step', () => {
      const positions = ['INIT', '1', '1.1:S', '1.2:T']
      const result = validateCommitOrder(positions)
      expect(result).toBe(false)
    })
  })
})
