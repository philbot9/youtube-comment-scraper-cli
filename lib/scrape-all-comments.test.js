const Task = require('data.task')
const json = require('./json')
const csv = require('./csv')

const mockScrapeComments = jest.fn()
jest.mock('youtube-comments-task', () => mockScrapeComments)

const mockFs = {
  writeFile: jest.fn()
}
jest.mock('fs', () => mockFs)

const scrapeAllComments = require('./scrape-all-comments')

describe('lib/scrape-all-comments', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects if scraping fails', done => {
    const err = 'some error'
    mockScrapeComments.mockReturnValue(Task.rejected(err))

    scrapeAllComments({ videoId: 'videoId', opts: {} }).fork(
      e => {
        expect(e).toEqual(err)
        done()
      },
      () => expect(true).toBe(false)
    )
  })

  it('scrapes a page of comments', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))

    scrapeAllComments({ videoId: 'abc123', opts: {} }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(result).toEqual(json.generateJson(comments))
        done()
      }
    )
  })

  it('scrapes multiple pages of comments', done => {
    let pageIndex = 0
    const commentPages = [[{ id: 1 }, { id: 2 }], [{ id: 3 }, { id: 4 }]]
    const allComments = commentPages.reduce((acc, cs) => acc.concat(cs), [])

    mockScrapeComments.mockImplementation((a, b, c) =>
      Task.of({
        comments: commentPages[pageIndex++],
        nextPageToken: pageIndex < commentPages.length ? 'nextPageToken' : null
      })
    )

    scrapeAllComments({ videoId: 'def456', opts: {} }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments).toHaveBeenCalledTimes(2)
        expect(mockScrapeComments.mock.calls[0]).toEqual(['def456', undefined])
        expect(mockScrapeComments.mock.calls[1]).toEqual([
          'def456',
          'nextPageToken'
        ])
        expect(result).toEqual(json.generateJson(allComments))
        done()
      }
    )
  })

  it('can generate csv output', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))

    scrapeAllComments({ videoId: 'abc123', opts: { format: 'csv' } }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(result).toEqual(csv.generateCsv({}, comments))
        done()
      }
    )
  })

  it('can collapse replies', done => {
    const comments = [{ id: 1 }, { id: 2, replies: [{ id: 21 }, { id: 22 }] }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))

    scrapeAllComments({
      videoId: 'abc123',
      opts: { collapseReplies: true }
    }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(result).toEqual(
          json.generateJson([
            { id: 1 },
            { id: 2 },
            { id: 21, replyTo: 2 },
            { id: 22, replyTo: 2 }
          ])
        )
        done()
      }
    )
  })

  it('can write to file', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))

    mockFs.writeFile.mockImplementation((f, d, e, cb) => cb())

    scrapeAllComments({
      videoId: 'abc123',
      opts: { outputFile: './outputFile' }
    }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')

        expect(mockFs.writeFile).toHaveBeenCalledTimes(1)
        expect(mockFs.writeFile.mock.calls[0][0]).toBe('./outputFile')
        expect(mockFs.writeFile.mock.calls[0][1]).toBe(
          json.generateJson(comments)
        )
        expect(mockFs.writeFile.mock.calls[0][2]).toBe('utf8')
        done()
      }
    )
  })

  it('rejecst if there is a file error', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))
    const error = new Error('some error')
    mockFs.writeFile.mockImplementation((f, d, e, cb) => cb(error))

    scrapeAllComments({
      videoId: 'abc123',
      opts: { outputFile: './outputFile' }
    }).fork(
      e => {
        expect(e).toEqual(error)
        done()
      },
      result => done('should not succeed')
    )
  })

  it('can write to stdout', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))
    const mockLog = jest.fn()

    const logSpy = jest.spyOn(console, 'log')

    scrapeAllComments({
      videoId: 'abc123',
      opts: { stdout: true }
    }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(logSpy).toHaveBeenCalledWith(json.generateJson(comments))
        done()
      }
    )
  })

  it('can write to file and stdout at the same time', done => {
    const comments = [{ id: 1 }, { id: 2 }]
    mockScrapeComments.mockReturnValue(Task.of({ comments }))
    const mockLog = jest.fn()

    const logSpy = jest.spyOn(console, 'log')
    mockFs.writeFile.mockImplementation((f, d, e, cb) => cb())

    scrapeAllComments({
      videoId: 'abc123',
      opts: {
        stdout: true,
        outputFile: './outputFile'
      }
    }).fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(logSpy).toHaveBeenCalledWith(json.generateJson(comments))
        expect(mockFs.writeFile).toHaveBeenCalledTimes(1)
        expect(mockFs.writeFile.mock.calls[0][0]).toBe('./outputFile')
        expect(mockFs.writeFile.mock.calls[0][1]).toBe(
          json.generateJson(comments)
        )
        expect(mockFs.writeFile.mock.calls[0][2]).toBe('utf8')
        done()
      }
    )
  })
})
