import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT || 4021)
const PAY_TO = '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA'
const PRICE_LAMPORTS = '1000000'
const PRICE_SOL = '0.001'
const NETWORK = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const RPC = 'https://api.mainnet-beta.solana.com'
const CLAIM = 'FVt5ytSbkf2KX8X9wJFKSSXwL4C2LARU6J9kDQhsqfADU9sqnJ6Bxa2xCZx43fzocpArZVx5CYyq8N1iWsGuWNZ'
const ROOT = dirname(fileURLToPath(import.meta.url))

function paymentRequired() {
  return {
    x402Version: 2,
    error: 'PAYMENT_REQUIRED',
    accepts: [{
      scheme: 'exact',
      network: NETWORK,
      amount: PRICE_LAMPORTS,
      asset: 'native',
      payTo: PAY_TO,
      maxTimeoutSeconds: 300,
      extra: {
        solanaPay: `solana:${PAY_TO}?amount=${PRICE_SOL}&label=Solana%20Pulse%20XaaS&message=GET%20/pulse`,
      },
    }],
  }
}

function encodeHeader(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

async function rpc(method, params) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  return res.json()
}

async function paymentOk(sig) {
  if (!sig || sig === CLAIM) return false
  const status = await rpc('getSignatureStatuses', [[sig], { searchTransactionHistory: true }])
  const value = status.result?.value?.[0]
  if (!value || value.err) return false
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }])
  const meta = tx.result?.meta
  if (!meta) return false
  const keys = tx.result.transaction.message.accountKeys.map((k) => (typeof k === 'string' ? k : k.pubkey))
  const idx = keys.indexOf(PAY_TO)
  if (idx < 0) return false
  const delta = Number(meta.postBalances[idx] || 0) - Number(meta.preBalances[idx] || 0)
  return delta >= Number(PRICE_LAMPORTS)
}

function json(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'PAYMENT-SIGNATURE, X-PAYMENT, content-type',
    'access-control-expose-headers': 'PAYMENT-REQUIRED, PAYMENT-RESPONSE',
    ...extraHeaders,
  })
  res.end(payload)
}

function sendFile(res, path, type) {
  const body = readFileSync(path)
  res.writeHead(200, { 'content-type': type, 'access-control-allow-origin': '*' })
  res.end(body)
}

async function latestPulse() {
  const slot = await rpc('getSlot', [])
  const epoch = await rpc('getEpochInfo', [])
  const health = await rpc('getHealth', [])
  return {
    generatedAt: new Date().toISOString(),
    rpc: RPC,
    health: health.result ?? health.error ?? 'unknown',
    slot: slot.result ?? null,
    epoch: epoch.result ?? null,
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'PAYMENT-SIGNATURE, X-PAYMENT, content-type',
      'access-control-allow-methods': 'GET, OPTIONS',
    })
    return res.end()
  }
  try {
    if (url.pathname === '/.well-known/x402.json') {
      return json(res, 200, {
        x402Version: 2,
        name: 'Solana Pulse XaaS',
        description: 'Live Solana slot/epoch pulse for AI agents. Pay 0.001 SOL per call.',
        payTo: PAY_TO,
        resources: [{
          resource: '/pulse',
          method: 'GET',
          description: 'Latest Solana slot, epoch, and health',
          mimeType: 'application/json',
          accepts: paymentRequired().accepts,
        }],
      })
    }
    if (url.pathname === '/openapi.json') {
      return sendFile(res, join(ROOT, 'openapi.json'), 'application/json; charset=utf-8')
    }
    if (url.pathname === '/llms.txt') {
      return sendFile(res, join(ROOT, 'llms.txt'), 'text/plain; charset=utf-8')
    }
    if (url.pathname === '/pulse') {
      const sig = url.searchParams.get('sig')
        || req.headers['payment-signature']
        || req.headers['x-payment']
      if (await paymentOk(String(sig || ''))) {
        return json(res, 200, await latestPulse(), {
          'PAYMENT-RESPONSE': encodeHeader({ success: true, tx: sig }),
        })
      }
      const required = paymentRequired()
      return json(res, 402, required, { 'PAYMENT-REQUIRED': encodeHeader(required) })
    }
    if (url.pathname === '/') {
      return json(res, 200, {
        name: 'Solana Pulse XaaS',
        payTo: PAY_TO,
        paid: { path: '/pulse', priceSol: PRICE_SOL },
        catalog: '/.well-known/x402.json',
      })
    }
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not_found' }))
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: String(error) }))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(JSON.stringify({ listening: `http://127.0.0.1:${PORT}`, payTo: PAY_TO, priceSol: PRICE_SOL }))
})
