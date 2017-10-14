const parseOpts = require('./parse-options')

describe('lib/parse-options', () => {
  it('returns defaults if opts are not defined', () => {
    expect(parseOpts().get()).toEqual({
      format: 'json',
      outputFile: null,
      stdout: true,
      collapseReplies: false,
      stream: false
    })
  })

  it('adds default values to partial opts', () => {
    expect(parseOpts({ format: 'csv' }).get()).toEqual({
      format: 'csv',
      outputFile: null,
      stdout: true,
      collapseReplies: false,
      stream: false
    })
  })

  it('sets stdout to false by default if an outputFile is given', () => {
    expect(parseOpts({ outputFile: 'somefile.json' }).get()).toEqual({
      format: 'json',
      outputFile: 'somefile.json',
      stdout: false,
      collapseReplies: false,
      stream: false
    })
  })

  it('sets stdout to true if no outputFile is given', () => {
    expect(parseOpts({ format: 'json' }).get()).toEqual({
      format: 'json',
      outputFile: null,
      stdout: true,
      collapseReplies: false,
      stream: false
    })
  })

  it('validation fails if format is invalid', () => {
    const result = parseOpts({ format: 'poop' })
    expect(result.isFailure).toBe(true)
    expect(result.merge()).toEqual(['Invalid format (can be json or csv).'])
  })

  it('validation fails if no outputFile is given and stdout is false', () => {
    const result = parseOpts({ stdout: false })
    expect(result.isFailure).toBe(true)
    expect(result.merge()).toEqual([
      'Please define either an outputFile or use stdout.'
    ])
  })

  it('validation aggregates all errors', () => {
    const result = parseOpts({ format: 'poop', stdout: false })
    expect(result.isFailure).toBe(true)
    expect(result.merge()).toEqual([
      'Invalid format (can be json or csv).',
      'Please define either an outputFile or use stdout.'
    ])
  })
})
