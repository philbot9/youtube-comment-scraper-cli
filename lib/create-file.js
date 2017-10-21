const Task = require('data.task')
const fs = require('fs')

const buildError = path => new Error(`Cannot write to file: ${path}`)

module.exports = path =>
  new Task((rej, res) =>
    fs.open(
      path,
      'w',
      (err, fd) =>
        (err
          ? rej(buildError(path))
          : fs.close(fd, err => (err ? rej(buildError(path)) : res(path))))
    )
  )
