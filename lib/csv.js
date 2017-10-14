const R = require('ramda')
const json2csv = require('json2csv')

const commentFields = [
  'id',
  'author',
  'authorLink',
  'authorThumb',
  'text',
  'likes',
  'time',
  'timestamp',
  'edited',
  'hasReplies',
  'repliesToken',
  'numReplies'
]

const getCsvFields = ({ collapseReplies = false }) =>
  commentFields.concat(
    collapseReplies
      ? ['replyTo']
      : commentFields.slice(0, -3).map(c => `reply.${c}`)
  )

const fanOutReplies = comment =>
  (comment.replies
    ? [R.omit(['replies'], comment)].concat(
        comment.replies.map(r =>
          Object.keys(r).reduce(
            (acc, k) => Object.assign({}, acc, { [`reply.${k}`]: r[k] }),
            {}
          )
        )
      )
    : [comment])

const generateCsv = (opts, comments) => {
  const data = opts.collapseReplies
    ? comments
    : comments.reduce((cs, c) => cs.concat(fanOutReplies(c)), [])
  return json2csv({ fields: getCsvFields(opts), data })
}

const commentToCsv = (opts, comment) => {
  const data = opts.collapseReplies ? [comment] : fanOutReplies(comment)
  return json2csv({
    fields: getCsvFields(opts),
    data,
    hasCSVColumnTitle: false
  })
}

module.exports = { generateCsv, commentToCsv, commentFields }
