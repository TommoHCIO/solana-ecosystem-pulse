import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT || 4021)
const PAY_TO = '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA'
const PRICE_LAMPORTS = '1000000'
const PRICE_SOL = '0.001'
const PRICE_USDC = '1000'
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const FEE_PAYER = '2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4'
const NETWORK = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const RPC = 'https://api.mainnet-beta.solana.com'
const FACILITATOR = 'https://facilitator.payai.network'
const CLAIM = 'FVt5ytSbkf2KX8X9wJFKSSXwL4C2LARU6J9kDQhsqfADU9sqnJ6Bxa2xCZx43fzocpArZVx5CYyq8N1iWsGuWNZ'
const ROOT = dirname(fileURLToPath(import.meta.url))

function usdcAccept() {
  return {
    scheme: 'exact',
    network: NETWORK,
    amount: PRICE_USDC,
    asset: USDC,
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    extra: { feePayer: FEE_PAYER },
  }
}

function solAccept() {
  return {
    scheme: 'exact',
    network: NETWORK,
    amount: PRICE_LAMPORTS,
    asset: 'native',
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    extra: {
      solanaPay: `solana:${PAY_TO}?amount=${PRICE_SOL}&label=Solana%20Pulse%20XaaS&message=paid-call`,
    },
  }
}

function paymentRequired() {
  return {
    x402Version: 2,
    error: 'PAYMENT_REQUIRED',
    accepts: [usdcAccept(), solAccept()],
  }
}

function encodeHeader(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

function isPubkey(value) {
  return typeof value === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)
}

async function rpc(method, params) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const body = await res.json()
  if (body.error) {
    const err = new Error(body.error.message || 'rpc_error')
    err.status = 502
    err.code = 'rpc_error'
    err.detail = body.error
    throw err
  }
  return body
}

function decodeProof(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  try {
    return JSON.parse(Buffer.from(text, 'base64').toString('utf8'))
  } catch {
    try { return JSON.parse(text) } catch { return { signature: text } }
  }
}

async function facilitatorOk(proof) {
  const paymentPayload = proof.paymentPayload || proof
  const paymentRequirements = proof.paymentRequirements || usdcAccept()
  const verify = await fetch(FACILITATOR + '/verify', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  })
  const verified = await verify.json().catch(() => ({}))
  if (verified.isValid !== true) return false
  const settle = await fetch(FACILITATOR + '/settle', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ paymentPayload, paymentRequirements }),
  })
  const settled = await settle.json().catch(() => ({}))
  return Boolean(settled.success || settled.transaction || settled.txHash)
}

async function nativeSolOk(sig) {
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

async function paymentOk(raw) {
  const proof = decodeProof(raw)
  if (!proof) return false
  if (proof.paymentPayload || proof.payload || proof.x402Version) {
    try { if (await facilitatorOk(proof)) return true } catch { /* facilitator rejected payload */ }
  }
  const sig = proof.signature || proof.tx || (typeof raw === 'string' && raw.length > 40 ? raw : '')
  return nativeSolOk(sig)
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

function requirePubkey(name, value) {
  if (!value) {
    const err = new Error(name + ' query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (!isPubkey(value)) {
    const err = new Error(name + ' must be a base58 public key')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return value
}

async function latestPulse() {
  const slot = await rpc('getSlot', [])
  const epoch = await rpc('getEpochInfo', [])
  const health = await rpc('getHealth', [])
  return {
    generatedAt: new Date().toISOString(),
    commitment: 'confirmed',
    health: health.result ?? 'unknown',
    slot: slot.result ?? null,
    epoch: epoch.result ?? null,
  }
}

async function solBalance(address) {
  const bal = await rpc('getBalance', [address, { commitment: 'confirmed' }])
  const lamports = bal.result?.value ?? null
  return {
    address,
    lamports,
    sol: lamports == null ? null : Number((lamports / 1e9).toFixed(9)),
    commitment: 'confirmed',
    generatedAt: new Date().toISOString(),
  }
}

async function solTx(sig) {
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }])
  if (!tx.result) {
    const err = new Error('transaction not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return { sig, found: true, tx: tx.result, generatedAt: new Date().toISOString() }
}

async function solTokens(address) {
  const token = await rpc('getTokenAccountsByOwner', [
    address,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ])
  const token2022 = await rpc('getTokenAccountsByOwner', [
    address,
    { programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' },
    { encoding: 'jsonParsed' },
  ])
  const rows = [...(token.result?.value ?? []), ...(token2022.result?.value ?? [])].map((item) => ({
    pubkey: item.pubkey,
    mint: item.account.data.parsed?.info?.mint,
    amount: item.account.data.parsed?.info?.tokenAmount?.uiAmountString,
    program: item.account.owner,
  }))
  return { address, count: rows.length, tokens: rows, generatedAt: new Date().toISOString() }
}

const PAID = {
  '/pulse': {
    validate() {},
    run: async () => latestPulse(),
  },
  '/balance': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => solBalance(url.searchParams.get('address')),
  },
  '/tx': {
    validate(url) { requirePubkey('sig', url.searchParams.get('sig')) },
    run: async (url) => solTx(url.searchParams.get('sig')),
  },
  '/tokens': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => solTokens(url.searchParams.get('address')),
  },
}

function catalogResources() {
  return [
    { path: '/pulse', description: 'Latest Solana slot, epoch, and health' },
    { path: '/balance', description: 'Native SOL balance for any address. Query: address' },
    { path: '/tx', description: 'Parsed Solana transaction by signature. Query: sig' },
    { path: '/tokens', description: 'SPL token accounts for any wallet. Query: address' },
  ].map((item) => ({
    resource: item.path,
    method: 'GET',
    description: item.description,
    mimeType: 'application/json',
    accepts: paymentRequired().accepts,
  }))
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
        description: 'Solana chain-data APIs for AI agents. Pay 0.001 USDC on Solana via PayAI, or 0.001 native SOL. Bazaar has Ethereum RPC wrappers; these fill the Solana data gap.',
        payTo: PAY_TO,
        resources: catalogResources(),
      })
    }
    if (url.pathname === '/openapi.json') {
      return sendFile(res, join(ROOT, 'openapi.json'), 'application/json; charset=utf-8')
    }
    if (url.pathname === '/llms.txt') {
      return sendFile(res, join(ROOT, 'llms.txt'), 'text/plain; charset=utf-8')
    }
    if (url.pathname === '/sample') {
      return json(res, 200, {
        free: true,
        note: 'Unpaid sample of /pulse so buyers can inspect quality before paying.',
        data: await latestPulse(),
      })
    }
    const handler = PAID[url.pathname]
    if (handler) {
      handler.validate(url)
      const proof = url.searchParams.get('payment')
        || req.headers['payment-signature']
        || req.headers['x-payment']
      if (await paymentOk(String(proof || ''))) {
        return json(res, 200, await handler.run(url), {
          'PAYMENT-RESPONSE': encodeHeader({ success: true }),
        })
      }
      const required = paymentRequired()
      return json(res, 402, required, { 'PAYMENT-REQUIRED': encodeHeader(required) })
    }
    if (url.pathname === '/') {
      return json(res, 200, {
        name: 'Solana Pulse XaaS',
        payTo: PAY_TO,
        paid: Object.keys(PAID),
        freeSample: '/sample',
        priceUsdc: '0.001',
        priceSol: PRICE_SOL,
        catalog: '/.well-known/x402.json',
        openapi: '/openapi.json',
        quality: 'Params are validated before payment. Missing fields return 400, not 402. Token-2022 included. Free /sample shows live pulse JSON.',
      })
    }
    return json(res, 404, { error: 'not_found', code: 'not_found' })
  } catch (error) {
    const status = Number(error.status) || 500
    return json(res, status, {
      error: error.message || String(error),
      code: error.code || 'server_error',
    })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(JSON.stringify({ listening: `http://127.0.0.1:${PORT}`, payTo: PAY_TO, priceSol: PRICE_SOL }))
})
