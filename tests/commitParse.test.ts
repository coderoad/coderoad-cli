import { parseCommits } from '../src/utils/commits'

describe('commitParse', () => {
  it('should parse out #. commits', () => {
    const logs = {
      all: [
        {
          message: 'INIT',
          hash: '1'
        },
        {
          message: '1. First Level',
          hash: '2'
        },
        {
          message: '1.1 First Step',
          hash: '3'
        }
      ],
      total: 2,
      latest: {}
    }
    const commits = parseCommits(logs)
    expect(commits).toEqual({
      INIT: ['1'],
      '1': ['2'],
      '1.1:T': ['3']
    })
  })
  // @deprecated - remove L#
  it('should parse out L# commits', () => {
    const logs = {
      all: [
        {
          message: 'INIT',
          hash: '1'
        },
        {
          message: 'L1 First Level',
          hash: '2'
        },
        {
          message: 'L1S1 First Step',
          hash: '3'
        }
      ],
      total: 2,
      latest: {}
    }
    const commits = parseCommits(logs)
    expect(commits).toEqual({
      INIT: ['1'],
      '1': ['2'],
      '1.1:T': ['3']
    })
  })
  // @deprecated - remove with QA
  it('should parse out #.Q|A commits', () => {
    const logs = {
      all: [
        {
          message: 'INIT',
          hash: '1'
        },
        {
          message: '1. First Level',
          hash: '2'
        },
        {
          message: '1.1Q First Step',
          hash: '3'
        },
        {
          message: '1.1A First Step Solution',
          hash: '4'
        }
      ],
      total: 2,
      latest: {}
    }
    const commits = parseCommits(logs)
    expect(commits).toEqual({
      INIT: ['1'],
      '1': ['2'],
      '1.1:T': ['3'],
      '1.1:S': ['4']
    })
  })
  it('should parse out #.T|S commits', () => {
    const logs = {
      all: [
        {
          message: 'INIT',
          hash: '1'
        },
        {
          message: '1. First Level',
          hash: '2'
        },
        {
          message: '1.1T First Step',
          hash: '3'
        },
        {
          message: '1.1S First Step Solution',
          hash: '4'
        }
      ],
      total: 2,
      latest: {}
    }
    const commits = parseCommits(logs)
    expect(commits).toEqual({
      INIT: ['1'],
      '1': ['2'],
      '1.1:T': ['3'],
      '1.1:S': ['4']
    })
  })
  it('should parse out #._|S commits', () => {
    const logs = {
      all: [
        {
          message: 'INIT',
          hash: '1'
        },
        {
          message: '1. First Level',
          hash: '2'
        },
        {
          message: '1.1 First Step',
          hash: '3'
        },
        {
          message: '1.1S First Step Solution',
          hash: '4'
        }
      ],
      total: 2,
      latest: {}
    }
    const commits = parseCommits(logs)
    expect(commits).toEqual({
      INIT: ['1'],
      '1': ['2'],
      '1.1:T': ['3'],
      '1.1:S': ['4']
    })
  })
})
