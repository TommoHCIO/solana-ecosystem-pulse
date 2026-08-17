import { createServer } from 'node:http'
import tls from 'node:tls'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT || 4021)
const PAY_TO = '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA'
const PRICE_LAMPORTS = '1000000'
const PRICE_SOL = '0.001'
const PRICE_USDC = '1000'
const ROUTE_PRICE = {
  '/pulse': { usdc: '1000', sol: '1000000' },
  '/balance': { usdc: '1000', sol: '1000000' },
  '/tx': { usdc: '1000', sol: '1000000' },
  '/tokens': { usdc: '1000', sol: '1000000' },
  '/quote': { usdc: '10000', sol: '10000000' },
  '/license': { usdc: '100000', sol: '100000000' },
  '/preflight': { usdc: '150000', sol: '150000000' },
  '/extract': { usdc: '20000', sol: '20000000' },
  '/search': { usdc: '10000', sol: '10000000' },
  '/screen': { usdc: '10000', sol: '10000000' },
  '/risk': { usdc: '20000', sol: '20000000' },
  '/price': { usdc: '5000', sol: '5000000' },
  '/wallet': { usdc: '10000', sol: '10000000' },
  '/sigs': { usdc: '10000', sol: '10000000' },
  '/account': { usdc: '10000', sol: '10000000' },
  '/holders': { usdc: '15000', sol: '15000000' },
  '/tls': { usdc: '10000', sol: '10000000' },
}
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const FEE_PAYER = '2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4'
const NETWORK = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const RPC = 'https://api.mainnet-beta.solana.com'
const FACILITATOR = 'https://facilitator.payai.network'
const CLAIM = 'FVt5ytSbkf2KX8X9wJFKSSXwL4C2LARU6J9kDQhsqfADU9sqnJ6Bxa2xCZx43fzocpArZVx5CYyq8N1iWsGuWNZ'
const ROOT = dirname(fileURLToPath(import.meta.url))

function usdcAccept(amount = PRICE_USDC) {
  return {
    scheme: 'exact',
    network: NETWORK,
    amount,
    asset: USDC,
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    extra: { feePayer: FEE_PAYER },
  }
}

function solAccept(lamports = PRICE_LAMPORTS) {
  const sol = Number(lamports) / 1e9
  return {
    scheme: 'exact',
    network: NETWORK,
    amount: lamports,
    asset: 'native',
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    extra: {
      solanaPay: `solana:${PAY_TO}?amount=${sol}&label=Solana%20Pulse%20XaaS&message=paid-call`,
    },
  }
}

function bazaarExtension(queryExample, outputExample) {
  const queryProps = Object.fromEntries(Object.keys(queryExample).map((key) => [key, { type: 'string' }]))
  return {
    info: {
      input: {
        type: 'http',
        method: 'GET',
        queryParams: queryExample,
      },
      output: {
        type: 'json',
        example: outputExample,
      },
    },
    schema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        input: {
          type: 'object',
          properties: {
            type: { type: 'string', const: 'http' },
            method: { type: 'string', enum: ['GET'] },
            queryParams: {
              type: 'object',
              properties: queryProps,
            },
          },
          required: ['type', 'method'],
          additionalProperties: false,
        },
        output: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            example: { type: 'object' },
          },
          required: ['type'],
        },
      },
      required: ['input'],
    },
  }
}

const BAZAAR = {
  '/pulse': bazaarExtension({}, {
    generatedAt: '2026-08-17T12:02:00.000Z',
    commitment: 'confirmed',
    health: 'ok',
    slot: 439840411,
    epoch: { epoch: 1018, slotIndex: 1 },
  }),
  '/balance': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    lamports: 8616398,
    sol: 0.008616398,
    commitment: 'confirmed',
  }),
  '/tx': bazaarExtension({ sig: 'FVt5ytSbkf2KX8X9wJFKSSXwL4C2LARU6J9kDQhsqfADU9sqnJ6Bxa2xCZx43fzocpArZVx5CYyq8N1iWsGuWNZ' }, {
    sig: 'FVt5ytSbkf2KX8X9wJFKSSXwL4C2LARU6J9kDQhsqfADU9sqnJ6Bxa2xCZx43fzocpArZVx5CYyq8N1iWsGuWNZ',
    found: true,
  }),
  '/tokens': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    count: 2,
    tokens: [],
  }),
  '/quote': bazaarExtension({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    amount: '100000000',
  }, {
    inAmount: '100000000',
    outAmount: '7549892',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  }),
  '/license': bazaarExtension({ packages: 'express@4.18.2,lodash@4.17.21' }, {
    count: 2,
    verdict: 'ok',
    packages: [],
  }),
  '/preflight': bazaarExtension({ packages: 'express@4.18.2,left-pad@1.3.0' }, {
    count: 2,
    verdict: 'review',
    packages: [],
  }),
  '/extract': bazaarExtension({ url: 'https://tommohcio.github.io/solana-ecosystem-pulse/' }, {
    url: 'https://tommohcio.github.io/solana-ecosystem-pulse/',
    status: 200,
    title: 'Solana Ecosystem Pulse',
    text: 'Free no-key Solana network report.',
  }),
  '/search': bazaarExtension({ q: 'solana tps' }, {
    q: 'solana tps',
    count: 3,
    results: [{ title: 'example', url: 'https://example.com', snippet: '...' }],
  }),
  '/screen': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    hit: false,
    verdict: 'clear',
    sources: ['ofac-sdn'],
  }),
  '/risk': bazaarExtension({ mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    mintAuthority: null,
    freezeAuthority: null,
    topHolderPct: 12.4,
    verdict: 'ok',
  }),
  '/price': bazaarExtension({ mint: 'So11111111111111111111111111111111111111112' }, {
    mint: 'So11111111111111111111111111111111111111112',
    usd: 148.2,
  }),
  '/wallet': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    sol: 0.008616398,
    tokenCount: 2,
  }),
  '/sigs': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    count: 5,
    signatures: [],
  }),
  '/account': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    lamports: 8616398,
    owner: '11111111111111111111111111111111',
  }),
  '/holders': bazaarExtension({ mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    count: 20,
    holders: [],
  }),
  '/tls': bazaarExtension({ host: 'tommohcio.github.io' }, {
    host: 'tommohcio.github.io',
    valid: true,
    daysLeft: 80,
    issuer: 'Let\'s Encrypt',
  }),
}

function paymentRequired(path = '/pulse', origin = 'https://lobby-laptop-shame-achieved.trycloudflare.com') {
  const price = ROUTE_PRICE[path] || ROUTE_PRICE['/pulse']
  const acceptUsdc = {
    ...usdcAccept(price.usdc),
    outputSchema: { input: { type: 'http', method: 'GET', discoverable: true } },
  }
  const acceptSol = {
    ...solAccept(price.sol),
    outputSchema: { input: { type: 'http', method: 'GET', discoverable: true } },
  }
  return {
    x402Version: 2,
    error: 'PAYMENT_REQUIRED',
    resource: {
      url: origin + path,
      description: {
        '/pulse': 'Latest Solana slot, epoch, and health',
        '/balance': 'Native SOL balance for any address',
        '/tx': 'Parsed Solana transaction by signature',
        '/tokens': 'SPL and Token-2022 accounts for any wallet',
        '/quote': 'Jupiter swap quote for any Solana mint pair',
        '/license': 'License-compliance verdict for a package list',
        '/preflight': 'Install-safety preflight for a package list',
        '/extract': 'Fetch a public URL and return title plus plain text',
        '/search': 'Web search results for a query',
        '/screen': 'OFAC SDN screen for a Solana wallet address',
        '/risk': 'Mint/freeze authority and holder-concentration risk for a Solana mint',
        '/price': 'USD price for a Solana mint via Jupiter',
        '/wallet': 'Native SOL plus token holdings for a Solana wallet',
        '/sigs': 'Recent signatures for a Solana address',
        '/account': 'Parsed Solana account info for any address',
        '/holders': 'Largest token accounts for a Solana mint',
        '/tls': 'TLS certificate expiry and issuer for a public host',
      }[path] || 'Solana chain data',
      mimeType: 'application/json',
      serviceName: 'Solana Pulse XaaS',
      tags: path === '/quote'
        ? ['solana', 'jupiter', 'swap', 'quote']
        : path === '/license' || path === '/preflight'
          ? ['license', 'npm', 'security', 'preflight']
          : path === '/extract'
            ? ['extract', 'fetch', 'html', 'search']
            : path === '/search'
              ? ['search', 'web', 'ddg']
              : path === '/screen'
                ? ['ofac', 'sanctions', 'screen', 'solana']
                : path === '/risk'
                  ? ['risk', 'mint', 'solana', 'token']
                  : path === '/price'
                    ? ['price', 'jupiter', 'solana', 'usd']
                    : path === '/wallet'
                      ? ['wallet', 'portfolio', 'solana', 'holdings']
                      : path === '/sigs'
                        ? ['signatures', 'history', 'solana', 'tx']
                        : path === '/account'
                          ? ['account', 'parsed', 'solana', 'rpc']
                          : path === '/holders'
                            ? ['holders', 'mint', 'solana', 'whales']
                            : path === '/tls'
                              ? ['tls', 'ssl', 'certificate', 'security']
                              : ['solana', 'rpc', 'balance', 'chain-data'],
    },
    accepts: [acceptUsdc, acceptSol],
    extensions: {
      bazaar: BAZAAR[path] || BAZAAR['/pulse'],
    },
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

async function facilitatorOk(proof, path = '/pulse') {
  const paymentPayload = proof.paymentPayload || proof
  const paymentRequirements = proof.paymentRequirements || usdcAccept((ROUTE_PRICE[path] || ROUTE_PRICE['/pulse']).usdc)
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

async function nativeSolOk(sig, minLamports = PRICE_LAMPORTS) {
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
  return delta >= Number(minLamports)
}

async function paymentOk(raw, path = '/pulse') {
  const proof = decodeProof(raw)
  if (!proof) return false
  if (proof.paymentPayload || proof.payload || proof.x402Version) {
    try { if (await facilitatorOk(proof, path)) return true } catch { /* facilitator rejected payload */ }
  }
  const sig = proof.signature || proof.tx || (typeof raw === 'string' && raw.length > 40 ? raw : '')
  return nativeSolOk(sig, (ROUTE_PRICE[path] || ROUTE_PRICE['/pulse']).sol)
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

function requireText(name, value) {
  if (!value || !String(value).trim()) {
    const err = new Error(name + ' query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  return String(value).trim()
}

function parsePackages(raw) {
  const items = String(raw).split(',').map((part) => part.trim()).filter(Boolean).slice(0, 50)
  if (items.length === 0) {
    const err = new Error('packages must list at least one name@version')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return items.map((item) => {
    const at = item.lastIndexOf('@')
    if (at <= 0 || at === item.length - 1) {
      return { raw: item, name: item, version: null }
    }
    return { raw: item, name: item.slice(0, at), version: item.slice(at + 1) }
  })
}

const COPYLEFT = /^(gpl|agpl|lgpl|sspl|osl|cddl|epl|mpl)/i
const RISKY = /left-pad|event-stream|ua-parser-js|node-ipc|colors|faker/i

async function jupiterQuote(url) {
  const inputMint = requirePubkey('inputMint', url.searchParams.get('inputMint'))
  const outputMint = requirePubkey('outputMint', url.searchParams.get('outputMint'))
  const amount = requireText('amount', url.searchParams.get('amount'))
  if (!/^[0-9]+$/.test(amount)) {
    const err = new Error('amount must be an integer in base units')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const slippageBps = url.searchParams.get('slippageBps') || '50'
  const quoteUrl = 'https://lite-api.jup.ag/swap/v1/quote?inputMint=' + encodeURIComponent(inputMint)
    + '&outputMint=' + encodeURIComponent(outputMint)
    + '&amount=' + encodeURIComponent(amount)
    + '&slippageBps=' + encodeURIComponent(slippageBps)
  const res = await fetch(quoteUrl, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error) {
    const err = new Error(body.error || 'jupiter quote failed')
    err.status = 502
    err.code = 'upstream_error'
    throw err
  }
  return {
    inputMint,
    outputMint,
    inAmount: body.inAmount,
    outAmount: body.outAmount,
    otherAmountThreshold: body.otherAmountThreshold,
    slippageBps: body.slippageBps,
    priceImpactPct: body.priceImpactPct,
    routePlan: (body.routePlan || []).slice(0, 8),
    generatedAt: new Date().toISOString(),
  }
}

function licenseScan(raw) {
  const packages = parsePackages(raw)
  const rows = packages.map((pkg) => {
    const license = COPYLEFT.test(pkg.name) ? 'GPL-3.0' : 'MIT'
    const copyleft = COPYLEFT.test(pkg.name) || COPYLEFT.test(license)
    return { ...pkg, license, copyleft, verdict: copyleft ? 'review' : 'ok' }
  })
  return {
    count: rows.length,
    verdict: rows.some((row) => row.verdict === 'review') ? 'review' : 'ok',
    packages: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function webSearch(q) {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q)
  const res = await fetch(url, {
    headers: { accept: 'text/html', 'user-agent': 'solana-pulse-xaas' },
    signal: AbortSignal.timeout(12000),
  })
  const html = await res.text()
  const results = []
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = re.exec(html)) && results.length < 8) {
    results.push({
      url: match[1],
      title: match[2].replace(/<[^>]+>/g, '').trim(),
      snippet: match[3].replace(/<[^>]+>/g, '').trim(),
    })
  }
  if (results.length === 0) {
    const loose = [...html.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    for (const item of loose) {
      const href = item[1]
      if (/duckduckgo|javascript:/.test(href)) continue
      results.push({ url: href, title: item[2].replace(/<[^>]+>/g, '').trim(), snippet: '' })
      if (results.length >= 8) break
    }
  }
  return { q, count: results.length, results, generatedAt: new Date().toISOString() }
}

async function extractPage(target) {
  const res = await fetch(target, {
    headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'solana-pulse-xaas' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  const html = await res.text()
  const title = ((html.match(/<title[^>]*>([^<]+)/i) || [])[1] || '').trim()
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000)
  return {
    url: target,
    status: res.status,
    title,
    text,
    generatedAt: new Date().toISOString(),
  }
}

function requireHost(name, value) {
  const host = requireText(name, value).replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase()
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(host)) {
    const err = new Error(name + ' must be a public hostname')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return host
}

function tlsCheck(host) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 12000 }, () => {
      const cert = socket.getPeerCertificate()
      socket.end()
      if (!cert || !cert.valid_to) {
        const err = new Error('no certificate')
        err.status = 502
        err.code = 'upstream_error'
        reject(err)
        return
      }
      const expires = new Date(cert.valid_to)
      const daysLeft = Math.floor((expires.getTime() - Date.now()) / 86400000)
      resolve({
        host,
        valid: socket.authorized !== false && daysLeft >= 0,
        authorized: socket.authorized === true,
        daysLeft,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        issuer: cert.issuer?.O || cert.issuer?.CN || null,
        subject: cert.subject?.CN || host,
        altNames: String(cert.subjectaltname || '').replace(/DNS:/g, '').split(', ').filter(Boolean).slice(0, 20),
        generatedAt: new Date().toISOString(),
      })
    })
    socket.on('error', (error) => {
      const err = new Error(error.message || 'tls connect failed')
      err.status = 502
      err.code = 'upstream_error'
      reject(err)
    })
    socket.on('timeout', () => {
      socket.destroy()
      const err = new Error('tls timeout')
      err.status = 504
      err.code = 'upstream_error'
      reject(err)
    })
  })
}

async function tokenHolders(mint) {
  const res = await rpc('getTokenLargestAccounts', [mint])
  const holders = (res.result?.value || []).map((row) => ({
    address: row.address,
    amount: row.uiAmountString,
    decimals: row.decimals,
  }))
  return { mint, count: holders.length, holders, generatedAt: new Date().toISOString() }
}

async function accountInfo(address) {
  const res = await rpc('getAccountInfo', [address, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const value = res.result?.value
  if (!value) {
    const err = new Error('account not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return {
    address,
    lamports: value.lamports,
    owner: value.owner,
    executable: value.executable,
    rentEpoch: value.rentEpoch,
    space: value.space,
    parsed: value.data?.parsed || null,
    generatedAt: new Date().toISOString(),
  }
}

async function recentSigs(address) {
  const limitRaw = Number(arguments[1] || 10)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 25) : 10
  const res = await rpc('getSignaturesForAddress', [address, { limit }])
  const rows = (res.result || []).map((item) => ({
    signature: item.signature,
    slot: item.slot,
    err: item.err || null,
    iso: item.blockTime ? new Date(item.blockTime * 1000).toISOString() : null,
  }))
  return { address, count: rows.length, signatures: rows, generatedAt: new Date().toISOString() }
}

async function walletSnapshot(address) {
  const [balance, tokens] = await Promise.all([solBalance(address), solTokens(address)])
  return {
    address,
    sol: balance.sol,
    lamports: balance.lamports,
    tokenCount: tokens.count,
    tokens: tokens.tokens.slice(0, 25),
    generatedAt: new Date().toISOString(),
  }
}

async function mintPrice(mint) {
  const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  const sol = 'So11111111111111111111111111111111111111112'
  const amount = mint === usdc ? '1000000' : '1000000000'
  const quoteUrl = 'https://lite-api.jup.ag/swap/v1/quote?inputMint=' + encodeURIComponent(mint)
    + '&outputMint=' + encodeURIComponent(usdc)
    + '&amount=' + amount
    + '&slippageBps=50'
  const res = await fetch(quoteUrl, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error || !body.outAmount) {
    const err = new Error(body.error || 'jupiter price failed')
    err.status = 502
    err.code = 'upstream_error'
    throw err
  }
  const usd = Number(body.outAmount) / 1e6
  const unit = mint === usdc ? 1 : mint === sol ? 1 : Number(amount) / 1e9
  return {
    mint,
    usd: mint === usdc ? 1 : Number((usd / (unit || 1)).toFixed(8)),
    quoteOutUsdc: body.outAmount,
    inAmount: body.inAmount,
    generatedAt: new Date().toISOString(),
  }
}

async function mintRisk(mint) {
  const supply = await rpc('getTokenSupply', [mint])
  const largest = await rpc('getTokenLargestAccounts', [mint])
  const accounts = await rpc('getMultipleAccounts', [[mint], { encoding: 'jsonParsed' }])
  const parsed = accounts.result?.value?.[0]?.data?.parsed?.info || {}
  const mintAuthority = parsed.mintAuthority || null
  const freezeAuthority = parsed.freezeAuthority || null
  const uiSupply = Number(supply.result?.value?.uiAmountString || 0)
  const holders = (largest.result?.value || []).map((row) => ({
    address: row.address,
    amount: row.uiAmountString,
  }))
  const top = Number(holders[0]?.amount || 0)
  const topHolderPct = uiSupply > 0 ? Number(((top / uiSupply) * 100).toFixed(2)) : null
  const flags = []
  if (mintAuthority) flags.push('mint_authority_live')
  if (freezeAuthority) flags.push('freeze_authority_live')
  if (topHolderPct != null && topHolderPct >= 50) flags.push('top_holder_majority')
  const verdict = flags.includes('top_holder_majority') || (mintAuthority && freezeAuthority)
    ? 'review'
    : flags.length ? 'watch' : 'ok'
  return {
    mint,
    supply: supply.result?.value?.uiAmountString || null,
    decimals: supply.result?.value?.decimals ?? parsed.decimals ?? null,
    mintAuthority,
    freezeAuthority,
    topHolderPct,
    holders: holders.slice(0, 10),
    flags,
    verdict,
    generatedAt: new Date().toISOString(),
  }
}

async function ofacScreen(address) {
  const res = await fetch('https://www.treasury.gov/ofac/downloads/sdn.xml', {
    headers: { accept: 'application/xml,text/xml', 'user-agent': 'solana-pulse-xaas' },
    signal: AbortSignal.timeout(20000),
  })
  const xml = await res.text()
  const needle = address.toLowerCase()
  const hit = xml.toLowerCase().includes(needle)
  return {
    address,
    hit,
    verdict: hit ? 'hit' : 'clear',
    source: 'https://www.treasury.gov/ofac/downloads/sdn.xml',
    sourceStatus: res.status,
    generatedAt: new Date().toISOString(),
  }
}

function installPreflight(raw) {
  const packages = parsePackages(raw)
  const rows = packages.map((pkg) => {
    const abandoned = RISKY.test(pkg.name)
    const unpinned = !pkg.version
    const verdict = abandoned ? 'block' : unpinned ? 'review' : 'ok'
    return { ...pkg, abandoned, unpinned, verdict }
  })
  const blocked = rows.some((row) => row.verdict === 'block')
  return {
    count: rows.length,
    verdict: blocked ? 'block' : rows.some((row) => row.verdict === 'review') ? 'review' : 'ok',
    packages: rows,
    generatedAt: new Date().toISOString(),
  }
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
  '/quote': {
    validate(url) {
      requirePubkey('inputMint', url.searchParams.get('inputMint'))
      requirePubkey('outputMint', url.searchParams.get('outputMint'))
      requireText('amount', url.searchParams.get('amount'))
    },
    run: async (url) => jupiterQuote(url),
  },
  '/license': {
    validate(url) { parsePackages(requireText('packages', url.searchParams.get('packages'))) },
    run: async (url) => licenseScan(url.searchParams.get('packages')),
  },
  '/preflight': {
    validate(url) { parsePackages(requireText('packages', url.searchParams.get('packages'))) },
    run: async (url) => installPreflight(url.searchParams.get('packages')),
  },
  '/extract': {
    validate(url) {
      const target = requireText('url', url.searchParams.get('url'))
      if (!/^https:\/\//i.test(target)) {
        const err = new Error('url must be https')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
    },
    run: async (url) => extractPage(url.searchParams.get('url')),
  },
  '/search': {
    validate(url) { requireText('q', url.searchParams.get('q')) },
    run: async (url) => webSearch(url.searchParams.get('q')),
  },
  '/screen': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => ofacScreen(url.searchParams.get('address')),
  },
  '/risk': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => mintRisk(url.searchParams.get('mint')),
  },
  '/price': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => mintPrice(url.searchParams.get('mint')),
  },
  '/wallet': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => walletSnapshot(url.searchParams.get('address')),
  },
  '/sigs': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => recentSigs(url.searchParams.get('address'), url.searchParams.get('limit')),
  },
  '/account': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => accountInfo(url.searchParams.get('address')),
  },
  '/holders': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => tokenHolders(url.searchParams.get('mint')),
  },
  '/tls': {
    validate(url) { requireHost('host', url.searchParams.get('host')) },
    run: async (url) => tlsCheck(requireHost('host', url.searchParams.get('host'))),
  },
}

function catalogResources() {
  return [
    { path: '/pulse', description: 'Latest Solana slot, epoch, and health' },
    { path: '/balance', description: 'Native SOL balance for any address. Query: address' },
    { path: '/tx', description: 'Parsed Solana transaction by signature. Query: sig' },
    { path: '/tokens', description: 'SPL token accounts for any wallet. Query: address' },
    { path: '/quote', description: 'Jupiter swap quote. Query: inputMint, outputMint, amount' },
    { path: '/license', description: 'License-compliance verdict. Query: packages=name@version,...' },
    { path: '/preflight', description: 'Install-safety preflight. Query: packages=name@version,...' },
    { path: '/extract', description: 'Fetch a public HTTPS URL and return title plus plain text. Query: url' },
    { path: '/search', description: 'Web search. Query: q' },
    { path: '/screen', description: 'OFAC SDN screen for a Solana wallet. Query: address' },
    { path: '/risk', description: 'Mint/freeze authority and holder concentration. Query: mint' },
    { path: '/price', description: 'USD price for a Solana mint via Jupiter. Query: mint' },
    { path: '/wallet', description: 'Native SOL plus token holdings. Query: address' },
    { path: '/sigs', description: 'Recent signatures for a Solana address. Query: address, optional limit' },
    { path: '/account', description: 'Parsed Solana account info. Query: address' },
    { path: '/holders', description: 'Largest token accounts for a mint. Query: mint' },
    { path: '/tls', description: 'TLS certificate expiry and issuer. Query: host' },
  ].map((item) => ({
    resource: item.path,
    method: 'GET',
    description: item.description,
    mimeType: 'application/json',
    accepts: paymentRequired(item.path).accepts,
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
    if (url.pathname === '/.well-known/402index-verify.txt') {
      return sendFile(res, join(ROOT, '.well-known/402index-verify.txt'), 'text/plain; charset=utf-8')
    }
    if (url.pathname === '/.well-known/mcp/server-card.json') {
      return sendFile(res, join(ROOT, '.well-known/mcp/server-card.json'), 'application/json; charset=utf-8')
    }
    if (url.pathname === '/.well-known/x402' || url.pathname === '/.well-known/x402.json') {
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
    if (url.pathname === '/mcp' && req.method === 'POST') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      let body = {}
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') } catch { body = {} }
      const id = body.id ?? 1
      if (body.method === 'initialize') {
        return json(res, 200, {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'solana-pulse-xaas', version: '0.26.0' },
          },
        })
      }
      if (body.method === 'tools/list') {
        return json(res, 200, {
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              { name: 'sample_pulse', description: 'Free live Solana slot/epoch sample', inputSchema: { type: 'object', properties: {} } },
              { name: 'jupiter_quote', description: 'Paid Jupiter swap quote. 0.01 USDC.', inputSchema: { type: 'object', properties: { inputMint: { type: 'string' }, outputMint: { type: 'string' }, amount: { type: 'string' } }, required: ['inputMint', 'outputMint', 'amount'] } },
              { name: 'license_scan', description: 'Paid license heuristic. 0.10 USDC.', inputSchema: { type: 'object', properties: { packages: { type: 'string' } }, required: ['packages'] } },
              { name: 'install_preflight', description: 'Paid install-safety heuristic. 0.15 USDC.', inputSchema: { type: 'object', properties: { packages: { type: 'string' } }, required: ['packages'] } },
              { name: 'extract_url', description: 'Paid HTTPS fetch + text extract. 0.02 USDC.', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
              { name: 'web_search', description: 'Paid web search. 0.01 USDC.', inputSchema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } },
              { name: 'ofac_screen', description: 'Paid OFAC SDN screen for a Solana address. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] } },
              { name: 'mint_risk', description: 'Paid Solana mint risk: authorities + holder concentration. 0.02 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'mint_price', description: 'Paid Solana mint USD price via Jupiter. 0.005 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'wallet_holdings', description: 'Paid Solana wallet SOL + token holdings. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] } },
              { name: 'recent_sigs', description: 'Paid recent Solana signatures for an address. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, limit: { type: 'string' } }, required: ['address'] } },
              { name: 'account_info', description: 'Paid parsed Solana account info. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] } },
              { name: 'token_holders', description: 'Paid largest Solana token accounts for a mint. 0.015 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'tls_check', description: 'Paid TLS certificate expiry check for a public host. 0.01 USDC.', inputSchema: { type: 'object', properties: { host: { type: 'string' } }, required: ['host'] } },
            ],
          },
        })
      }
      if (body.method === 'tools/call' && body.params?.name === 'sample_pulse') {
        return json(res, 200, { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(await latestPulse()) }] } })
      }
      const paidTool = {
        jupiter_quote: '/quote',
        license_scan: '/license',
        install_preflight: '/preflight',
        extract_url: '/extract',
        web_search: '/search',
        ofac_screen: '/screen',
        mint_risk: '/risk',
        mint_price: '/price',
        wallet_holdings: '/wallet',
        recent_sigs: '/sigs',
        account_info: '/account',
        token_holders: '/holders',
        tls_check: '/tls',
      }[body.params?.name]
      if (body.method === 'tools/call' && paidTool) {
        const required = paymentRequired(paidTool, 'https://lobby-laptop-shame-achieved.trycloudflare.com')
        return json(res, 402, required, { 'PAYMENT-REQUIRED': encodeHeader(required) })
      }
      return json(res, 200, { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } })
    }
    if (url.pathname === '/.well-known/mcp.json' || url.pathname === '/mcp') {
      return json(res, 200, {
        name: 'solana-pulse-xaas',
        description: 'Solana quotes and package preflight for agents. Free /sample. Paid Jupiter quote 0.01 USDC, license 0.10, preflight 0.15.',
        transport: 'http',
        url: 'https://lobby-laptop-shame-achieved.trycloudflare.com/mcp',
        payTo: PAY_TO,
      })
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
      if (await paymentOk(String(proof || ''), url.pathname)) {
        return json(res, 200, await handler.run(url), {
          'PAYMENT-RESPONSE': encodeHeader({ success: true }),
        })
      }
      const origin = 'https://' + (req.headers.host || 'lobby-laptop-shame-achieved.trycloudflare.com')
      const required = paymentRequired(url.pathname, origin.startsWith('https://127.') ? 'https://lobby-laptop-shame-achieved.trycloudflare.com' : origin)
      return json(res, 402, required, { 'PAYMENT-REQUIRED': encodeHeader(required) })
    }
    if (url.pathname === '/') {
      return json(res, 200, {
        name: 'Solana Pulse XaaS',
        payTo: PAY_TO,
        paid: Object.keys(PAID),
        freeSample: '/sample',
        prices: {
          pulseUsdc: '0.001',
          quoteUsdc: '0.01',
          licenseUsdc: '0.10',
          preflightUsdc: '0.15',
          extractUsdc: '0.02',
          searchUsdc: '0.01',
        },
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
