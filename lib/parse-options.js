const { Success, Failure, fromNullable } = require('data.validation')
const { curry } = require('core.lambda')

const defaults = {
  format: 'json',
  outputFile: null,
  stdout: true,
  collapseReplies: false,
  stream: false
}

// If an output file is given, don't write to stdout, unless --stdout is set
const setOutput = opts =>
  (opts.outputFile && opts.stdout == null
    ? Object.assign({}, opts, { stdout: false })
    : opts)

const applyDefaults = opts => Object.assign({}, defaults, opts)

const validateFormat = opts =>
  (!/(csv|json)/i.test(opts.format)
    ? Failure(['Invalid format (can be json or csv).'])
    : Success(opts))

const validateOutput = opts =>
  (!opts.outputFile && !opts.stdout
    ? Failure(['Please define either an outputFile or use stdout.'])
    : Success(opts))

module.exports = opts =>
  fromNullable(opts)
    .map(setOutput)
    .map(applyDefaults)
    .orElse(() => Success(defaults))
    .map(opts =>
      Success(curry(2, () => opts))
        .ap(validateFormat(opts))
        .ap(validateOutput(opts))
    )
    .get()
