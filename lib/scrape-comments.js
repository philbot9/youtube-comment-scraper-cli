const Validation = require('data.validation')
const Task = require('data.task')
const chalk = require('chalk')

const parseOptions = require('./parse-options')
const scrapeAllComments = require('./scrape-all-comments')

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

module.exports = (videoId, opts) =>
  validationToTask(validateArgs(videoId, opts))
    .chain(
      ({ videoId, opts }) =>
        (opts.stream ? console.log('TODO: stream') : scrapeAllComments(videoId))
    )
    .fork(
      e => (Array.isArray(e) ? e.map(printError) : printError(e)),
      x => console.log(x)
    )
