const Task = require('data.task')

const mockScrapeComments = jest.fn()
jest.mock('youtube-comments-task', () => mockScrapeComments)

const scrapeAllComments = require('./scrape-all-comments')

describe('lib/scrape-all-comments', () => {
  afterEach(() => jest.clearAllMocks())

  it('rejects if scraping fails', done => {
    const err = 'some error'
    mockScrapeComments.mockReturnValue(Task.rejected(err))

    scrapeAllComments('videoId').fork(
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

    scrapeAllComments('abc123').fork(
      e => done(e),
      result => {
        expect(mockScrapeComments.mock.calls[0][0]).toBe('abc123')
        expect(result).toEqual(comments)
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

    scrapeAllComments('def456').fork(
      e => done(e),
      result => {
        expect(mockScrapeComments).toHaveBeenCalledTimes(2)
        expect(mockScrapeComments.mock.calls[0]).toEqual(['def456', undefined])
        expect(mockScrapeComments.mock.calls[1]).toEqual([
          'def456',
          'nextPageToken'
        ])
        expect(result).toEqual(allComments)
        done()
      }
    )
  })
})
