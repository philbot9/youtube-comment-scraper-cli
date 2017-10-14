const R = require('ramda')

module.exports = comment =>
  (comment.replies
    ? [R.omit(['replies'], comment)].concat(
        comment.replies.map(r => Object.assign({}, r, { replyTo: comment.id }))
      )
    : [comment])
