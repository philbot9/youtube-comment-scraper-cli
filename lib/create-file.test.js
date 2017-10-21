const Task = require('data.task')

const mockFs = {
  open: jest.fn((p, t, cb) => cb()),
  close: jest.fn((fd, cb) => cb())
}
jest.mock('fs', () => mockFs)

const createFile = require('./create-file')

describe('lib/create-file', () => {
  it('succeeds when file can be opened for writing', done => {
    createFile('./testfile').fork(
      e => done('failed'),
      res => {
        expect(res).toEqual('./testfile')
        done()
      }
    )
  })

  it('fails if file cannot be opened for writing', done => {
    const error = new Error('Some error')
    mockFs.open.mockImplementation((p, t, cb) => cb(error))

    createFile('./testfile').fork(
      e => {
        expect(e.message).toBe('Cannot write to file: ./testfile')
        done()
      },
      res => done('should not succeed')
    )
  })
})
