const Task = require('data.task')
const scrapeComments = require('youtube-comments-task')

const scrapeAllComments = (videoId, pageToken, fetched = []) =>
  scrapeComments(videoId, pageToken)
    .chain(
      ({ comments, nextPageToken }) =>
        (nextPageToken
          ? scrapeAllComments(videoId, nextPageToken, fetched.concat(comments))
          : Task.of(fetched.concat(comments)))
    )
    .rejectedMap(e => (e ? e.message || e : 'Scraping failed'))

module.exports = scrapeAllComments
