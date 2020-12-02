function callbackify (f) {
  return function (...args) {
    const cb = args[f.length]
    return f(...args).then(r => { if (cb) { cb(undefined, r) } return r }, err => { if (cb) { cb(err) } else throw err })
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  callbackify,
  sleep
}
