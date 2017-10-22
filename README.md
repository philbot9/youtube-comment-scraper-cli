# YouTube Comment Scraper

[![Build Status](https://travis-ci.org/philbot9/youtube-comment-scraper-cli.svg?branch=master)](https://travis-ci.org/philbot9/youtube-comment-scraper-cli)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Command line utility for scraping YouTube comments.

If you prefer a simple-to-use online solution, please go to http://ytcomments.klostermann.ca.



## Installation

1. Download and install Node.js (at least v6.11.4): https://nodejs.org/
2. In a terminal window, type `npm install -g youtube-comment-scraper-cli`
3. The program can be run from the command line with `youtube-comment-scraper <VideoID>`
4. Read the rest of the docs or check out `youtube-comment-scraper --help`



## Usage

### Commad

`$ youtube-comment-scraper [options] <VideoID>`


#### Where's the VideoId?

It's part of the video URL: `https://www.youtube.com/watch?v=<VideoID>`. 

**Examples:**

| Video URL     | Video ID    |
| ------------- |:-------------:|
| https://www.youtube.com/watch?v=abc123def45 | abc123def12 |
| https://youtu.be/abc123def45 | abc123def45 |


### Options

**All command line options are optional (d'oh), except for the VideoID parameter.**

| Option | Description|
|---|---|
|    [`-f --format <format>`](#format)         | output format (json or csv)
|    [`-o --outputFile <outputFile>`](#output-file) | write results to the given file
|    [`-d --stdout`](#stdout)                  | write results to stdout
|    [`-c --collapseReplies`](#collapse-replies)         | collapse replies and treat them the same as regular comments
|    [`-s --stream`](#stream)                  | output comments one-at-a-time as they are being scraped
|    [`-V, --version`](#version)                | output the version number
|    [`-h, --help`](#help)                   | output usage information





## Options explained

### Format

`-f --format <format>`

The comments can be formatted as either JSON or CSV data. Defaults to JSON if not specified.

##### Examples

`youtube-comment-scraper -f csv <VideoID>`

`youtube-comment-scraper --format json <VideoID>`


### Output File

`-o --outputFile <outputFile>`

The comments can be written directly to a file. In that case they will not be written to stdout (the terminal window). If you want both file and stdout output use the `--stdout` flag in addition to `--outputFile`.

##### Examples

`youtube-comment-scraper -o ./path/to/some/file.json <VideoID>`

`youtube-comment-scraper --outputFile some-file.csv --stdout --format csv <VideoID>`


### Stdout

`-d --stdout`

By default comments are always written to stdout (even without the `--stdout` flag). However, when using `--outputFile`, they will only be written to the file. If you want output to both, use `--stdout`.

##### Examples

`youtube-comment-scraper -d <VideoID>`

`youtube-comment-scraper --outputFile ./some/file --stdout <VideoID>`


### Collapse Replies

`-c --collapseReplies`

By default replies to comments are kept nested under that comment. If `--collapseReplies` is set, replies will be treated the same as regular comments. An additional field is added to replies `replyTo` wich contains the ID of the comment to which a reply belongs.

##### Examples

`youtube-comment-scraper -c <VideoID>`

`youtube-comment-scraper --collapseReplies --format csv <VideoID>`


### Stream

`-s --stream`

By default the program will scrape all comments without outputting any of them until the scrape is complete. When the `--stream` flag is set, comments are written one at a time as soon as they are scraped, while still maintaining the original order of comments (newest first). This works for both the JSON and CSV format.

##### Examples

`youtube-comment-scraper -s <VideoID>`

`youtube-comment-scraper --stream --format csv <VideoID>`

`youtube-comment-scraper --stream --format csv --outputFile some-file.csv <VideoID>`

`youtube-comment-scraper --stream <VideoID> > json-processing-tool`


### Version

`-V --version`

Output the current version of the program.

##### Examples

`youtube-comment-scraper -V`

`youtube-comment-scraper --version`


### Help

`-h --help`

Output usage help.

##### Examples

`youtube-comment-scraper -h`

`youtube-comment-scraper --help`

