const Task = require('data.task')
const chalk = require('chalk')

const mockCreateFile = jest.fn()
jest.mock('./create-file', () => mockCreateFile)

const mockScrapeAllComments = jest.fn()
jest.mock('./scrape-all-comments', () => mockScrapeAllComments)

const mockStreamComments = jest.fn()
jest.mock('./stream-comments', () => mockStreamComments)

const scrapeComments = require('./scrape-comments')

describe('scrape-comments', () => {
  afterEach(() => jest.clearAllMocks())

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
})
