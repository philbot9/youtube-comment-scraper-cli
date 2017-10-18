const Task = require('data.task')
const Readable = require('stream').Readable
const fs = require('fs')
const scrapeComments = require('youtube-comments-task')

const collapseReplies = require('./collapse-replies')
const csv = require('./csv')
const json = require('./json')

const processComments = (opts, comments) =>
  (opts.collapseReplies
    ? comments.reduce((acc, c) => acc.concat(collapseReplies(c)), [])
    : comments).map(
    c =>
      (opts.format === 'csv' ? csv.commentToCsv(opts, c) : json.generateJson(c))
  )

const buildStream = (videoId, opts) => {
  const rs = Readable()
  let streamNextPageToken = null
  let isFirstPage = true
  const commentBuffer = []

  rs._read = () => {
    if (commentBuffer.length) {
      rs.push(commentBuffer.splice(0, 1)[0])
    } else if (streamNextPageToken || isFirstPage) {
      isFirstPage = false
      scrapeComments(videoId, streamNextPageToken)
        .map(commentPage => {
          processComments(opts, commentPage.comments).forEach(c =>
            commentBuffer.push(c)
          )
          streamNextPageToken = commentPage.nextPageToken
          return commentPage
        })
        .fork(
          err => rs.emit('error', err),
          () => rs.push(commentBuffer.splice(0, 1)[0])
        )
    } else {
      rs.push(null)
    }
  }

  return rs
}

module.exports = ({ videoId, opts }) => {
  return new Task((rej, res) => {
    const rs = buildStream(videoId, opts)
    rs.on('error', rej)
    rs.on('end', res)

    const { stdout, outputFile } = opts

    if (!stdout && !outputFile) {
      return rej('No output defined needs (opts.stdout or opts.outputFile)')
    }

    if (opts.outputFile) {
      try {
        rs.pipe(fs.createWriteStream(opts.outputFile))
      } catch (e) {
        return rej(e)
      }
    }

    if (opts.stdout) {
      rs.pipe(process.stdout)
    }
  })
}
