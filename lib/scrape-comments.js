const Validation = require('data.validation')
const Task = require('data.task')
const chalk = require('chalk')
const fs = require('fs')

const parseOptions = require('./parse-options')
const scrapeAllComments = require('./scrape-all-comments')
const collapseReplies = require('./collapse-replies')
const csv = require('./csv')
const json = require('./json')

const validationToTask = val => val.fold(Task.rejected, Task.of)

const validateVideoId = videoId =>
  Validation.fromNullable(videoId).failureMap(() => [
    'Missing required parameter: videoId'
  ])

const validateArgs = (videoId, opts) =>
  Validation.Success(videoId => opts => ({ videoId, opts }))
    .ap(validateVideoId(videoId))
    .ap(parseOptions(opts))

const printError = err => {
  console.error(chalk.red('✕'), err)
  return err
}

const writeToFile = opts => data =>
  new Task((rej, res) =>
    fs.writeFile(
      opts.outputFile,
      data,
      'utf8',
      err => (err ? rej(err) : res(data))
    )
  )

const writeToStdout = console.log

const scrapeCommentsAndWrite = ({ videoId, opts }) =>
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
    .map(opts.outputFile ? writeToFile(opts) : x => x)
    .map(opts.stdout ? writeToStdout : x => x)

module.exports = (videoId, opts) =>
  validationToTask(validateArgs(videoId, opts))
    .chain(
      ({ videoId, opts }) =>
        (opts.stream
          ? console.log('TODO: stream')
          : scrapeCommentsAndWrite({ videoId, opts }))
    )
    .fork(e => (Array.isArray(e) ? e.map(printError) : printError(e)), () => {})
