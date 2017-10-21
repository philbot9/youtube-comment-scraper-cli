const Task = require('data.task')
const scrapeComments = require('youtube-comments-task')
const fs = require('fs')

const collapseReplies = require('./collapse-replies')
const csv = require('./csv')
const json = require('./json')

const scrapeAllComments = (videoId, pageToken, fetched = []) =>
  scrapeComments(videoId, pageToken)
    .chain(
      ({ comments, nextPageToken }) =>
        (nextPageToken
          ? scrapeAllComments(videoId, nextPageToken, fetched.concat(comments))
          : Task.of(fetched.concat(comments)))
    )
    .rejectedMap(e => (e ? e.message || e : 'Scraping failed'))

const writeToFile = opts => data =>
  new Task((rej, res) =>
    fs.writeFile(
      opts.outputFile,
      data,
      'utf8',
      err => (err ? rej(err) : res(data))
    )
  )

const writeToStdout = data => {
  console.log(data)
  return data
}

module.exports = ({ videoId, opts }) =>
  scrapeAllComments(videoId)
    .map(
      comments =>
        (opts.collapseReplies
          ? comments.reduce((acc, c) => acc.concat(collapseReplies(c)), [])
          : comments)
    )
    .map(
      comments =>
        (opts.format === 'csv'
          ? csv.generateCsv(opts, comments)
          : json.generateJson(comments))
    )
    .chain(opts.outputFile ? writeToFile(opts) : x => Task.of(x))
    .map(opts.stdout ? writeToStdout : x => x)
