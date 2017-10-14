const mockJson2Csv = jest.fn()
jest.mock('json2csv', () => mockJson2Csv)

const csv = require('./csv')

describe('lib/csv', () => {
  describe('generateCsv()', () => {
    it('works with collapsed replies', () => {
      const opts = { collapseReplies: true }
      const comments = [{ id: 1 }, { id: 11, replyTo: 1 }, { id: 2 }]

      csv.generateCsv(opts, comments)

      expect(mockJson2Csv).toHaveBeenCalledWith({
        fields: csv.commentFields.concat(['replyTo']),
        data: comments
      })
    })

    it('works with non-collapsed replies', () => {
      const opts = { collapseReplies: false }
      const comments = [{ id: 1, replies: [{ id: 11 }, { id: 12 }] }, { id: 2 }]

      csv.generateCsv(opts, comments)

      expect(mockJson2Csv).toHaveBeenCalledWith({
        fields: csv.commentFields.concat(
          csv.commentFields.slice(0, -3).map(c => `reply.${c}`)
        ),
        data: [{ id: 1 }, { 'reply.id': 11 }, { 'reply.id': 12 }, { id: 2 }]
      })
    })
  })

  describe('commentToCsv()', () => {
    it('works without replies', () => {
      const opts = { collapseReplies: true }
      const comment = { id: 1 }

      csv.commentToCsv(opts, comment)

      expect(mockJson2Csv).toHaveBeenCalledWith({
        fields: csv.commentFields.concat(['replyTo']),
        data: [comment],
        hasCSVColumnTitle: false
      })
    })

    it('works with replies', () => {
      const opts = { collapseReplies: false }
      const comment = { id: 1, replies: [{ id: 11 }, { id: 12 }] }

      csv.commentToCsv(opts, comment)

      expect(mockJson2Csv).toHaveBeenCalledWith({
        fields: csv.commentFields.concat(
          csv.commentFields.slice(0, -3).map(c => `reply.${c}`)
        ),
        data: [{ id: 1 }, { 'reply.id': 11 }, { 'reply.id': 12 }],
        hasCSVColumnTitle: false
      })
    })
  })
})
