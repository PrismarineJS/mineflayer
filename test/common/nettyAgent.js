// Builds test/netty-agent into a -javaagent jar. Needs a JDK (javac + jar);
// returns null when there is none so the suite still runs unpatched.
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const SRC = path.join(__dirname, '..', 'netty-agent')
let built

function tool (name) {
  const home = process.env.JAVA_HOME
  const candidate = home && path.join(home, 'bin', name)
  return candidate && fs.existsSync(candidate) ? candidate : name
}

function build () {
  if (built !== undefined) return built
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mineflayer-netty-agent-'))
  const jar = path.join(out, 'netty-autoread-fix.jar')
  const sources = fs.readdirSync(SRC).filter(f => f.endsWith('.java')).map(f => path.join(SRC, f))
  try {
    execFileSync(tool('javac'), ['-d', out, ...sources], { stdio: 'pipe' })
    fs.writeFileSync(path.join(out, 'MANIFEST.MF'), 'Premain-Class: NettyAutoReadFixAgent\n')
    execFileSync(tool('jar'), ['cfm', jar, path.join(out, 'MANIFEST.MF'), '-C', out, '.'], { stdio: 'pipe' })
    built = jar
  } catch (err) {
    console.log(`netty agent not built, server runs unpatched: ${err.stderr?.toString().trim() || err.message}`)
    built = null
  }
  return built
}

module.exports = { build }
