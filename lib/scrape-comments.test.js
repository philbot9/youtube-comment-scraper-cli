const Task = require('data.task')
const Validation = require('data.validation')
const chalk = require('chalk')

const mockParseOptions = jest.fn(x => Validation.of(x))
jest.mock('./parse-options', () => mockParseOptions)

const mockCreateFile = jest.fn()
jest.mock('./create-file', () => mockCreateFile)

const mockScrapeAllComments = jest.fn(() => Task.of([]))
jest.mock('./scrape-all-comments', () => mockScrapeAllComments)

const mockStreamComments = jest.fn(() => Task.of())
jest.mock('./stream-comments', () => mockStreamComments)

const scrapeComments = require('./scrape-comments')

describe('scrape-comments', () => {
  afterEach(() => jest.clearAllMocks())

  it('validates opts', done => {
    const parsedOpts = { parsed: true }
    mockCreateFile.mockReturnValue(Task.of('ok'))

    scrapeComments('videoId', { unparsed: true })

    setTimeout(() => {
      expect(mockParseOptions).toHaveBeenCalledWith({ unparsed: true })
      done()
    }, 100)
  })

  it('confirms outputFile can be written to', done => {
    mockCreateFile.mockReturnValue(Task.of('ok'))
    mockScrapeAllComments.mockReturnValue(Task.of('ok'))

    scrapeComments('videoId', { outputFile: '/good/file' })

    setTimeout(() => {
      expect(mockCreateFile).toHaveBeenCalledWith('/good/file')
      expect(mockScrapeAllComments).toHaveBeenCalledTimes(1)
      done()
    }, 100)
  })

  it('fails early if outputFile cannot be written to', done => {
    const err = new Error('This is the error')
    mockCreateFile.mockReturnValue(Task.rejected(err))
    mockScrapeAllComments.mockReturnValue(Task.rejected('should not get here'))
    const errorSpy = jest.spyOn(console, 'error')

    scrapeComments('videoId', { outputFile: '/bad/file' })

    setTimeout(() => {
      expect(mockCreateFile).toHaveBeenCalledWith('/bad/file')
      expect(mockScrapeAllComments).toHaveBeenCalledTimes(0)
      expect(errorSpy).toHaveBeenCalledWith(chalk.red('✕'), err.message)
      done()
    }, 100)
  })

  it('can scrape all comments', done => {
    mockCreateFile.mockReturnValue(Task.of('ok'))
    mockScrapeAllComments.mockReturnValue(Task.of('ok'))

    scrapeComments('videoId', {})

    setTimeout(() => {
      expect(mockScrapeAllComments).toHaveBeenCalledTimes(1)
      expect(mockScrapeAllComments.mock.calls[0][0]).toMatchObject({
        videoId: 'videoId'
      })
      done()
    }, 100)
  })

  it('can stream comments', done => {
    mockCreateFile.mockReturnValue(Task.of('ok'))
    mockScrapeAllComments.mockReturnValue(Task.of('ok'))

    scrapeComments('videoId', { stream: true })

    setTimeout(() => {
      expect(mockStreamComments).toHaveBeenCalledTimes(1)
      expect(mockStreamComments.mock.calls[0][0]).toMatchObject({
        videoId: 'videoId',
        opts: { stream: true }
      })
      done()
    }, 100)
  })
})
