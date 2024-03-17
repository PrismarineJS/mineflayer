if (typeof process !== 'undefined' && !process.browser && process.platform !== 'browser' && parseInt(process.versions.node.split('.')[0]) < 18) {
  console.error('Your node version is currently', process.versions.node)
  console.error('Please update it to a version >= 18.x.x from https://nodejs.org/')
  process.exit(1)
}

module.exports = require('./lib/loader.js')
