const collapseReplies = require('./collapse-replies')

describe('lib/collapse-replies', () => {
  it('returns a comment without replies', () => {
    const comment = { id: 1 }
    expect(collapseReplies(comment)).toEqual([comment])
  })

  it('collapses replies into a single array', () => {
    const comment = { id: 1, replies: [{ id: 11 }, { id: 12 }] }
    expect(collapseReplies(comment)).toEqual([
      { id: 1 },
      { id: 11, replyTo: 1 },
      { id: 12, replyTo: 1 }
    ])
  })
})
