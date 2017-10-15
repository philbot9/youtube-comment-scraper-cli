const Task = require('data.task')
const Stream = require('stream')

const csv = require('./csv')
const json = require('./json')

const mockScrapeComments = jest.fn()
jest.mock('youtube-comments-task', () => mockScrapeComments)

const mockFs = {
  createWriteStream: jest.fn()
}
jest.mock('fs', () => mockFs)

const streamComments = require('./stream-comments')

describe('lib/stream-comments', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects if scraping comments fails', done => {
    const err = 'some error'
    mockScrapeComments.mockReturnValue(Task.rejected(err))

    streamComments({ videoId: 'abc123', opts: { stdout: true } }).fork(
      e => {
        expect(mockScrapeComments).toHaveBeenCalledWith('abc123', null)
        expect(e).toEqual(err)
        done()
      },
      () => done('should not succeed')
    )
  })

  it('supports writing to stdout', done => {
    const commentPages = [[{ id: 1 }, { id: 2 }], [{ id: 3 }, { id: 4 }]]
    let pageIndex = 0
    mockScrapeComments.mockImplementation(() =>
      Task.of({
        comments: commentPages[pageIndex++],
        nextPageToken: pageIndex === 1 ? 'nextPageToken' : null
      })
    )

    const mockStream = Stream.Writable()
    let written = []
    mockStream._write = (chunk, enc, next) => {
      written.push(chunk.toString())
      next()
    }
    global.process.stdout = mockStream

    const expected = commentPages
      .reduce((acc, cs) => acc.concat(cs), [])
      .map(json.generateJson)

    streamComments({ videoId: 'abc123', opts: { stdout: true } }).fork(
      e => done(e || 'Failed'),
      () => {
        expect(mockScrapeComments).toHaveBeenCalledTimes(2)
        expect(mockScrapeComments).toHaveBeenCalledWith('abc123', null)
        expect(mockScrapeComments).toHaveBeenCalledWith(
          'abc123',
          'nextPageToken'
        )
        expect(written).toEqual(expected)
        done()
      }
    )
  })

  it('supports writing to a file', done => {
    const commentPages = [[{ id: 1 }, { id: 2 }], [{ id: 3 }, { id: 4 }]]
    let pageIndex = 0
    mockScrapeComments.mockImplementation(() =>
      Task.of({
        comments: commentPages[pageIndex++],
        nextPageToken: pageIndex === 1 ? 'nextPageToken' : null
      })
    )

    const mockStream = Stream.Writable()
    let written = []
    mockStream._write = (chunk, enc, next) => {
      written.push(chunk.toString())
      next()
    }
    mockFs.createWriteStream.mockReturnValue(mockStream)

    const outputFile = './some-file'
    const expected = commentPages
      .reduce((acc, cs) => acc.concat(cs), [])
      .map(json.generateJson)

    streamComments({ videoId: 'abc123', opts: { outputFile } }).fork(
      e => done(e || 'Failed'),
      () => {
        expect(mockScrapeComments).toHaveBeenCalledTimes(2)
        expect(mockScrapeComments).toHaveBeenCalledWith('abc123', null)
        expect(mockScrapeComments).toHaveBeenCalledWith(
          'abc123',
          'nextPageToken'
        )
        expect(mockFs.createWriteStream).toHaveBeenCalledWith(outputFile)
        expect(written).toEqual(expected)
        done()
      }
    )
  })

  it('supports csv outut', done => {
    const commentPages = [[{ id: 1 }, { id: 2 }], [{ id: 3 }, { id: 4 }]]
    let pageIndex = 0
    mockScrapeComments.mockImplementation(() =>
      Task.of({
        comments: commentPages[pageIndex++],
        nextPageToken: pageIndex === 1 ? 'nextPageToken' : null
      })
    )

    const mockStream = Stream.Writable()
    let written = []
    mockStream._write = (chunk, enc, next) => {
      written.push(chunk.toString())
      next()
    }
    global.process.stdout = mockStream

    const expected = commentPages
      .reduce((acc, cs) => acc.concat(cs), [])
      .map(c => csv.commentToCsv({}, c))

    streamComments({
      videoId: 'abc123',
      opts: { stdout: true, format: 'csv' }
    }).fork(
      e => done(e || 'Failed'),
      () => {
        expect(mockScrapeComments).toHaveBeenCalledTimes(2)
        expect(mockScrapeComments).toHaveBeenCalledWith('abc123', null)
        expect(mockScrapeComments).toHaveBeenCalledWith(
          'abc123',
          'nextPageToken'
        )
        expect(written).toEqual(expected)
        done()
      }
    )
  })
})
