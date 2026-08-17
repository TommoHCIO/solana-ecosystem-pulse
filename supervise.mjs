// Keep xaas-server.mjs always running: respawn immediately on any exit so
// crawlers/agents never hit a dead origin (agent402 router excludes flaky sellers).
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const target = join(here, 'xaas-server.mjs')

let restarts = 0
function start() {
  const child = spawn(process.execPath, [target], { stdio: 'inherit' })
  child.on('exit', (code, signal) => {
    restarts += 1
    console.log(JSON.stringify({ supervisor: 'child-exit', code, signal, restarts, at: new Date().toISOString() }))
    // Immediate respawn; small delay only to avoid a tight crash loop.
    setTimeout(start, 500)
  })
  child.on('error', (err) => {
    console.log(JSON.stringify({ supervisor: 'spawn-error', error: String(err), at: new Date().toISOString() }))
    setTimeout(start, 1000)
  })
}
console.log(JSON.stringify({ supervisor: 'starting', target, at: new Date().toISOString() }))
start()
