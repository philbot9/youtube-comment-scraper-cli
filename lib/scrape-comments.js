const Validation = require('data.validation')
const Task = require('data.task')
const chalk = require('chalk')
const fs = require('fs')

const parseOptions = require('./parse-options')
const scrapeAllComments = require('./scrape-all-comments')
const streamComments = require('./stream-comments')
const createFile = require('./create-file')

const validationToTask = val => val.fold(Task.rejected, Task.of)

const validateVideoId = videoId =>
  Validation.fromNullable(videoId).failureMap(() => [
    'Missing required parameter: videoId'
  ])

const validateArgs = (videoId, opts) =>
  Validation.Success(videoId => opts => ({ videoId, opts }))
    .ap(validateVideoId(videoId))
    .ap(parseOptions(opts))

const validateOutputFile = args =>
  (args.opts.outputFile
    ? createFile(args.opts.outputFile).map(() => args)
    : Task.of(args))

const printError = err => {
  console.error(chalk.red('✕'), err.message || err)
  return err
}

module.exports = (videoId, opts) =>
  validationToTask(validateArgs(videoId, opts))
    .chain(validateOutputFile)
    .chain(opts.stream ? streamComments : scrapeAllComments)
    .fork(e => (Array.isArray(e) ? e.map(printError) : printError(e)), () => {})
