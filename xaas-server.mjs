import { createHash } from 'node:crypto'
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
  '/fresh': { usdc: '5000', sol: '5000000' },
  '/tz': { usdc: '5000', sol: '5000000' },
  '/units': { usdc: '5000', sol: '5000000' },
  '/isbn': { usdc: '3000', sol: '3000000' },
  '/semver': { usdc: '3000', sol: '3000000' },
  '/mime': { usdc: '3000', sol: '3000000' },
  '/lang': { usdc: '3000', sol: '3000000' },
  '/slug': { usdc: '2000', sol: '2000000' },
  '/fees': { usdc: '10000', sol: '10000000' },
  '/supply': { usdc: '10000', sol: '10000000' },
  '/tax': { usdc: '15000', sol: '15000000' },
  '/tps': { usdc: '10000', sol: '10000000' },
  '/rent': { usdc: '10000', sol: '10000000' },
  '/inflation': { usdc: '10000', sol: '10000000' },
  '/circ': { usdc: '10000', sol: '10000000' },
  '/votes': { usdc: '10000', sol: '10000000' },
  '/whales': { usdc: '15000', sol: '15000000' },
  '/blocks': { usdc: '10000', sol: '10000000' },
  '/nodes': { usdc: '10000', sol: '10000000' },
  '/ver': { usdc: '5000', sol: '5000000' },
  '/nid': { usdc: '5000', sol: '5000000' },
  '/ok': { usdc: '5000', sol: '5000000' },
  '/gen': { usdc: '5000', sol: '5000000' },
  '/epoch': { usdc: '5000', sol: '5000000' },
  '/slot': { usdc: '5000', sol: '5000000' },
  '/bh': { usdc: '5000', sol: '5000000' },
  '/ht': { usdc: '5000', sol: '5000000' },
  '/txc': { usdc: '5000', sol: '5000000' },
  '/ldr': { usdc: '5000', sol: '5000000' },
  '/fab': { usdc: '5000', sol: '5000000' },
  '/snap': { usdc: '5000', sol: '5000000' },
  '/rtx': { usdc: '5000', sol: '5000000' },
  '/shred': { usdc: '5000', sol: '5000000' },
  '/epi': { usdc: '5000', sol: '5000000' },
  '/gov': { usdc: '5000', sol: '5000000' },
  '/valid': { usdc: '5000', sol: '5000000' },
  '/sched': { usdc: '5000', sol: '5000000' },
  '/reward': { usdc: '10000', sol: '10000000' },
  '/btime': { usdc: '5000', sol: '5000000' },
  '/batch': { usdc: '10000', sol: '10000000' },
  '/tab': { usdc: '5000', sol: '5000000' },
  '/blks': { usdc: '5000', sol: '5000000' },
  '/stat': { usdc: '5000', sol: '5000000' },
  '/cmt': { usdc: '5000', sol: '5000000' },
  '/ldrs': { usdc: '5000', sol: '5000000' },
  '/blk': { usdc: '10000', sol: '10000000' },
  '/blim': { usdc: '5000', sol: '5000000' },
  '/smin': { usdc: '5000', sol: '5000000' },
  '/mls': { usdc: '5000', sol: '5000000' },
  '/delg': { usdc: '10000', sol: '10000000' },
  '/alt': { usdc: '10000', sol: '10000000' },
  '/gpa': { usdc: '15000', sol: '15000000' },
  '/ffm': { usdc: '10000', sol: '10000000' },
  '/sim': { usdc: '15000', sol: '15000000' },
  '/nce': { usdc: '10000', sol: '10000000' },
  '/brw': { usdc: '10000', sol: '10000000' },
  '/xfer': { usdc: '15000', sol: '15000000' },
  '/own': { usdc: '10000', sol: '10000000' },
  '/hist': { usdc: '10000', sol: '10000000' },
  '/stk': { usdc: '10000', sol: '10000000' },
  '/vac': { usdc: '10000', sol: '10000000' },
  '/mdt': { usdc: '10000', sol: '10000000' },
  '/ata': { usdc: '10000', sol: '10000000' },
  '/jts': { usdc: '10000', sol: '10000000' },
  '/gpm': { usdc: '15000', sol: '15000000' },
  '/logs': { usdc: '10000', sol: '10000000' },
  '/pda': { usdc: '10000', sol: '10000000' },
  '/curv': { usdc: '5000', sol: '5000000' },
  '/cpi': { usdc: '10000', sol: '10000000' },
  '/lfee': { usdc: '10000', sol: '10000000' },
  '/until': { usdc: '10000', sol: '10000000' },
  '/t22': { usdc: '10000', sol: '10000000' },
  '/circw': { usdc: '15000', sol: '15000000' },
  '/ldad': { usdc: '10000', sol: '10000000' },
  '/tpu': { usdc: '10000', sol: '10000000' },
  '/ncw': { usdc: '15000', sol: '15000000' },
  '/bpid': { usdc: '10000', sol: '10000000' },
  '/rewe': { usdc: '10000', sol: '10000000' },
  '/lsid': { usdc: '10000', sol: '10000000' },
  '/mcs': { usdc: '10000', sol: '10000000' },
  '/aslc': { usdc: '10000', sol: '10000000' },
  '/mslc': { usdc: '10000', sol: '10000000' },
  '/gpsl': { usdc: '15000', sol: '15000000' },
  '/blkt': { usdc: '10000', sol: '10000000' },
  '/vdel': { usdc: '10000', sol: '10000000' },
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
  '/fresh': bazaarExtension({ url: 'https://tommohcio.github.io/solana-ecosystem-pulse/' }, {
    url: 'https://tommohcio.github.io/solana-ecosystem-pulse/',
    status: 200,
    sha256: '0'.repeat(64),
  }),
  '/tz': bazaarExtension({ iso: '2026-08-17T13:00:00Z', to: 'Europe/Rome' }, {
    iso: '2026-08-17T13:00:00.000Z',
    to: 'Europe/Rome',
    local: '2026-08-17 15:00:00',
    offset: '+02:00',
  }),
  '/units': bazaarExtension({ value: '1', from: 'km', to: 'mi' }, {
    value: 1,
    from: 'km',
    to: 'mi',
    result: 0.621371,
  }),
  '/isbn': bazaarExtension({ isbn: '9780306406157' }, {
    isbn: '9780306406157',
    valid: true,
    isbn13: '9780306406157',
  }),
  '/semver': bazaarExtension({ a: '1.2.3', b: '1.3.0' }, {
    a: '1.2.3',
    b: '1.3.0',
    cmp: -1,
  }),
  '/mime': bazaarExtension({ ext: 'pdf' }, {
    ext: 'pdf',
    mime: 'application/pdf',
  }),
  '/lang': bazaarExtension({ code: 'it' }, {
    code: 'it',
    name: 'Italian',
    iso6391: 'it',
  }),
  '/slug': bazaarExtension({ text: 'Solana Pulse XaaS' }, {
    text: 'Solana Pulse XaaS',
    slug: 'solana-pulse-xaas',
  }),
  '/fees': bazaarExtension({}, {
    median: 1000,
    p90: 50000,
    samples: 150,
  }),
  '/supply': bazaarExtension({ mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    uiAmount: '1000000000',
    decimals: 6,
  }),
  '/tax': bazaarExtension({ mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    transferFeeBps: 0,
    token2022: false,
  }),
  '/tps': bazaarExtension({}, {
    tps: 2500,
    samples: 5,
  }),
  '/rent': bazaarExtension({ space: '165' }, {
    space: 165,
    lamports: 2039280,
  }),
  '/inflation': bazaarExtension({}, {
    total: 0.05,
    validator: 0.047,
    foundation: 0.003,
    epoch: 800,
  }),
  '/circ': bazaarExtension({}, {
    circulating: 500000000,
    total: 580000000,
    nonCirculating: 80000000,
  }),
  '/votes': bazaarExtension({}, {
    current: 900,
    delinquent: 20,
  }),
  '/whales': bazaarExtension({}, {
    count: 20,
    accounts: [],
  }),
  '/blocks': bazaarExtension({}, {
    slotIndex: 432000,
    slotsInEpoch: 432000,
    skipRate: 0.02,
  }),
  '/nodes': bazaarExtension({}, {
    count: 1800,
    rpc: 400,
    gossip: 1800,
  }),
  '/ver': bazaarExtension({}, {
    'solana-core': '2.1.0',
    'feature-set': 0,
  }),
  '/nid': bazaarExtension({}, {
    identity: '11111111111111111111111111111111',
  }),
  '/ok': bazaarExtension({}, {
    healthy: true,
  }),
  '/gen': bazaarExtension({}, {
    genesisHash: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  }),
  '/epoch': bazaarExtension({}, {
    slotsPerEpoch: 432000,
    leaderScheduleSlotOffset: 432000,
    warmup: false,
    firstNormalEpoch: 0,
    firstNormalSlot: 0,
  }),
  '/slot': bazaarExtension({}, {
    slot: 439000000,
  }),
  '/bh': bazaarExtension({}, {
    blockhash: '11111111111111111111111111111111',
    lastValidBlockHeight: 1,
  }),
  '/ht': bazaarExtension({}, {
    blockHeight: 250000000,
  }),
  '/txc': bazaarExtension({}, {
    transactionCount: 400000000000,
  }),
  '/ldr': bazaarExtension({}, {
    identity: '11111111111111111111111111111111',
  }),
  '/fab': bazaarExtension({}, {
    firstAvailableBlock: 0,
  }),
  '/snap': bazaarExtension({}, {
    full: 439000000,
    incremental: 439000100,
  }),
  '/rtx': bazaarExtension({}, {
    slot: 439000000,
  }),
  '/shred': bazaarExtension({}, {
    slot: 439000000,
  }),
  '/epi': bazaarExtension({}, {
    epoch: 800,
    slotIndex: 100000,
    slotsInEpoch: 432000,
    absoluteSlot: 439000000,
    blockHeight: 250000000,
    transactionCount: 400000000000,
  }),
  '/gov': bazaarExtension({}, {
    initial: 0.08,
    terminal: 0.015,
    taper: 0.15,
    foundation: 0.05,
    foundationTerm: 7,
  }),
  '/valid': bazaarExtension({ blockhash: '11111111111111111111111111111111' }, {
    blockhash: '11111111111111111111111111111111',
    valid: false,
  }),
  '/sched': bazaarExtension({}, {
    leaders: 1200,
    slotsAssigned: 432000,
    topSlots: 2000,
  }),
  '/reward': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    amount: 0,
    epoch: 800,
  }),
  '/btime': bazaarExtension({ slot: '439000000' }, {
    slot: 439000000,
    unix: 1755430000,
    iso: '2026-08-17T12:00:00.000Z',
  }),
  '/batch': bazaarExtension({ addresses: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    count: 1,
    found: 1,
    accounts: [],
  }),
  '/tab': bazaarExtension({ account: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    account: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    amount: '0',
    decimals: 6,
    uiAmount: '0',
  }),
  '/blks': bazaarExtension({ start: '439000000', end: '439000010' }, {
    start: 439000000,
    end: 439000010,
    count: 11,
    slots: [],
  }),
  '/stat': bazaarExtension({ sigs: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    count: 1,
    found: 0,
    statuses: [],
  }),
  '/cmt': bazaarExtension({ slot: '439000000' }, {
    slot: 439000000,
    totalStake: 0,
    committed: 0,
    samples: 0,
  }),
  '/ldrs': bazaarExtension({ start: '439000000', limit: '8' }, {
    start: 439000000,
    limit: 8,
    count: 8,
    unique: 0,
    leaders: [],
  }),
  '/blk': bazaarExtension({ slot: '439000000' }, {
    slot: 439000000,
    blockhash: '',
    blockHeight: 0,
    blockTime: 0,
    parentSlot: 0,
    txCount: 0,
    rewards: 0,
  }),
  '/blim': bazaarExtension({ start: '439000000', limit: '8' }, {
    start: 439000000,
    limit: 8,
    count: 0,
    slots: [],
  }),
  '/smin': bazaarExtension({}, {
    lamports: 0,
    sol: 0,
  }),
  '/mls': bazaarExtension({}, {
    slot: 0,
  }),
  '/delg': bazaarExtension({ delegate: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    delegate: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    count: 0,
    accounts: [],
  }),
  '/alt': bazaarExtension({ table: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    table: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA',
    authority: '',
    deactivationSlot: '0',
    lastExtendedSlot: 0,
    addressCount: 0,
    addresses: [],
  }),
  '/gpa': bazaarExtension({ program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', space: '165' }, {
    program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    space: 165,
    count: 0,
    accounts: [],
  }),
  '/ffm': bazaarExtension({ message: 'AQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9A' }, {
    lamports: 5000,
    sol: 0.000005,
  }),
  '/sim': bazaarExtension({ tx: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9A' }, {
    err: null,
    units: 0,
    logs: [],
  }),
  '/nce': bazaarExtension({ nonce: '11111111111111111111111111111111' }, {
    authority: '',
    blockhash: '',
    feeCalculator: null,
  }),
  '/brw': bazaarExtension({ slot: '439000000' }, {
    slot: 439000000,
    count: 0,
    lamports: 0,
    rewards: [],
  }),
  '/xfer': bazaarExtension({ sig: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    fee: 5000,
    sol: [],
    tokens: [],
  }),
  '/own': bazaarExtension({ owner: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    amount: '0',
    accounts: 0,
  }),
  '/hist': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', before: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    count: 0,
    before: null,
    signatures: [],
  }),
  '/stk': bazaarExtension({ stake: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    voter: '',
    activationEpoch: 0,
    deactivationEpoch: null,
    lamports: 0,
  }),
  '/vac': bazaarExtension({ vote: 'Certusm1sa411sMpV9FPqU5dXAYhmmhygvxJ23S6hJ24' }, {
    commission: 0,
    activatedStake: 0,
    delinquent: false,
  }),
  '/mdt': bazaarExtension({ mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    supply: '0',
  }),
  '/ata': bazaarExtension({ owner: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' }, {
    ata: '',
    exists: false,
    lamports: 0,
  }),
  '/jts': bazaarExtension({ q: 'USDC' }, {
    query: 'USDC',
    count: 0,
    tokens: [],
  }),
  '/gpm': bazaarExtension({ program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', offset: '0', bytes: '11111111111111111111111111111111' }, {
    count: 0,
    accounts: [],
  }),
  '/logs': bazaarExtension({ sig: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    err: null,
    computeUnits: 0,
    logs: [],
  }),
  '/pda': bazaarExtension({ program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', seeds: 'metadata' }, {
    address: '',
    bump: 255,
    exists: false,
  }),
  '/curv': bazaarExtension({ key: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    onCurve: true,
    kind: 'keypair',
  }),
  '/cpi': bazaarExtension({ sig: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    err: null,
    inner: [],
  }),
  '/lfee': bazaarExtension({ accounts: '11111111111111111111111111111111' }, {
    samples: 0,
    median: 0,
  }),
  '/until': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', until: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    count: 0,
    signatures: [],
  }),
  '/t22': bazaarExtension({ owner: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA' }, {
    count: 0,
    tokens: [],
  }),
  '/circw': bazaarExtension({}, {
    count: 0,
    accounts: [],
  }),
  '/ldad': bazaarExtension({ sig: '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW' }, {
    writable: [],
    readonly: [],
  }),
  '/tpu': bazaarExtension({}, {
    count: 0,
    nodes: [],
  }),
  '/ncw': bazaarExtension({}, {
    count: 0,
    accounts: [],
  }),
  '/bpid': bazaarExtension({ identity: 'Certusm1sa411sMpV9FPqU5dXAYhmmhygvxJ23S6hJ24' }, {
    leaderSlots: 0,
    blocksProduced: 0,
  }),
  '/rewe': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', epoch: '800' }, {
    found: false,
    amount: null,
  }),
  '/lsid': bazaarExtension({ identity: 'Certusm1sa411sMpV9FPqU5dXAYhmmhygvxJ23S6hJ24' }, {
    slots: 0,
    firstSlots: [],
  }),
  '/mcs': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', slot: '439000000' }, {
    count: 0,
    signatures: [],
  }),
  '/aslc': bazaarExtension({ address: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', offset: '0', length: '32' }, {
    found: false,
    data: null,
  }),
  '/mslc': bazaarExtension({ addresses: '4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA', offset: '0', length: '32' }, {
    count: 0,
    accounts: [],
  }),
  '/gpsl': bazaarExtension({ program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', space: '165', offset: '0', length: '32' }, {
    count: 0,
    accounts: [],
  }),
  '/blkt': bazaarExtension({ slot: '439000000' }, {
    count: 0,
    signatures: [],
  }),
  '/vdel': bazaarExtension({}, {
    count: 0,
    delinquent: [],
  }),
}

function paymentRequired(path = '/pulse', origin = 'https://meant-aye-allan-exit.trycloudflare.com') {
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
        '/fresh': 'Timestamped content fingerprint for a public HTTPS URL',
        '/tz': 'Convert a timestamp into any IANA timezone',
        '/units': 'Convert metric and imperial units',
        '/isbn': 'Validate ISBN-10/13 and convert between formats',
        '/semver': 'Compare two SemVer versions',
        '/mime': 'Look up MIME type from a file extension',
        '/lang': 'Look up ISO 639 language code name',
        '/slug': 'Turn text into a URL slug',
        '/fees': 'Live Solana prioritization fee snapshot',
        '/supply': 'Current SPL token supply for a mint',
        '/tax': 'Token-2022 transfer-fee config for a mint',
        '/tps': 'Live Solana TPS from recent performance samples',
        '/rent': 'Minimum lamports for rent exemption by account size',
        '/inflation': 'Current Solana inflation rate',
        '/circ': 'Native SOL circulating and total supply',
        '/votes': 'Current and delinquent Solana vote-account counts',
        '/whales': 'Largest native SOL accounts',
        '/blocks': 'Current-epoch Solana block production skip rate',
        '/nodes': 'Live Solana gossip cluster node counts',
        '/ver': 'Live Solana RPC software version and feature set',
        '/nid': 'Live Solana RPC node identity pubkey',
        '/ok': 'Live Solana RPC getHealth status',
        '/gen': 'Live Solana cluster genesis hash',
        '/epoch': 'Live Solana epoch schedule parameters',
        '/slot': 'Live Solana current slot',
        '/bh': 'Live Solana latest blockhash and last valid height',
        '/ht': 'Live Solana finalized block height',
        '/txc': 'Live Solana ledger transaction count since genesis',
        '/ldr': 'Live Solana current slot leader identity',
        '/fab': 'Live Solana first available confirmed block slot',
        '/snap': 'Live Solana highest full and incremental snapshot slots',
        '/rtx': 'Live Solana max retransmit slot',
        '/shred': 'Live Solana max shred-insert slot',
        '/epi': 'Live Solana current epoch progress',
        '/gov': 'Live Solana inflation governor parameters',
        '/valid': 'Check whether a Solana blockhash is still valid',
        '/sched': 'Live Solana current-epoch leader schedule summary',
        '/reward': 'Live Solana inflation reward for a stake or vote address',
        '/btime': 'Live Solana estimated production time for a slot',
        '/batch': 'Live Solana getMultipleAccounts batch lookup',
        '/tab': 'Live Solana SPL token-account balance',
        '/blks': 'Live Solana confirmed block slots in a range',
        '/stat': 'Live Solana transaction confirmation statuses',
        '/cmt': 'Live Solana stake-weighted block commitment for a slot',
        '/ldrs': 'Live Solana slot-leader identities for a range',
        '/blk': 'Live Solana confirmed block metadata for a slot',
        '/blim': 'Live Solana confirmed block slots from a start slot',
        '/smin': 'Live Solana cluster minimum stake delegation',
        '/mls': 'Live Solana lowest slot still in this node ledger',
        '/delg': 'Live Solana SPL token accounts by approved delegate',
        '/alt': 'Live Solana address lookup table metadata',
        '/gpa': 'Live Solana size-filtered program accounts',
        '/ffm': 'Live Solana fee for a serialized transaction message',
        '/sim': 'Live Solana simulateTransaction preflight for a signed transaction',
        '/nce': 'Live Solana durable nonce account metadata',
        '/brw': 'Live Solana getBlock reward rows for a slot',
        '/xfer': 'Live Solana parsed SOL and SPL token transfers for a signature',
        '/own': 'Live Solana SPL token balance for a wallet and mint',
        '/hist': 'Live Solana paginated signatures for an address with a before cursor',
        '/stk': 'Live Solana parsed stake account delegation and authorities',
        '/vac': 'Live Solana vote-account commission identity and activated stake',
        '/mdt': 'Live Solana mint name symbol decimals supply and authorities',
        '/ata': 'Live Solana associated token account address and existence',
        '/jts': 'Live Jupiter token search by name symbol or mint',
        '/gpm': 'Live Solana getProgramAccounts filtered by memcmp',
        '/logs': 'Live Solana transaction program logs compute and error',
        '/pda': 'Live Solana program derived address and existence',
        '/curv': 'Live Solana pubkey on-curve versus PDA check',
        '/cpi': 'Live Solana parsed inner CPI instructions for a signature',
        '/lfee': 'Live Solana account-specific prioritization fees',
        '/until': 'Live Solana paginated signatures with an until cursor',
        '/t22': 'Live Solana Token-2022 accounts for a wallet',
        '/circw': 'Live Solana circulating largest native SOL accounts',
        '/ldad': 'Live Solana versioned transaction loaded addresses',
        '/tpu': 'Live Solana cluster TPU gossip and RPC endpoints',
        '/ncw': 'Live Solana non-circulating largest native SOL accounts',
        '/bpid': 'Live Solana block production for one validator identity',
        '/rewe': 'Live Solana inflation reward for a chosen epoch',
        '/lsid': 'Live Solana leader-schedule slots for one validator identity',
        '/mcs': 'Live Solana signatures after a minimum context slot',
        '/aslc': 'Live Solana account data slice by offset and length',
        '/mslc': 'Live Solana multi-account data slices by offset and length',
        '/gpsl': 'Live Solana program accounts with a sized data slice',
        '/blkt': 'Live Solana versioned block signatures for a slot',
        '/vdel': 'Live Solana delinquent vote accounts including unstaked',
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
                              : path === '/fresh'
                                ? ['freshness', 'hash', 'monitor', 'change']
                                : path === '/tz'
                                  ? ['timezone', 'convert', 'iana', 'calendar']
                                  : path === '/units'
                                    ? ['units', 'convert', 'metric', 'imperial']
                                    : path === '/isbn'
                                      ? ['isbn', 'book', 'validate', 'checksum']
                                      : path === '/semver'
                                        ? ['semver', 'version', 'compare', 'npm']
                                        : path === '/mime'
                                          ? ['mime', 'extension', 'file', 'type']
                                          : path === '/lang'
                                            ? ['language', 'iso639', 'locale', 'i18n']
                                            : path === '/slug'
                                              ? ['slug', 'url', 'seo', 'text']
                                              : path === '/fees'
                                                ? ['solana', 'fees', 'priority', 'compute']
                                                : path === '/supply'
                                                  ? ['solana', 'supply', 'mint', 'token']
                                                  : path === '/tax'
                                                    ? ['solana', 'token-2022', 'transfer-fee', 'tax']
                                                    : path === '/tps'
                                                      ? ['solana', 'tps', 'performance', 'cluster']
                                                      : path === '/rent'
                                                        ? ['solana', 'rent', 'exemption', 'account']
                                                        : path === '/inflation'
                                                          ? ['solana', 'inflation', 'staking', 'epoch']
                                                          : path === '/circ'
                                                            ? ['solana', 'circulating', 'supply', 'native']
                                                            : path === '/votes'
                                                              ? ['solana', 'validators', 'votes', 'stake']
                                                              : path === '/whales'
                                                                ? ['solana', 'whales', 'largest', 'accounts']
                                                                : path === '/blocks'
                                                                  ? ['solana', 'blocks', 'skip-rate', 'epoch']
                                                                  : path === '/nodes'
                                                                    ? ['solana', 'cluster', 'gossip', 'nodes']
                                                                    : path === '/ver'
                                                                      ? ['solana', 'version', 'feature-set', 'rpc']
                                                                      : path === '/nid'
                                                                        ? ['solana', 'identity', 'rpc', 'node']
                                                                        : path === '/ok'
                                                                          ? ['solana', 'health', 'rpc', 'cluster']
                                                                          : path === '/gen'
                                                                            ? ['solana', 'genesis', 'hash', 'cluster']
                                                                            : path === '/epoch'
                                                                              ? ['solana', 'epoch', 'schedule', 'slots']
                                                                              : path === '/slot'
                                                                                ? ['solana', 'slot', 'height', 'cluster']
                                                                                : path === '/bh'
                                                                                  ? ['solana', 'blockhash', 'latest', 'tx']
                                                                                  : path === '/ht'
                                                                                    ? ['solana', 'height', 'block', 'finalized']
                                                                                    : path === '/txc'
                                                                                      ? ['solana', 'transactions', 'count', 'ledger']
                                                                                      : path === '/ldr'
                                                                                        ? ['solana', 'leader', 'validator', 'slot']
                                                                                        : path === '/fab'
                                                                                          ? ['solana', 'ledger', 'oldest', 'block']
                                                                                          : path === '/snap'
                                                                                            ? ['solana', 'snapshot', 'full', 'incremental']
                                                                                            : path === '/rtx'
                                                                                              ? ['solana', 'retransmit', 'shred', 'slot']
                                                                                              : path === '/shred'
                                                                                                ? ['solana', 'shred', 'insert', 'blockstore']
                                                                                                : path === '/epi'
                                                                                                  ? ['solana', 'epoch', 'progress', 'slots']
                                                                                                  : path === '/gov'
                                                                                                    ? ['solana', 'inflation', 'governor', 'taper']
                                                                                                    : path === '/valid'
                                                                                                      ? ['solana', 'blockhash', 'valid', 'expiry']
                                                                                                      : path === '/sched'
                                                                                                        ? ['solana', 'leader', 'schedule', 'epoch']
                                                                                                        : path === '/reward'
                                                                                                          ? ['solana', 'inflation', 'reward', 'stake']
                                                                                                          : path === '/btime'
                                                                                                            ? ['solana', 'block', 'time', 'unix']
                                                                                                            : path === '/batch'
                                                                                                              ? ['solana', 'accounts', 'batch', 'lookup']
                                                                                                              : path === '/tab'
                                                                                                                ? ['solana', 'spl', 'token', 'balance']
                                                                                                                : path === '/blks'
                                                                                                                  ? ['solana', 'blocks', 'range', 'slots']
                                                                                                                  : path === '/stat'
                                                                                                                    ? ['solana', 'tx', 'status', 'confirm']
                                                                                                                    : path === '/cmt'
                                                                                                                      ? ['solana', 'block', 'commitment', 'stake']
                                                                                                                      : path === '/ldrs'
                                                                                                                        ? ['solana', 'slot', 'leaders', 'range']
                                                                                                                        : path === '/blk'
                                                                                                                          ? ['solana', 'block', 'metadata', 'hash']
                                                                                                                          : path === '/blim'
                                                                                                                            ? ['solana', 'blocks', 'limit', 'slots']
                                                                                                                            : path === '/smin'
                                                                                                                              ? ['solana', 'stake', 'minimum', 'delegation']
                                                                                                                              : path === '/mls'
                                                                                                                                ? ['solana', 'ledger', 'minimum', 'slot']
                                                                                                                                : path === '/delg'
                                                                                                                                  ? ['solana', 'token', 'delegate', 'accounts']
                                                                                                                                  : path === '/alt'
                                                                                                                                    ? ['solana', 'lookup', 'table', 'alt']
                                                                                                                                    : path === '/gpa'
                                                                                                                                      ? ['solana', 'program', 'accounts', 'filter']
                                                                                                                                      : path === '/ffm'
                                                                                                                                        ? ['solana', 'fee', 'message', 'lamports']
                                                                                                                                        : path === '/sim'
                                                                                                                                          ? ['solana', 'simulate', 'transaction', 'preflight']
                                                                                                                                          : path === '/nce'
                                                                                                                                            ? ['solana', 'nonce', 'durable', 'account']
                                                                                                                                            : path === '/brw'
                                                                                                                                              ? ['solana', 'block', 'rewards', 'lamports']
                                                                                                                                              : path === '/xfer'
                                                                                                                                                ? ['solana', 'token', 'transfers', 'parsed']
                                                                                                                                                : path === '/own'
                                                                                                                                                  ? ['solana', 'token', 'owner', 'mint']
                                                                                                                                                  : path === '/hist'
                                                                                                                                                    ? ['solana', 'signatures', 'history', 'before']
                                                                                                                                                    : path === '/stk'
                                                                                                                                                      ? ['solana', 'stake', 'delegation', 'account']
                                                                                                                                                      : path === '/vac'
                                                                                                                                                        ? ['solana', 'vote', 'commission', 'validator']
                                                                                                                                                        : path === '/mdt'
                                                                                                                                                          ? ['solana', 'token', 'metadata', 'mint']
                                                                                                                                                          : path === '/ata'
                                                                                                                                                            ? ['solana', 'token', 'ata', 'associated']
                                                                                                                                                            : path === '/jts'
                                                                                                                                                              ? ['solana', 'jupiter', 'token', 'search']
                                                                                                                                                              : path === '/gpm'
                                                                                                                                                                ? ['solana', 'gpa', 'memcmp', 'filter']
                                                                                                                                                                : path === '/logs'
                                                                                                                                                                  ? ['solana', 'transaction', 'logs', 'compute']
                                                                                                                                                                  : path === '/pda'
                                                                                                                                                                    ? ['solana', 'pda', 'derive', 'bump']
                                                                                                                                                                    : path === '/curv'
                                                                                                                                                                      ? ['solana', 'pubkey', 'curve', 'pda']
                                                                                                                                                                      : path === '/cpi'
                                                                                                                                                                        ? ['solana', 'transaction', 'cpi', 'inner']
                                                                                                                                                                        : path === '/lfee'
                                                                                                                                                                          ? ['solana', 'fees', 'priority', 'local']
                                                                                                                                                                          : path === '/until'
                                                                                                                                                                            ? ['solana', 'signatures', 'until', 'cursor']
                                                                                                                                                                            : path === '/t22'
                                                                                                                                                                              ? ['solana', 'token2022', 'owner', 'accounts']
                                                                                                                                                                              : path === '/circw'
                                                                                                                                                                                ? ['solana', 'whales', 'circulating', 'sol']
                                                                                                                                                                                : path === '/ldad'
                                                                                                                                                                                  ? ['solana', 'transaction', 'alt', 'loaded']
                                                                                                                                                                                  : path === '/tpu'
                                                                                                                                                                                    ? ['solana', 'cluster', 'tpu', 'gossip']
                                                                                                                                                                                    : path === '/ncw'
                                                                                                                                                                                      ? ['solana', 'whales', 'noncirculating', 'sol']
                                                                                                                                                                                      : path === '/bpid'
                                                                                                                                                                                        ? ['solana', 'validator', 'production', 'identity']
                                                                                                                                                                                        : path === '/rewe'
                                                                                                                                                                                          ? ['solana', 'reward', 'inflation', 'epoch']
                                                                                                                                                                                          : path === '/lsid'
                                                                                                                                                                                            ? ['solana', 'leader', 'schedule', 'identity']
                                                                                                                                                                                            : path === '/mcs'
                                                                                                                                                                                              ? ['solana', 'signatures', 'mincontext', 'slot']
                                                                                                                                                                                              : path === '/aslc'
                                                                                                                                                                                                ? ['solana', 'account', 'dataslice', 'bytes']
                                                                                                                                                                                                : path === '/mslc'
                                                                                                                                                                                                  ? ['solana', 'accounts', 'dataslice', 'batch']
                                                                                                                                                                                                  : path === '/gpsl'
                                                                                                                                                                                                    ? ['solana', 'program', 'dataslice', 'gpa']
                                                                                                                                                                                                    : path === '/blkt'
                                                                                                                                                                                                      ? ['solana', 'block', 'signatures', 'versioned']
                                                                                                                                                                                                      : path === '/vdel'
                                                                                                                                                                                                        ? ['solana', 'votes', 'delinquent', 'unstaked']
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

function isSig(value) {
  return typeof value === 'string' && /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(value)
}

function parseSigs(raw) {
  const items = String(raw || '').split(',').map((part) => part.trim()).filter(Boolean)
  if (items.length === 0) {
    const err = new Error('sigs query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (items.length > 20) {
    const err = new Error('sigs accepts at most 20 signatures')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  for (const item of items) {
    if (!isSig(item)) {
      const err = new Error('sigs must be comma-separated base58 transaction signatures')
      err.status = 400
      err.code = 'invalid_param'
      throw err
    }
  }
  return items
}

async function signatureStatuses(raw) {
  const sigs = parseSigs(raw)
  const res = await rpc('getSignatureStatuses', [sigs, { searchTransactionHistory: true }])
  const rows = (res.result?.value || []).map((item, index) => ({
    signature: sigs[index],
    found: Boolean(item),
    slot: item?.slot ?? null,
    confirmations: item?.confirmations ?? null,
    confirmationStatus: item?.confirmationStatus ?? null,
    err: item?.err ?? null,
  }))
  return {
    count: rows.length,
    found: rows.filter((row) => row.found).length,
    statuses: rows,
    generatedAt: new Date().toISOString(),
  }
}

function parseAddresses(raw) {
  const items = String(raw || '').split(',').map((part) => part.trim()).filter(Boolean)
  if (items.length === 0) {
    const err = new Error('addresses query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (items.length > 20) {
    const err = new Error('addresses accepts at most 20 pubkeys')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  for (const item of items) {
    if (!isPubkey(item)) {
      const err = new Error('addresses must be comma-separated base58 public keys')
      err.status = 400
      err.code = 'invalid_param'
      throw err
    }
  }
  return items
}

async function multipleAccounts(raw) {
  const addresses = parseAddresses(raw)
  const res = await rpc('getMultipleAccounts', [addresses, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const rows = (res.result?.value || []).map((item, index) => ({
    address: addresses[index],
    found: Boolean(item),
    lamports: item?.lamports ?? null,
    owner: item?.owner ?? null,
    executable: item?.executable ?? null,
    space: item?.space ?? null,
  }))
  return {
    count: rows.length,
    found: rows.filter((row) => row.found).length,
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
}

function parseDataSlice(offsetRaw, lengthRaw) {
  if (offsetRaw === null || offsetRaw === '') {
    const err = new Error('offset query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (lengthRaw === null || lengthRaw === '') {
    const err = new Error('length query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const offset = Number(offsetRaw)
  const length = Number(lengthRaw)
  if (!Number.isInteger(offset) || offset < 0) {
    const err = new Error('offset must be a non-negative integer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  if (!Number.isInteger(length) || length < 1 || length > 128) {
    const err = new Error('length must be an integer from 1 to 128')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return { offset, length }
}

async function multipleAccountsSlice(addressesRaw, offsetRaw, lengthRaw) {
  const addresses = parseAddresses(addressesRaw)
  const { offset, length } = parseDataSlice(offsetRaw, lengthRaw)
  const res = await rpc('getMultipleAccounts', [addresses, { encoding: 'base64', commitment: 'confirmed', dataSlice: { offset, length } }])
  const rows = (res.result?.value || []).map((item, index) => ({
    address: addresses[index],
    found: Boolean(item),
    lamports: item?.lamports ?? null,
    owner: item?.owner ?? null,
    executable: item?.executable ?? null,
    data: Array.isArray(item?.data) ? item.data[0] : null,
  }))
  return {
    count: rows.length,
    found: rows.filter((row) => row.found).length,
    offset,
    length,
    encoding: 'base64',
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
}

function isPubkey(value) {
  return typeof value === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const ASSOCIATED_TOKEN_PROGRAM = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'

function decodeBase58(value) {
  const bytes = [0]
  for (const char of value) {
    const digit = BASE58_ALPHABET.indexOf(char)
    if (digit < 0) return null
    let carry = digit
    for (let i = 0; i < bytes.length; i += 1) {
      carry += bytes[i] * 58
      bytes[i] = carry & 255
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 255)
      carry >>= 8
    }
  }
  let zeros = 0
  while (zeros < value.length && value[zeros] === '1') zeros += 1
  const out = Buffer.alloc(zeros + bytes.length)
  for (let i = 0; i < bytes.length; i += 1) out[out.length - 1 - i] = bytes[i]
  return out
}

function encodeBase58(buffer) {
  const bytes = [0]
  for (const byte of buffer) {
    let carry = byte
    for (let i = 0; i < bytes.length; i += 1) {
      carry += bytes[i] << 8
      bytes[i] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      bytes.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }
  let zeros = 0
  while (zeros < buffer.length && buffer[zeros] === 0) zeros += 1
  return '1'.repeat(zeros) + bytes.reverse().map((n) => BASE58_ALPHABET[n]).join('')
}

function ed25519OnCurve(pubkey) {
  if (pubkey.length !== 32) return false
  const y = BigInt('0x' + Buffer.from(pubkey).reverse().toString('hex')) & ((1n << 255n) - 1n)
  const p = (1n << 255n) - 19n
  const d = 37095705934669439343138083508754565189542113879843219016388785533085940283555n
  const yy = (y * y) % p
  const u = (yy + p - 1n) % p
  const v = ((d * yy) % p + 1n) % p
  const x2 = (u * modInverse(v, p)) % p
  return modPow(x2, (p - 1n) / 2n, p) !== p - 1n
}

function pubkeyCurve(keyRaw) {
  const key = requirePubkey('key', keyRaw)
  const bytes = decodeBase58(key)
  if (!bytes || bytes.length !== 32) {
    const err = new Error('key must be a 32-byte public key')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const onCurve = ed25519OnCurve(bytes)
  return {
    key,
    onCurve,
    kind: onCurve ? 'keypair' : 'pda-or-offcurve',
    generatedAt: new Date().toISOString(),
  }
}

function modPow(base, exp, mod) {
  let result = 1n
  let b = base % mod
  let e = exp
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1n
  }
  return result
}

function modInverse(value, mod) {
  return modPow(value, mod - 2n, mod)
}

function findProgramAddress(seeds, programId) {
  for (let bump = 255; bump >= 0; bump -= 1) {
    const hash = createHash('sha256')
    for (const seed of seeds) hash.update(seed)
    hash.update(Buffer.from([bump]))
    hash.update(programId)
    hash.update(Buffer.from('ProgramDerivedAddress'))
    const digest = hash.digest()
    if (!ed25519OnCurve(digest)) return { address: encodeBase58(digest), bump }
  }
  const err = new Error('unable to find program address')
  err.status = 500
  err.code = 'pda_failed'
  throw err
}

async function associatedTokenAccount(ownerRaw, mintRaw) {
  const owner = requirePubkey('owner', ownerRaw)
  const mint = requirePubkey('mint', mintRaw)
  const ownerBytes = decodeBase58(owner)
  const mintBytes = decodeBase58(mint)
  const programBytes = decodeBase58(TOKEN_PROGRAM)
  const ataProgramBytes = decodeBase58(ASSOCIATED_TOKEN_PROGRAM)
  if (!ownerBytes || !mintBytes || !programBytes || !ataProgramBytes || ownerBytes.length !== 32 || mintBytes.length !== 32) {
    const err = new Error('owner and mint must be 32-byte public keys')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const derived = findProgramAddress([ownerBytes, programBytes, mintBytes], ataProgramBytes)
  const info = await rpc('getAccountInfo', [derived.address, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const value = info.result?.value
  const parsed = value?.data?.parsed?.info || {}
  return {
    owner,
    mint,
    ata: derived.address,
    bump: derived.bump,
    exists: Boolean(value),
    lamports: value?.lamports ?? 0,
    ownerMatch: parsed.owner || null,
    amount: parsed.tokenAmount?.uiAmountString || parsed.tokenAmount?.amount || null,
    generatedAt: new Date().toISOString(),
  }
}

function parsePdaSeeds(raw) {
  if (raw === null || raw === '') {
    const err = new Error('seeds query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const parts = String(raw).split(',').map((part) => part.trim()).filter(Boolean).slice(0, 4)
  if (parts.length === 0) {
    const err = new Error('seeds must list at least one seed')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return parts.map((part) => {
    if (isPubkey(part)) {
      const decoded = decodeBase58(part)
      if (!decoded || decoded.length !== 32) {
        const err = new Error('seeds public keys must be 32-byte base58')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
      return decoded
    }
    if (part.length > 32) {
      const err = new Error('each seed must be 32 characters or fewer unless it is a public key')
      err.status = 400
      err.code = 'invalid_param'
      throw err
    }
    return Buffer.from(part, 'utf8')
  })
}

async function programDerivedAddress(programRaw, seedsRaw) {
  const program = requirePubkey('program', programRaw)
  const seeds = parsePdaSeeds(seedsRaw)
  const programBytes = decodeBase58(program)
  if (!programBytes || programBytes.length !== 32) {
    const err = new Error('program must be a 32-byte public key')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const derived = findProgramAddress(seeds, programBytes)
  const info = await rpc('getAccountInfo', [derived.address, { encoding: 'base64', commitment: 'confirmed' }])
  const value = info.result?.value
  return {
    program,
    address: derived.address,
    bump: derived.bump,
    exists: Boolean(value),
    lamports: value?.lamports ?? 0,
    owner: value?.owner ?? null,
    generatedAt: new Date().toISOString(),
  }
}

function requireSig(name, value) {
  if (!value) {
    const err = new Error(name + ' query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (typeof value !== 'string' || !/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(value)) {
    const err = new Error(name + ' must be a base58 transaction signature')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return value
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

async function loadedAddresses(sigRaw) {
  const sig = requireSig('sig', sigRaw)
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }])
  if (!tx.result) {
    const err = new Error('transaction not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const loaded = tx.result.meta?.loadedAddresses || {}
  const writable = Array.isArray(loaded.writable) ? loaded.writable.slice(0, 16) : []
  const readonly = Array.isArray(loaded.readonly) ? loaded.readonly.slice(0, 16) : []
  return {
    sig,
    slot: tx.result.slot ?? null,
    version: tx.result.version ?? 'legacy',
    writableCount: Array.isArray(loaded.writable) ? loaded.writable.length : 0,
    readonlyCount: Array.isArray(loaded.readonly) ? loaded.readonly.length : 0,
    writable,
    readonly,
    generatedAt: new Date().toISOString(),
  }
}

async function parsedTransfers(sigRaw) {
  const sig = requireSig('sig', sigRaw)
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }])
  if (!tx.result) {
    const err = new Error('transaction not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const meta = tx.result.meta || {}
  const keys = (tx.result.transaction?.message?.accountKeys || []).map((k) => (typeof k === 'string' ? k : k.pubkey))
  const sol = keys.map((pubkey, idx) => {
    const pre = Number(meta.preBalances?.[idx] || 0)
    const post = Number(meta.postBalances?.[idx] || 0)
    return { pubkey, pre, post, lamports: post - pre }
  }).filter((row) => row.lamports !== 0).slice(0, 16)
  const preTokens = Array.isArray(meta.preTokenBalances) ? meta.preTokenBalances : []
  const postTokens = Array.isArray(meta.postTokenBalances) ? meta.postTokenBalances : []
  const tokenMap = new Map()
  for (const row of preTokens) {
    const key = [row.accountIndex, row.mint, row.owner].join(':')
    tokenMap.set(key, {
      account: keys[row.accountIndex] || null,
      mint: row.mint ?? null,
      owner: row.owner ?? null,
      pre: row.uiTokenAmount?.uiAmountString ?? '0',
      post: '0',
    })
  }
  for (const row of postTokens) {
    const key = [row.accountIndex, row.mint, row.owner].join(':')
    const current = tokenMap.get(key) || {
      account: keys[row.accountIndex] || null,
      mint: row.mint ?? null,
      owner: row.owner ?? null,
      pre: '0',
      post: '0',
    }
    current.post = row.uiTokenAmount?.uiAmountString ?? '0'
    tokenMap.set(key, current)
  }
  const tokens = [...tokenMap.values()].filter((row) => row.pre !== row.post).slice(0, 16)
  return {
    sig,
    slot: tx.result.slot ?? null,
    err: meta.err ?? null,
    fee: meta.fee ?? 0,
    sol,
    tokens,
    generatedAt: new Date().toISOString(),
  }
}

async function transactionLogs(sigRaw) {
  const sig = requireSig('sig', sigRaw)
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }])
  if (!tx.result) {
    const err = new Error('transaction not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const meta = tx.result.meta || {}
  const logs = Array.isArray(meta.logMessages) ? meta.logMessages.slice(0, 16) : []
  return {
    sig,
    slot: tx.result.slot ?? null,
    err: meta.err ?? null,
    fee: meta.fee ?? 0,
    computeUnits: meta.computeUnitsConsumed ?? null,
    logCount: Array.isArray(meta.logMessages) ? meta.logMessages.length : 0,
    logs,
    generatedAt: new Date().toISOString(),
  }
}

async function transactionInnerInstructions(sigRaw) {
  const sig = requireSig('sig', sigRaw)
  const tx = await rpc('getTransaction', [sig, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }])
  if (!tx.result) {
    const err = new Error('transaction not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const meta = tx.result.meta || {}
  const groups = Array.isArray(meta.innerInstructions) ? meta.innerInstructions : []
  const inner = []
  for (const group of groups) {
    const instructions = Array.isArray(group.instructions) ? group.instructions : []
    for (const ix of instructions) {
      if (inner.length >= 16) break
      const parsed = ix.parsed || {}
      inner.push({
        index: group.index ?? null,
        program: ix.programId || ix.program || null,
        type: parsed.type || ix.program || 'raw',
        accounts: Array.isArray(ix.accounts) ? ix.accounts.slice(0, 4) : [],
      })
    }
    if (inner.length >= 16) break
  }
  return {
    sig,
    slot: tx.result.slot ?? null,
    err: meta.err ?? null,
    innerCount: groups.reduce((sum, group) => sum + (Array.isArray(group.instructions) ? group.instructions.length : 0), 0),
    inner,
    generatedAt: new Date().toISOString(),
  }
}

async function tokenAccountsByDelegate(delegateRaw) {
  const delegate = requirePubkey('delegate', delegateRaw)
  const token = await rpc('getTokenAccountsByDelegate', [
    delegate,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ])
  const token2022 = await rpc('getTokenAccountsByDelegate', [
    delegate,
    { programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' },
    { encoding: 'jsonParsed' },
  ])
  const rows = [...(token.result?.value ?? []), ...(token2022.result?.value ?? [])].slice(0, 20).map((item) => ({
    pubkey: item.pubkey,
    mint: item.account.data.parsed?.info?.mint,
    amount: item.account.data.parsed?.info?.tokenAmount?.uiAmountString,
    owner: item.account.data.parsed?.info?.owner,
    program: item.account.owner,
  }))
  return {
    delegate,
    count: rows.length,
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
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

async function tokenBalanceByOwnerMint(ownerRaw, mintRaw) {
  const owner = requirePubkey('owner', ownerRaw)
  const mint = requirePubkey('mint', mintRaw)
  const token = await rpc('getTokenAccountsByOwner', [
    owner,
    { mint },
    { encoding: 'jsonParsed' },
  ])
  const rows = (token.result?.value ?? []).slice(0, 8).map((item) => ({
    account: item.pubkey,
    amount: item.account.data.parsed?.info?.tokenAmount?.uiAmountString ?? '0',
    decimals: item.account.data.parsed?.info?.tokenAmount?.decimals ?? null,
    program: item.account.owner,
  }))
  const amount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  return {
    owner,
    mint,
    amount: String(amount),
    accounts: rows.length,
    holdings: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function token2022ByOwner(ownerRaw) {
  const owner = requirePubkey('owner', ownerRaw)
  const token2022 = await rpc('getTokenAccountsByOwner', [
    owner,
    { programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' },
    { encoding: 'jsonParsed' },
  ])
  const rows = (token2022.result?.value ?? []).slice(0, 20).map((item) => ({
    account: item.pubkey,
    mint: item.account.data.parsed?.info?.mint ?? null,
    amount: item.account.data.parsed?.info?.tokenAmount?.uiAmountString ?? '0',
    decimals: item.account.data.parsed?.info?.tokenAmount?.decimals ?? null,
  }))
  return {
    owner,
    program: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    count: rows.length,
    tokens: rows,
    generatedAt: new Date().toISOString(),
  }
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

async function jupiterTokenSearch(queryRaw) {
  const query = requireText('q', queryRaw)
  if (query.length > 64) {
    const err = new Error('q must be 64 characters or fewer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const searchUrl = 'https://lite-api.jup.ag/tokens/v2/search?query=' + encodeURIComponent(query)
  const res = await fetch(searchUrl, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) })
  const body = await res.json().catch(() => null)
  if (!res.ok || !Array.isArray(body)) {
    const err = new Error((body && body.error) || 'jupiter token search failed')
    err.status = 502
    err.code = 'upstream_error'
    throw err
  }
  return {
    query,
    count: body.length,
    tokens: body.slice(0, 8).map((row) => ({
      id: row.id || row.address || null,
      name: row.name || null,
      symbol: row.symbol || null,
      decimals: row.decimals ?? null,
      organicScore: row.organicScore ?? row.organicScoreLabel ?? null,
      usdPrice: row.usdPrice ?? null,
      mcap: row.mcap ?? row.fdv ?? null,
    })),
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

async function contentFresh(target) {
  const res = await fetch(target, {
    headers: { accept: 'text/html,application/json,*/*', 'user-agent': 'solana-pulse-xaas' },
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
  })
  const buf = Buffer.from(await res.arrayBuffer())
  const slice = buf.subarray(0, 512000)
  return {
    url: target,
    finalUrl: res.url,
    status: res.status,
    contentType: res.headers.get('content-type'),
    contentLength: buf.length,
    sha256: createHash('sha256').update(slice).digest('hex'),
    etag: res.headers.get('etag'),
    lastModified: res.headers.get('last-modified'),
    observedAt: new Date().toISOString(),
  }
}

const UNIT_TO_SI = {
  m: { dim: 'length', factor: 1 },
  km: { dim: 'length', factor: 1000 },
  cm: { dim: 'length', factor: 0.01 },
  mm: { dim: 'length', factor: 0.001 },
  mi: { dim: 'length', factor: 1609.344 },
  yd: { dim: 'length', factor: 0.9144 },
  ft: { dim: 'length', factor: 0.3048 },
  in: { dim: 'length', factor: 0.0254 },
  kg: { dim: 'mass', factor: 1 },
  g: { dim: 'mass', factor: 0.001 },
  lb: { dim: 'mass', factor: 0.45359237 },
  oz: { dim: 'mass', factor: 0.028349523125 },
  l: { dim: 'volume', factor: 1 },
  ml: { dim: 'volume', factor: 0.001 },
  gal: { dim: 'volume', factor: 3.785411784 },
  qt: { dim: 'volume', factor: 0.946352946 },
  c: { dim: 'temp' },
  f: { dim: 'temp' },
  k: { dim: 'temp' },
}

const MIME_BY_EXT = {
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript',
  json: 'application/json', xml: 'application/xml', txt: 'text/plain', csv: 'text/csv', md: 'text/markdown',
  pdf: 'application/pdf', zip: 'application/zip', gz: 'application/gzip', tar: 'application/x-tar',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  svg: 'image/svg+xml', ico: 'image/x-icon', mp3: 'audio/mpeg', wav: 'audio/wav', mp4: 'video/mp4',
  webm: 'video/webm', wasm: 'application/wasm', woff2: 'font/woff2', ttf: 'font/ttf',
}

const LANG_BY_CODE = {
  en: { name: 'English', native: 'English' },
  it: { name: 'Italian', native: 'Italiano' },
  es: { name: 'Spanish', native: 'Español' },
  fr: { name: 'French', native: 'Français' },
  de: { name: 'German', native: 'Deutsch' },
  pt: { name: 'Portuguese', native: 'Português' },
  nl: { name: 'Dutch', native: 'Nederlands' },
  pl: { name: 'Polish', native: 'Polski' },
  ru: { name: 'Russian', native: 'Русский' },
  ja: { name: 'Japanese', native: '日本語' },
  zh: { name: 'Chinese', native: '中文' },
  ko: { name: 'Korean', native: '한국어' },
  ar: { name: 'Arabic', native: 'العربية' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  tr: { name: 'Turkish', native: 'Türkçe' },
  sv: { name: 'Swedish', native: 'Svenska' },
  da: { name: 'Danish', native: 'Dansk' },
  fi: { name: 'Finnish', native: 'Suomi' },
  no: { name: 'Norwegian', native: 'Norsk' },
  el: { name: 'Greek', native: 'Ελληνικά' },
}

const TOKEN_2022 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

async function epochInfo() {
  const res = await rpc('getEpochInfo', [])
  return {
    epoch: res.result?.epoch,
    slotIndex: res.result?.slotIndex,
    slotsInEpoch: res.result?.slotsInEpoch,
    absoluteSlot: res.result?.absoluteSlot,
    blockHeight: res.result?.blockHeight,
    transactionCount: res.result?.transactionCount,
    generatedAt: new Date().toISOString(),
  }
}

async function maxShredInsertSlot() {
  const res = await rpc('getMaxShredInsertSlot', [])
  return {
    slot: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function maxRetransmitSlot() {
  const res = await rpc('getMaxRetransmitSlot', [])
  return {
    slot: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function highestSnapshot() {
  const res = await rpc('getHighestSnapshotSlot', [])
  return {
    full: res.result?.full,
    incremental: res.result?.incremental ?? null,
    generatedAt: new Date().toISOString(),
  }
}

async function firstAvailableBlock() {
  const res = await rpc('getFirstAvailableBlock', [])
  return {
    firstAvailableBlock: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function leaderSchedule() {
  const res = await rpc('getLeaderSchedule', [])
  const map = res.result && typeof res.result === 'object' ? res.result : {}
  const rows = Object.entries(map).map(([identity, slots]) => ({
    identity,
    slots: Array.isArray(slots) ? slots.length : 0,
  }))
  rows.sort((a, b) => b.slots - a.slots)
  const slotsAssigned = rows.reduce((sum, row) => sum + row.slots, 0)
  return {
    leaders: rows.length,
    slotsAssigned,
    topSlots: rows[0]?.slots ?? 0,
    top: rows.slice(0, 8),
    generatedAt: new Date().toISOString(),
  }
}

async function leaderScheduleByIdentity(identityRaw) {
  const identity = requirePubkey('identity', identityRaw)
  const res = await rpc('getLeaderSchedule', [null, { identity }])
  const map = res.result && typeof res.result === 'object' ? res.result : {}
  const slots = Array.isArray(map[identity]) ? map[identity] : []
  return {
    identity,
    found: slots.length > 0,
    slots: slots.length,
    firstSlots: slots.slice(0, 16),
    lastSlot: slots.length ? slots[slots.length - 1] : null,
    generatedAt: new Date().toISOString(),
  }
}

async function currentLeader() {
  const res = await rpc('getSlotLeader', [])
  return {
    identity: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function transactionCount() {
  const res = await rpc('getTransactionCount', [])
  return {
    transactionCount: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function blockHeight() {
  const res = await rpc('getBlockHeight', [])
  return {
    blockHeight: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function latestBlockhash() {
  const res = await rpc('getLatestBlockhash', [])
  const value = res.result?.value || {}
  return {
    blockhash: value.blockhash,
    lastValidBlockHeight: value.lastValidBlockHeight,
    generatedAt: new Date().toISOString(),
  }
}

async function currentSlot() {
  const res = await rpc('getSlot', [])
  return {
    slot: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function epochSchedule() {
  const res = await rpc('getEpochSchedule', [])
  const value = res.result || {}
  return {
    slotsPerEpoch: value.slotsPerEpoch,
    leaderScheduleSlotOffset: value.leaderScheduleSlotOffset,
    warmup: value.warmup,
    firstNormalEpoch: value.firstNormalEpoch,
    firstNormalSlot: value.firstNormalSlot,
    generatedAt: new Date().toISOString(),
  }
}

async function genesisHash() {
  const res = await rpc('getGenesisHash', [])
  return {
    genesisHash: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function rpcHealth() {
  const res = await rpc('getHealth', [])
  return {
    healthy: res.result === 'ok',
    status: res.result,
    generatedAt: new Date().toISOString(),
  }
}

async function nodeIdentity() {
  const res = await rpc('getIdentity', [])
  return {
    identity: res.result?.identity,
    generatedAt: new Date().toISOString(),
  }
}

async function clusterVersion() {
  const res = await rpc('getVersion', [])
  const value = res.result || {}
  return {
    solanaCore: value['solana-core'],
    featureSet: value['feature-set'],
    generatedAt: new Date().toISOString(),
  }
}

async function clusterNodes() {
  const res = await rpc('getClusterNodes', [])
  const nodes = res.result || []
  return {
    count: nodes.length,
    rpc: nodes.filter((row) => Boolean(row.rpc)).length,
    gossip: nodes.filter((row) => Boolean(row.gossip)).length,
    tpu: nodes.filter((row) => Boolean(row.tpu)).length,
    generatedAt: new Date().toISOString(),
  }
}

async function clusterTpuEndpoints() {
  const res = await rpc('getClusterNodes', [])
  const nodes = (res.result || [])
    .filter((row) => Boolean(row.tpu))
    .slice(0, 16)
    .map((row) => ({
      pubkey: row.pubkey,
      tpu: row.tpu || null,
      tpuForwards: row.tpuForwards || null,
      gossip: row.gossip || null,
      rpc: row.rpc || null,
      version: row.version || null,
      shredVersion: row.shredVersion ?? null,
    }))
  return {
    count: nodes.length,
    nodes,
    generatedAt: new Date().toISOString(),
  }
}

async function blockProduction() {
  const res = await rpc('getBlockProduction', [])
  const value = res.result?.value || {}
  const range = value.range || {}
  const byIdentity = value.byIdentity || {}
  let leaderSlots = 0
  let blocksProduced = 0
  for (const row of Object.values(byIdentity)) {
    if (Array.isArray(row) && row.length >= 2) {
      leaderSlots += Number(row[0] || 0)
      blocksProduced += Number(row[1] || 0)
    }
  }
  const skipped = Math.max(0, leaderSlots - blocksProduced)
  return {
    firstSlot: range.firstSlot,
    lastSlot: range.lastSlot,
    leaderSlots,
    blocksProduced,
    skipped,
    skipRate: leaderSlots ? Number((skipped / leaderSlots).toFixed(6)) : 0,
    generatedAt: new Date().toISOString(),
  }
}

async function blockProductionByIdentity(identityRaw) {
  const identity = requirePubkey('identity', identityRaw)
  const res = await rpc('getBlockProduction', [{ identity }])
  const value = res.result?.value || {}
  const range = value.range || {}
  const row = value.byIdentity?.[identity]
  const leaderSlots = Array.isArray(row) ? Number(row[0] || 0) : 0
  const blocksProduced = Array.isArray(row) ? Number(row[1] || 0) : 0
  const skipped = Math.max(0, leaderSlots - blocksProduced)
  return {
    identity,
    found: Array.isArray(row),
    firstSlot: range.firstSlot ?? null,
    lastSlot: range.lastSlot ?? null,
    leaderSlots,
    blocksProduced,
    skipped,
    skipRate: leaderSlots ? Number((skipped / leaderSlots).toFixed(6)) : 0,
    generatedAt: new Date().toISOString(),
  }
}

async function largestAccounts() {
  const res = await rpc('getLargestAccounts', [])
  const accounts = (res.result?.value || []).slice(0, 20).map((row) => ({
    address: row.address,
    lamports: row.lamports,
    sol: Number((row.lamports / 1e9).toFixed(9)),
  }))
  return { count: accounts.length, accounts, generatedAt: new Date().toISOString() }
}

async function circulatingLargestAccounts() {
  const res = await rpc('getLargestAccounts', [{ filter: 'circulating' }])
  const accounts = (res.result?.value || []).slice(0, 20).map((row) => ({
    address: row.address,
    lamports: row.lamports,
    sol: Number((row.lamports / 1e9).toFixed(9)),
  }))
  return {
    filter: 'circulating',
    count: accounts.length,
    accounts,
    generatedAt: new Date().toISOString(),
  }
}

async function nonCirculatingLargestAccounts() {
  const res = await rpc('getLargestAccounts', [{ filter: 'nonCirculating' }])
  const accounts = (res.result?.value || []).slice(0, 20).map((row) => ({
    address: row.address,
    lamports: row.lamports,
    sol: Number((row.lamports / 1e9).toFixed(9)),
  }))
  return {
    filter: 'nonCirculating',
    count: accounts.length,
    accounts,
    generatedAt: new Date().toISOString(),
  }
}

async function voteCounts() {
  const res = await rpc('getVoteAccounts', [])
  const current = res.result?.current || []
  const delinquent = res.result?.delinquent || []
  const activated = current.reduce((sum, row) => sum + Number(row.activatedStake || 0), 0)
  return {
    current: current.length,
    delinquent: delinquent.length,
    activatedStake: activated,
    generatedAt: new Date().toISOString(),
  }
}

async function voteAccount(voteRaw) {
  const vote = requirePubkey('vote', voteRaw)
  const res = await rpc('getVoteAccounts', [{ votePubkey: vote }])
  const current = res.result?.current || []
  const delinquent = res.result?.delinquent || []
  const row = current[0] || delinquent[0]
  if (!row) {
    const err = new Error('vote account not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return {
    vote,
    node: row.nodePubkey ?? null,
    commission: row.commission ?? null,
    activatedStake: row.activatedStake ?? 0,
    lastVote: row.lastVote ?? null,
    rootSlot: row.rootSlot ?? null,
    epochCredits: Array.isArray(row.epochCredits) ? row.epochCredits.slice(-4) : [],
    delinquent: !current[0],
    generatedAt: new Date().toISOString(),
  }
}

async function delinquentVoteAccounts() {
  const res = await rpc('getVoteAccounts', [{ keepUnstakedDelinquents: true }])
  const rows = (res.result?.delinquent || []).slice(0, 20).map((row) => ({
    vote: row.votePubkey ?? null,
    node: row.nodePubkey ?? null,
    commission: row.commission ?? null,
    activatedStake: row.activatedStake ?? 0,
    lastVote: row.lastVote ?? null,
    rootSlot: row.rootSlot ?? null,
  }))
  return {
    count: rows.length,
    delinquent: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function circulatingSupply() {
  const res = await rpc('getSupply', [{ commitment: 'confirmed' }])
  const value = res.result?.value || {}
  return {
    total: value.total,
    circulating: value.circulating,
    nonCirculating: value.nonCirculating,
    solTotal: Number((value.total / 1e9).toFixed(9)),
    solCirculating: Number((value.circulating / 1e9).toFixed(9)),
    generatedAt: new Date().toISOString(),
  }
}

async function blockhashValid(blockhash) {
  const hash = requirePubkey('blockhash', blockhash)
  const res = await rpc('isBlockhashValid', [hash, { commitment: 'processed' }])
  return {
    blockhash: hash,
    valid: Boolean(res.result?.value),
    commitment: 'processed',
    generatedAt: new Date().toISOString(),
  }
}

function parseSlot(slotRaw) {
  if (slotRaw === null || slotRaw === '') {
    const err = new Error('slot query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const slot = Number(slotRaw)
  if (!Number.isInteger(slot) || slot < 0) {
    const err = new Error('slot must be a non-negative integer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return slot
}

function parseOptionalSlot(name, raw) {
  if (raw === null || raw === '') return null
  const slot = Number(raw)
  if (!Number.isInteger(slot) || slot < 0) {
    const err = new Error(name + ' must be a non-negative integer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return slot
}

function parseBlockRange(startRaw, endRaw) {
  const start = parseSlot(startRaw)
  const end = parseOptionalSlot('end', endRaw)
  if (end !== null && end < start) {
    const err = new Error('end must be greater than or equal to start')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  if (end !== null && end - start > 50) {
    const err = new Error('range accepts at most 51 slots')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return { start, end }
}

async function programAccounts(programRaw, spaceRaw) {
  const program = requirePubkey('program', programRaw)
  const space = parseSpace(spaceRaw)
  const res = await rpc('getProgramAccounts', [
    program,
    {
      encoding: 'base64',
      dataSlice: { offset: 0, length: 0 },
      filters: [{ dataSize: space }],
    },
  ])
  const rows = (Array.isArray(res.result) ? res.result : []).slice(0, 20).map((item) => ({
    pubkey: item.pubkey,
    lamports: item.account?.lamports ?? null,
    owner: item.account?.owner ?? null,
  }))
  return {
    program,
    space,
    count: rows.length,
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function programAccountsSlice(programRaw, spaceRaw, offsetRaw, lengthRaw) {
  const program = requirePubkey('program', programRaw)
  const space = parseSpace(spaceRaw)
  const { offset, length } = parseDataSlice(offsetRaw, lengthRaw)
  const res = await rpc('getProgramAccounts', [
    program,
    {
      encoding: 'base64',
      dataSlice: { offset, length },
      filters: [{ dataSize: space }],
    },
  ])
  const rows = (Array.isArray(res.result) ? res.result : []).slice(0, 20).map((item) => ({
    pubkey: item.pubkey,
    lamports: item.account?.lamports ?? null,
    owner: item.account?.owner ?? null,
    data: Array.isArray(item.account?.data) ? item.account.data[0] : null,
  }))
  return {
    program,
    space,
    offset,
    length,
    encoding: 'base64',
    count: rows.length,
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
}

function parseOffset(raw) {
  if (raw === null || raw === '') {
    const err = new Error('offset query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const offset = Number(raw)
  if (!Number.isInteger(offset) || offset < 0 || offset > 10240) {
    const err = new Error('offset must be an integer from 0 to 10240')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return offset
}

function parseMemcmpBytes(raw) {
  if (raw === null || raw === '') {
    const err = new Error('bytes query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const bytes = String(raw).trim()
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,88}$/.test(bytes)) {
    const err = new Error('bytes must be base58 between 32 and 88 characters')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return bytes
}

async function programAccountsMemcmp(programRaw, offsetRaw, bytesRaw) {
  const program = requirePubkey('program', programRaw)
  const offset = parseOffset(offsetRaw)
  const bytes = parseMemcmpBytes(bytesRaw)
  const res = await rpc('getProgramAccounts', [
    program,
    {
      encoding: 'base64',
      dataSlice: { offset: 0, length: 0 },
      filters: [{ memcmp: { offset, bytes } }],
    },
  ])
  const rows = (Array.isArray(res.result) ? res.result : []).slice(0, 20).map((item) => ({
    pubkey: item.pubkey,
    lamports: item.account?.lamports ?? null,
    owner: item.account?.owner ?? null,
  }))
  return {
    program,
    offset,
    bytes,
    count: rows.length,
    accounts: rows,
    generatedAt: new Date().toISOString(),
  }
}

function parseMessage(raw) {
  if (raw === null || raw === '') {
    const err = new Error('message query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const message = String(raw).trim()
  if (!/^[A-Za-z0-9+/]+=*$/.test(message) || message.length < 32 || message.length > 2048) {
    const err = new Error('message must be base64 between 32 and 2048 characters')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return message
}

async function feeForMessage(messageRaw) {
  const message = parseMessage(messageRaw)
  const res = await rpc('getFeeForMessage', [message])
  const lamports = Number(res.result?.value ?? 0)
  return {
    lamports,
    sol: lamports / 1e9,
    generatedAt: new Date().toISOString(),
  }
}

function parseTx(raw) {
  if (raw === null || raw === '') {
    const err = new Error('tx query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const tx = String(raw).trim()
  if (!/^[A-Za-z0-9+/]+=*$/.test(tx) || tx.length < 64 || tx.length > 4096) {
    const err = new Error('tx must be base64 between 64 and 4096 characters')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return tx
}

async function simulateTx(txRaw) {
  const tx = parseTx(txRaw)
  const res = await rpc('simulateTransaction', [tx, { encoding: 'base64', sigVerify: false, replaceRecentBlockhash: true }])
  const value = res.result?.value || {}
  return {
    err: value.err ?? null,
    units: value.unitsConsumed ?? 0,
    logs: Array.isArray(value.logs) ? value.logs.slice(0, 16) : [],
    generatedAt: new Date().toISOString(),
  }
}

function parseLimit(raw, fallback = 8) {
  if (raw === null || raw === '') return fallback
  const limit = Number(raw)
  if (!Number.isInteger(limit) || limit < 1 || limit > 32) {
    const err = new Error('limit must be an integer from 1 to 32')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return limit
}

async function slotLeaders(startRaw, limitRaw) {
  const start = parseSlot(startRaw)
  const limit = parseLimit(limitRaw)
  const res = await rpc('getSlotLeaders', [start, limit])
  const leaders = Array.isArray(res.result) ? res.result : []
  return {
    start,
    limit,
    count: leaders.length,
    unique: new Set(leaders).size,
    leaders,
    generatedAt: new Date().toISOString(),
  }
}

async function minimumLedgerSlot() {
  const res = await rpc('minimumLedgerSlot', [])
  return {
    slot: Number(res.result ?? 0),
    generatedAt: new Date().toISOString(),
  }
}

async function stakeMinimumDelegation() {
  const res = await rpc('getStakeMinimumDelegation', [])
  const lamports = Number(res.result?.value ?? res.result ?? 0)
  return {
    lamports,
    sol: lamports / 1e9,
    generatedAt: new Date().toISOString(),
  }
}

async function blocksWithLimit(startRaw, limitRaw) {
  const start = parseSlot(startRaw)
  const limit = parseLimit(limitRaw)
  const res = await rpc('getBlocksWithLimit', [start, limit])
  const slots = Array.isArray(res.result) ? res.result : []
  return {
    start,
    limit,
    count: slots.length,
    slots,
    generatedAt: new Date().toISOString(),
  }
}

async function blockMeta(slotRaw) {
  const slot = parseSlot(slotRaw)
  const res = await rpc('getBlock', [slot, {
    encoding: 'json',
    transactionDetails: 'none',
    rewards: true,
    maxSupportedTransactionVersion: 0,
  }])
  const value = res.result
  if (!value) {
    const err = new Error('block not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return {
    slot,
    blockhash: value.blockhash ?? null,
    previousBlockhash: value.previousBlockhash ?? null,
    parentSlot: value.parentSlot ?? null,
    blockHeight: value.blockHeight ?? null,
    blockTime: value.blockTime ?? null,
    txCount: Array.isArray(value.transactions) ? value.transactions.length : 0,
    rewards: Array.isArray(value.rewards) ? value.rewards.length : 0,
    generatedAt: new Date().toISOString(),
  }
}

async function blockSignatures(slotRaw) {
  const slot = parseSlot(slotRaw)
  const res = await rpc('getBlock', [slot, {
    encoding: 'json',
    transactionDetails: 'signatures',
    rewards: false,
    maxSupportedTransactionVersion: 0,
  }])
  const value = res.result
  if (!value) {
    const err = new Error('block not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const signatures = Array.isArray(value.signatures) ? value.signatures.slice(0, 32) : []
  return {
    slot,
    blockhash: value.blockhash ?? null,
    parentSlot: value.parentSlot ?? null,
    blockHeight: value.blockHeight ?? null,
    blockTime: value.blockTime ?? null,
    count: signatures.length,
    signatures,
    generatedAt: new Date().toISOString(),
  }
}

async function blockRewards(slotRaw) {
  const slot = parseSlot(slotRaw)
  const res = await rpc('getBlock', [slot, {
    encoding: 'json',
    transactionDetails: 'none',
    rewards: true,
    maxSupportedTransactionVersion: 0,
  }])
  const value = res.result
  if (!value) {
    const err = new Error('block not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const rewards = (Array.isArray(value.rewards) ? value.rewards : []).slice(0, 16).map((item) => ({
    pubkey: item.pubkey ?? null,
    lamports: item.lamports ?? 0,
    postBalance: item.postBalance ?? null,
    rewardType: item.rewardType ?? null,
    commission: item.commission ?? null,
  }))
  return {
    slot,
    blockhash: value.blockhash ?? null,
    count: Array.isArray(value.rewards) ? value.rewards.length : 0,
    lamports: rewards.reduce((sum, item) => sum + (Number(item.lamports) || 0), 0),
    rewards,
    generatedAt: new Date().toISOString(),
  }
}

async function blockCommitment(slotRaw) {
  const slot = parseSlot(slotRaw)
  const res = await rpc('getBlockCommitment', [slot])
  const commitment = Array.isArray(res.result?.commitment) ? res.result.commitment : []
  const committed = commitment.reduce((sum, value) => sum + (Number(value) || 0), 0)
  return {
    slot,
    totalStake: res.result?.totalStake ?? null,
    committed,
    samples: commitment.length,
    generatedAt: new Date().toISOString(),
  }
}

async function confirmedBlocks(startRaw, endRaw) {
  const { start, end } = parseBlockRange(startRaw, endRaw)
  const params = end === null ? [start] : [start, end]
  const res = await rpc('getBlocks', params)
  const slots = Array.isArray(res.result) ? res.result : []
  return {
    start,
    end: end === null ? slots[slots.length - 1] ?? start : end,
    count: slots.length,
    slots,
    generatedAt: new Date().toISOString(),
  }
}

async function blockTime(slotRaw) {
  const slot = parseSlot(slotRaw)
  const res = await rpc('getBlockTime', [slot])
  const unix = res.result
  return {
    slot,
    unix,
    iso: typeof unix === 'number' ? new Date(unix * 1000).toISOString() : null,
    generatedAt: new Date().toISOString(),
  }
}

async function inflationReward(address) {
  const key = requirePubkey('address', address)
  const res = await rpc('getInflationReward', [[key]])
  const row = Array.isArray(res.result) ? res.result[0] : null
  return {
    address: key,
    found: Boolean(row),
    epoch: row?.epoch ?? null,
    effectiveSlot: row?.effectiveSlot ?? null,
    amount: row?.amount ?? null,
    postBalance: row?.postBalance ?? null,
    commission: row?.commission ?? null,
    generatedAt: new Date().toISOString(),
  }
}

async function inflationRewardEpoch(addressRaw, epochRaw) {
  const key = requirePubkey('address', addressRaw)
  if (epochRaw === null || epochRaw === '') {
    const err = new Error('epoch query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const epoch = Number(epochRaw)
  if (!Number.isInteger(epoch) || epoch < 0) {
    const err = new Error('epoch must be a non-negative integer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const res = await rpc('getInflationReward', [[key], { epoch }])
  const row = Array.isArray(res.result) ? res.result[0] : null
  return {
    address: key,
    requestedEpoch: epoch,
    found: Boolean(row),
    epoch: row?.epoch ?? null,
    effectiveSlot: row?.effectiveSlot ?? null,
    amount: row?.amount ?? null,
    postBalance: row?.postBalance ?? null,
    commission: row?.commission ?? null,
    generatedAt: new Date().toISOString(),
  }
}

async function inflationGovernor() {
  const res = await rpc('getInflationGovernor', [])
  const value = res.result || {}
  return {
    initial: value.initial,
    terminal: value.terminal,
    taper: value.taper,
    foundation: value.foundation,
    foundationTerm: value.foundationTerm,
    generatedAt: new Date().toISOString(),
  }
}

async function inflationRate() {
  const res = await rpc('getInflationRate', [])
  const value = res.result || {}
  return {
    total: value.total,
    validator: value.validator,
    foundation: value.foundation,
    epoch: value.epoch,
    generatedAt: new Date().toISOString(),
  }
}

function parseSpace(spaceRaw) {
  if (spaceRaw === null || spaceRaw === '') {
    const err = new Error('space query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const space = Number(spaceRaw)
  if (!Number.isInteger(space) || space < 0 || space > 10240) {
    const err = new Error('space must be an integer from 0 to 10240')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return space
}

async function rentExempt(spaceRaw) {
  const space = parseSpace(spaceRaw)
  const res = await rpc('getMinimumBalanceForRentExemption', [space])
  return {
    space,
    lamports: res.result,
    sol: Number((res.result / 1e9).toFixed(9)),
    generatedAt: new Date().toISOString(),
  }
}

async function clusterTps() {
  const res = await rpc('getRecentPerformanceSamples', [5])
  const samples = (res.result || []).map((row) => ({
    slot: row.slot,
    numTransactions: row.numTransactions,
    samplePeriodSecs: row.samplePeriodSecs,
    tps: row.samplePeriodSecs ? Number((row.numTransactions / row.samplePeriodSecs).toFixed(2)) : 0,
  }))
  const tps = samples.length
    ? Number((samples.reduce((sum, row) => sum + row.tps, 0) / samples.length).toFixed(2))
    : 0
  return { tps, samples, generatedAt: new Date().toISOString() }
}

async function transferFee(mint) {
  const res = await rpc('getAccountInfo', [mint, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const info = res.result?.value
  if (!info) {
    const err = new Error('mint not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const parsed = info.data?.parsed
  const ext = parsed?.info?.extensions || []
  const fee = ext.find((item) => item.extension === 'transferFeeConfig')
  const newer = fee?.state?.newerTransferFee || fee?.newerTransferFee || {}
  return {
    mint,
    owner: info.owner,
    token2022: info.owner === TOKEN_2022,
    transferFeeBps: Number(newer.transferFeeBasisPoints || 0),
    maximumFee: newer.maximumFee || '0',
    generatedAt: new Date().toISOString(),
  }
}

async function tokenAccountBalance(account) {
  const key = requirePubkey('account', account)
  const res = await rpc('getTokenAccountBalance', [key])
  const value = res.result?.value
  if (!value) {
    const err = new Error('token account balance not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return {
    account: key,
    amount: value.amount,
    decimals: value.decimals,
    uiAmount: value.uiAmountString || value.uiAmount,
    generatedAt: new Date().toISOString(),
  }
}

async function tokenSupply(mint) {
  const res = await rpc('getTokenSupply', [mint])
  const value = res.result?.value
  if (!value) {
    const err = new Error('mint supply not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  return {
    mint,
    amount: value.amount,
    decimals: value.decimals,
    uiAmount: value.uiAmountString || value.uiAmount,
    generatedAt: new Date().toISOString(),
  }
}

async function mintMetadata(mintRaw) {
  const mint = requirePubkey('mint', mintRaw)
  const [supplyRes, accountRes] = await Promise.all([
    rpc('getTokenSupply', [mint]),
    rpc('getAccountInfo', [mint, { encoding: 'jsonParsed', commitment: 'confirmed' }]),
  ])
  const value = accountRes.result?.value
  if (!value) {
    const err = new Error('mint not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const parsed = value.data?.parsed?.info || {}
  const ext = parsed.extensions || []
  const tokenMetadata = (Array.isArray(ext) ? ext : []).find((item) => item.extension === 'tokenMetadata')?.state || {}
  const supply = supplyRes.result?.value || {}
  return {
    mint,
    owner: value.owner,
    name: tokenMetadata.name || parsed.name || null,
    symbol: tokenMetadata.symbol || parsed.symbol || null,
    uri: tokenMetadata.uri || parsed.uri || null,
    decimals: supply.decimals ?? parsed.decimals ?? null,
    supply: supply.uiAmountString || supply.amount || null,
    mintAuthority: parsed.mintAuthority ?? null,
    freezeAuthority: parsed.freezeAuthority ?? null,
    isInitialized: parsed.isInitialized ?? null,
    generatedAt: new Date().toISOString(),
  }
}

async function priorityFees() {
  const res = await rpc('getRecentPrioritizationFees', [[]])
  const values = (res.result || []).map((row) => Number(row.prioritizationFee)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  const at = (p) => values.length ? values[Math.min(values.length - 1, Math.floor((values.length - 1) * p))] : 0
  return {
    samples: values.length,
    min: values[0] || 0,
    median: at(0.5),
    p90: at(0.9),
    max: values[values.length - 1] || 0,
    unit: 'micro-lamports-per-cu',
    generatedAt: new Date().toISOString(),
  }
}

function parseFeeAccounts(raw) {
  if (raw === null || raw === '') {
    const err = new Error('accounts query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const parts = String(raw).split(',').map((part) => part.trim()).filter(Boolean).slice(0, 8)
  if (parts.length === 0) {
    const err = new Error('accounts must list at least one public key')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return parts.map((part) => requirePubkey('accounts', part))
}

async function localPriorityFees(accountsRaw) {
  const accounts = parseFeeAccounts(accountsRaw)
  const res = await rpc('getRecentPrioritizationFees', [accounts])
  const values = (res.result || []).map((row) => Number(row.prioritizationFee)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  const at = (p) => values.length ? values[Math.min(values.length - 1, Math.floor((values.length - 1) * p))] : 0
  return {
    accounts,
    samples: values.length,
    min: values[0] || 0,
    median: at(0.5),
    p90: at(0.9),
    max: values[values.length - 1] || 0,
    unit: 'micro-lamports-per-cu',
    generatedAt: new Date().toISOString(),
  }
}

function makeSlug(raw) {
  const text = requireText('text', raw)
  if (text.length > 200) {
    const err = new Error('text must be 200 characters or fewer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  if (!slug) {
    const err = new Error('text must contain letters or digits')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return { text, slug, generatedAt: new Date().toISOString() }
}

function lookupLang(raw) {
  const code = requireText('code', raw).toLowerCase()
  if (!/^[a-z]{2}$/.test(code)) {
    const err = new Error('code must be ISO 639-1')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const hit = LANG_BY_CODE[code]
  if (!hit) {
    const err = new Error('unknown language code')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return { code, name: hit.name, native: hit.native, iso6391: code, generatedAt: new Date().toISOString() }
}

function lookupMime(raw) {
  const ext = requireText('ext', raw).replace(/^\./, '').toLowerCase()
  if (!/^[a-z0-9]{1,12}$/.test(ext)) {
    const err = new Error('ext must be a file extension')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const mime = MIME_BY_EXT[ext]
  if (!mime) {
    const err = new Error('unknown extension')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return { ext, mime, generatedAt: new Date().toISOString() }
}

function parseSemver(name, raw) {
  const text = requireText(name, raw).trim()
  const match = text.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/)
  if (!match) {
    const err = new Error(name + ' must be SemVer (major.minor.patch)')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return {
    raw: text,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] || null,
    build: match[5] || null,
  }
}

function compareIdent(left, right) {
  const aNum = /^\d+$/.test(left)
  const bNum = /^\d+$/.test(right)
  if (aNum && bNum) return Number(left) - Number(right)
  if (aNum) return -1
  if (bNum) return 1
  return left < right ? -1 : left > right ? 1 : 0
}

function compareSemver(aRaw, bRaw) {
  const a = parseSemver('a', aRaw)
  const b = parseSemver('b', bRaw)
  let cmp = a.major - b.major || a.minor - b.minor || a.patch - b.patch
  if (cmp === 0) {
    if (a.prerelease && !b.prerelease) cmp = -1
    else if (!a.prerelease && b.prerelease) cmp = 1
    else if (a.prerelease && b.prerelease) {
      const aParts = a.prerelease.split('.')
      const bParts = b.prerelease.split('.')
      const n = Math.max(aParts.length, bParts.length)
      for (let i = 0; i < n && cmp === 0; i++) {
        if (aParts[i] === undefined) cmp = -1
        else if (bParts[i] === undefined) cmp = 1
        else cmp = compareIdent(aParts[i], bParts[i])
      }
    }
  }
  return {
    a: a.raw,
    b: b.raw,
    cmp,
    relation: cmp < 0 ? 'lt' : cmp > 0 ? 'gt' : 'eq',
    generatedAt: new Date().toISOString(),
  }
}

function checkIsbn(raw) {
  const isbn = requireText('isbn', raw).replace(/[-\s]/g, '').toUpperCase()
  if (!/^\d{9}[\dX]$/.test(isbn) && !/^\d{13}$/.test(isbn)) {
    const err = new Error('isbn must be ISBN-10 or ISBN-13')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  let valid = false
  let isbn10 = null
  let isbn13 = null
  if (isbn.length === 10) {
    let sum = 0
    for (let i = 0; i < 9; i++) sum += Number(isbn[i]) * (10 - i)
    const check = isbn[9] === 'X' ? 10 : Number(isbn[9])
    valid = (sum + check) % 11 === 0
    isbn10 = isbn
    const core = '978' + isbn.slice(0, 9)
    let s13 = 0
    for (let i = 0; i < 12; i++) s13 += Number(core[i]) * (i % 2 === 0 ? 1 : 3)
    isbn13 = core + String((10 - (s13 % 10)) % 10)
  } else {
    let s13 = 0
    for (let i = 0; i < 12; i++) s13 += Number(isbn[i]) * (i % 2 === 0 ? 1 : 3)
    valid = Number(isbn[12]) === ((10 - (s13 % 10)) % 10)
    isbn13 = isbn
    if (isbn.startsWith('978')) {
      const core = isbn.slice(3, 12)
      let sum = 0
      for (let i = 0; i < 9; i++) sum += Number(core[i]) * (10 - i)
      const rem = (11 - (sum % 11)) % 11
      isbn10 = core + (rem === 10 ? 'X' : String(rem))
    }
  }
  return { isbn, valid, isbn10, isbn13, generatedAt: new Date().toISOString() }
}

function convertUnits(rawValue, fromRaw, toRaw) {
  const from = requireText('from', fromRaw).toLowerCase()
  const to = requireText('to', toRaw).toLowerCase()
  const value = Number(rawValue)
  const src = UNIT_TO_SI[from]
  const dst = UNIT_TO_SI[to]
  if (!src || !dst) {
    const err = new Error('from and to must be supported units: ' + Object.keys(UNIT_TO_SI).join(', '))
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  if (src.dim !== dst.dim) {
    const err = new Error('cannot convert ' + from + ' to ' + to)
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  let result
  if (src.dim === 'temp') {
    let celsius = value
    if (from === 'f') celsius = (value - 32) * 5 / 9
    if (from === 'k') celsius = value - 273.15
    result = celsius
    if (to === 'f') result = celsius * 9 / 5 + 32
    if (to === 'k') result = celsius + 273.15
  } else {
    result = value * src.factor / dst.factor
  }
  return {
    value,
    from,
    to,
    result: Number(result.toPrecision(12)),
    generatedAt: new Date().toISOString(),
  }
}

function requireIana(name, value) {
  const zone = requireText(name, value)
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date())
  } catch {
    const err = new Error(name + ' must be an IANA timezone')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  return zone
}

function convertTimezone(iso, to) {
  const zone = requireIana('to', to)
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) {
    const err = new Error('iso must be a valid timestamp')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const pick = (type) => parts.find((part) => part.type === type)?.value
  const local = `${pick('year')}-${pick('month')}-${pick('day')} ${pick('hour')}:${pick('minute')}:${pick('second')}`
  const offsetName = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value || 'GMT'
  return {
    iso: date.toISOString(),
    to: zone,
    local,
    offset: offsetName.replace('GMT', '').replace('UTC', '') || '+00:00',
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

async function addressLookupTable(tableRaw) {
  const table = requirePubkey('table', tableRaw)
  const res = await rpc('getAccountInfo', [table, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const value = res.result?.value
  if (!value) {
    const err = new Error('lookup table not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const info = value.data?.parsed?.info || {}
  const addresses = Array.isArray(info.addresses) ? info.addresses.slice(0, 32) : []
  return {
    table,
    authority: info.authority ?? null,
    deactivationSlot: info.deactivationSlot ?? null,
    lastExtendedSlot: info.lastExtendedSlot ?? null,
    lastExtendedSlotStartIndex: info.lastExtendedSlotStartIndex ?? null,
    addressCount: Array.isArray(info.addresses) ? info.addresses.length : 0,
    addresses,
    generatedAt: new Date().toISOString(),
  }
}

async function stakeAccount(stakeRaw) {
  const stake = requirePubkey('stake', stakeRaw)
  const res = await rpc('getAccountInfo', [stake, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const value = res.result?.value
  if (!value) {
    const err = new Error('stake account not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const info = value.data?.parsed?.info || {}
  const stakeInfo = info.stake?.delegation || info.delegation || {}
  const meta = info.meta || {}
  return {
    stake,
    owner: value.owner,
    lamports: value.lamports,
    voter: stakeInfo.voter ?? null,
    stakeLamports: stakeInfo.stake ?? null,
    activationEpoch: stakeInfo.activationEpoch ?? null,
    deactivationEpoch: stakeInfo.deactivationEpoch ?? null,
    warmupCooldownRate: stakeInfo.warmupCooldownRate ?? null,
    staker: meta.authorized?.staker ?? null,
    withdrawer: meta.authorized?.withdrawer ?? null,
    lockup: meta.lockup ?? null,
    generatedAt: new Date().toISOString(),
  }
}

async function nonceAccount(nonceRaw) {
  const nonce = requirePubkey('nonce', nonceRaw)
  const res = await rpc('getAccountInfo', [nonce, { encoding: 'jsonParsed', commitment: 'confirmed' }])
  const value = res.result?.value
  if (!value) {
    const err = new Error('nonce account not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const info = value.data?.parsed?.info || {}
  return {
    nonce,
    owner: value.owner,
    lamports: value.lamports,
    authority: info.authority ?? null,
    blockhash: info.blockhash ?? null,
    feeCalculator: info.feeCalculator ?? null,
    generatedAt: new Date().toISOString(),
  }
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

async function accountDataSlice(addressRaw, offsetRaw, lengthRaw) {
  const address = requirePubkey('address', addressRaw)
  if (offsetRaw === null || offsetRaw === '') {
    const err = new Error('offset query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  if (lengthRaw === null || lengthRaw === '') {
    const err = new Error('length query param is required')
    err.status = 400
    err.code = 'missing_param'
    throw err
  }
  const offset = Number(offsetRaw)
  const length = Number(lengthRaw)
  if (!Number.isInteger(offset) || offset < 0) {
    const err = new Error('offset must be a non-negative integer')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  if (!Number.isInteger(length) || length < 1 || length > 128) {
    const err = new Error('length must be an integer from 1 to 128')
    err.status = 400
    err.code = 'invalid_param'
    throw err
  }
  const res = await rpc('getAccountInfo', [address, { encoding: 'base64', commitment: 'confirmed', dataSlice: { offset, length } }])
  const value = res.result?.value
  if (!value) {
    const err = new Error('account not found')
    err.status = 404
    err.code = 'not_found'
    throw err
  }
  const data = Array.isArray(value.data) ? value.data[0] : null
  return {
    address,
    offset,
    length,
    found: true,
    lamports: value.lamports,
    owner: value.owner,
    executable: value.executable,
    data,
    encoding: 'base64',
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

async function signatureHistory(addressRaw, beforeRaw) {
  const address = requirePubkey('address', addressRaw)
  const opts = { limit: 20 }
  if (beforeRaw !== null && beforeRaw !== '') opts.before = requireSig('before', beforeRaw)
  const res = await rpc('getSignaturesForAddress', [address, opts])
  const rows = (res.result || []).map((item) => ({
    signature: item.signature,
    slot: item.slot,
    err: item.err || null,
    iso: item.blockTime ? new Date(item.blockTime * 1000).toISOString() : null,
  }))
  return {
    address,
    before: opts.before || null,
    count: rows.length,
    next: rows.length ? rows[rows.length - 1].signature : null,
    signatures: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function signatureHistoryUntil(addressRaw, untilRaw) {
  const address = requirePubkey('address', addressRaw)
  const until = requireSig('until', untilRaw)
  const res = await rpc('getSignaturesForAddress', [address, { limit: 20, until }])
  const rows = (res.result || []).map((item) => ({
    signature: item.signature,
    slot: item.slot,
    err: item.err || null,
    iso: item.blockTime ? new Date(item.blockTime * 1000).toISOString() : null,
  }))
  return {
    address,
    until,
    count: rows.length,
    next: rows.length ? rows[0].signature : null,
    signatures: rows,
    generatedAt: new Date().toISOString(),
  }
}

async function signaturesMinContextSlot(addressRaw, slotRaw) {
  const address = requirePubkey('address', addressRaw)
  const minContextSlot = parseSlot(slotRaw)
  const res = await rpc('getSignaturesForAddress', [address, { limit: 20, minContextSlot }])
  const rows = (res.result || []).map((item) => ({
    signature: item.signature,
    slot: item.slot,
    err: item.err || null,
    iso: item.blockTime ? new Date(item.blockTime * 1000).toISOString() : null,
  }))
  return {
    address,
    minContextSlot,
    count: rows.length,
    next: rows.length ? rows[rows.length - 1].signature : null,
    signatures: rows,
    generatedAt: new Date().toISOString(),
  }
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
  '/fresh': {
    validate(url) {
      const target = requireText('url', url.searchParams.get('url'))
      if (!/^https:\/\//i.test(target)) {
        const err = new Error('url must be https')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
    },
    run: async (url) => contentFresh(url.searchParams.get('url')),
  },
  '/tz': {
    validate(url) { requireIana('to', url.searchParams.get('to')) },
    run: async (url) => convertTimezone(url.searchParams.get('iso'), url.searchParams.get('to')),
  },
  '/units': {
    validate(url) { convertUnits(url.searchParams.get('value'), url.searchParams.get('from'), url.searchParams.get('to')) },
    run: async (url) => convertUnits(url.searchParams.get('value'), url.searchParams.get('from'), url.searchParams.get('to')),
  },
  '/isbn': {
    validate(url) { checkIsbn(url.searchParams.get('isbn')) },
    run: async (url) => checkIsbn(url.searchParams.get('isbn')),
  },
  '/semver': {
    validate(url) { compareSemver(url.searchParams.get('a'), url.searchParams.get('b')) },
    run: async (url) => compareSemver(url.searchParams.get('a'), url.searchParams.get('b')),
  },
  '/mime': {
    validate(url) { lookupMime(url.searchParams.get('ext')) },
    run: async (url) => lookupMime(url.searchParams.get('ext')),
  },
  '/lang': {
    validate(url) { lookupLang(url.searchParams.get('code')) },
    run: async (url) => lookupLang(url.searchParams.get('code')),
  },
  '/slug': {
    validate(url) { makeSlug(url.searchParams.get('text')) },
    run: async (url) => makeSlug(url.searchParams.get('text')),
  },
  '/fees': {
    validate() {},
    run: async () => priorityFees(),
  },
  '/supply': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => tokenSupply(url.searchParams.get('mint')),
  },
  '/tax': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => transferFee(url.searchParams.get('mint')),
  },
  '/tps': {
    validate() {},
    run: async () => clusterTps(),
  },
  '/rent': {
    validate(url) { parseSpace(url.searchParams.get('space')) },
    run: async (url) => rentExempt(url.searchParams.get('space') ?? '0'),
  },
  '/inflation': {
    validate() {},
    run: async () => inflationRate(),
  },
  '/circ': {
    validate() {},
    run: async () => circulatingSupply(),
  },
  '/votes': {
    validate() {},
    run: async () => voteCounts(),
  },
  '/whales': {
    validate() {},
    run: async () => largestAccounts(),
  },
  '/blocks': {
    validate() {},
    run: async () => blockProduction(),
  },
  '/nodes': {
    validate() {},
    run: async () => clusterNodes(),
  },
  '/ver': {
    validate() {},
    run: async () => clusterVersion(),
  },
  '/nid': {
    validate() {},
    run: async () => nodeIdentity(),
  },
  '/ok': {
    validate() {},
    run: async () => rpcHealth(),
  },
  '/gen': {
    validate() {},
    run: async () => genesisHash(),
  },
  '/epoch': {
    validate() {},
    run: async () => epochSchedule(),
  },
  '/slot': {
    validate() {},
    run: async () => currentSlot(),
  },
  '/bh': {
    validate() {},
    run: async () => latestBlockhash(),
  },
  '/ht': {
    validate() {},
    run: async () => blockHeight(),
  },
  '/txc': {
    validate() {},
    run: async () => transactionCount(),
  },
  '/ldr': {
    validate() {},
    run: async () => currentLeader(),
  },
  '/fab': {
    validate() {},
    run: async () => firstAvailableBlock(),
  },
  '/snap': {
    validate() {},
    run: async () => highestSnapshot(),
  },
  '/rtx': {
    validate() {},
    run: async () => maxRetransmitSlot(),
  },
  '/shred': {
    validate() {},
    run: async () => maxShredInsertSlot(),
  },
  '/epi': {
    validate() {},
    run: async () => epochInfo(),
  },
  '/gov': {
    validate() {},
    run: async () => inflationGovernor(),
  },
  '/valid': {
    validate(url) { requirePubkey('blockhash', url.searchParams.get('blockhash')) },
    run: async (url) => blockhashValid(url.searchParams.get('blockhash')),
  },
  '/sched': {
    validate() {},
    run: async () => leaderSchedule(),
  },
  '/reward': {
    validate(url) { requirePubkey('address', url.searchParams.get('address')) },
    run: async (url) => inflationReward(url.searchParams.get('address')),
  },
  '/btime': {
    validate(url) { parseSlot(url.searchParams.get('slot')) },
    run: async (url) => blockTime(url.searchParams.get('slot')),
  },
  '/batch': {
    validate(url) { parseAddresses(url.searchParams.get('addresses')) },
    run: async (url) => multipleAccounts(url.searchParams.get('addresses')),
  },
  '/tab': {
    validate(url) { requirePubkey('account', url.searchParams.get('account')) },
    run: async (url) => tokenAccountBalance(url.searchParams.get('account')),
  },
  '/blks': {
    validate(url) { parseBlockRange(url.searchParams.get('start'), url.searchParams.get('end')) },
    run: async (url) => confirmedBlocks(url.searchParams.get('start'), url.searchParams.get('end')),
  },
  '/stat': {
    validate(url) { parseSigs(url.searchParams.get('sigs')) },
    run: async (url) => signatureStatuses(url.searchParams.get('sigs')),
  },
  '/cmt': {
    validate(url) { parseSlot(url.searchParams.get('slot')) },
    run: async (url) => blockCommitment(url.searchParams.get('slot')),
  },
  '/ldrs': {
    validate(url) {
      parseSlot(url.searchParams.get('start'))
      parseLimit(url.searchParams.get('limit'))
    },
    run: async (url) => slotLeaders(url.searchParams.get('start'), url.searchParams.get('limit')),
  },
  '/blk': {
    validate(url) { parseSlot(url.searchParams.get('slot')) },
    run: async (url) => blockMeta(url.searchParams.get('slot')),
  },
  '/blim': {
    validate(url) {
      parseSlot(url.searchParams.get('start'))
      parseLimit(url.searchParams.get('limit'))
    },
    run: async (url) => blocksWithLimit(url.searchParams.get('start'), url.searchParams.get('limit')),
  },
  '/smin': {
    validate() {},
    run: async () => stakeMinimumDelegation(),
  },
  '/mls': {
    validate() {},
    run: async () => minimumLedgerSlot(),
  },
  '/delg': {
    validate(url) { requirePubkey('delegate', url.searchParams.get('delegate')) },
    run: async (url) => tokenAccountsByDelegate(url.searchParams.get('delegate')),
  },
  '/alt': {
    validate(url) { requirePubkey('table', url.searchParams.get('table')) },
    run: async (url) => addressLookupTable(url.searchParams.get('table')),
  },
  '/gpa': {
    validate(url) {
      requirePubkey('program', url.searchParams.get('program'))
      parseSpace(url.searchParams.get('space'))
    },
    run: async (url) => programAccounts(url.searchParams.get('program'), url.searchParams.get('space')),
  },
  '/ffm': {
    validate(url) { parseMessage(url.searchParams.get('message')) },
    run: async (url) => feeForMessage(url.searchParams.get('message')),
  },
  '/sim': {
    validate(url) { parseTx(url.searchParams.get('tx')) },
    run: async (url) => simulateTx(url.searchParams.get('tx')),
  },
  '/nce': {
    validate(url) { requirePubkey('nonce', url.searchParams.get('nonce')) },
    run: async (url) => nonceAccount(url.searchParams.get('nonce')),
  },
  '/brw': {
    validate(url) { parseSlot(url.searchParams.get('slot')) },
    run: async (url) => blockRewards(url.searchParams.get('slot')),
  },
  '/xfer': {
    validate(url) { requireSig('sig', url.searchParams.get('sig')) },
    run: async (url) => parsedTransfers(url.searchParams.get('sig')),
  },
  '/own': {
    validate(url) {
      requirePubkey('owner', url.searchParams.get('owner'))
      requirePubkey('mint', url.searchParams.get('mint'))
    },
    run: async (url) => tokenBalanceByOwnerMint(url.searchParams.get('owner'), url.searchParams.get('mint')),
  },
  '/hist': {
    validate(url) {
      requirePubkey('address', url.searchParams.get('address'))
      const before = url.searchParams.get('before')
      if (before !== null && before !== '') requireSig('before', before)
    },
    run: async (url) => signatureHistory(url.searchParams.get('address'), url.searchParams.get('before')),
  },
  '/stk': {
    validate(url) { requirePubkey('stake', url.searchParams.get('stake')) },
    run: async (url) => stakeAccount(url.searchParams.get('stake')),
  },
  '/vac': {
    validate(url) { requirePubkey('vote', url.searchParams.get('vote')) },
    run: async (url) => voteAccount(url.searchParams.get('vote')),
  },
  '/mdt': {
    validate(url) { requirePubkey('mint', url.searchParams.get('mint')) },
    run: async (url) => mintMetadata(url.searchParams.get('mint')),
  },
  '/ata': {
    validate(url) {
      requirePubkey('owner', url.searchParams.get('owner'))
      requirePubkey('mint', url.searchParams.get('mint'))
    },
    run: async (url) => associatedTokenAccount(url.searchParams.get('owner'), url.searchParams.get('mint')),
  },
  '/jts': {
    validate(url) { requireText('q', url.searchParams.get('q')) },
    run: async (url) => jupiterTokenSearch(url.searchParams.get('q')),
  },
  '/gpm': {
    validate(url) {
      requirePubkey('program', url.searchParams.get('program'))
      parseOffset(url.searchParams.get('offset'))
      parseMemcmpBytes(url.searchParams.get('bytes'))
    },
    run: async (url) => programAccountsMemcmp(url.searchParams.get('program'), url.searchParams.get('offset'), url.searchParams.get('bytes')),
  },
  '/logs': {
    validate(url) { requireSig('sig', url.searchParams.get('sig')) },
    run: async (url) => transactionLogs(url.searchParams.get('sig')),
  },
  '/pda': {
    validate(url) {
      requirePubkey('program', url.searchParams.get('program'))
      parsePdaSeeds(url.searchParams.get('seeds'))
    },
    run: async (url) => programDerivedAddress(url.searchParams.get('program'), url.searchParams.get('seeds')),
  },
  '/curv': {
    validate(url) { requirePubkey('key', url.searchParams.get('key')) },
    run: async (url) => pubkeyCurve(url.searchParams.get('key')),
  },
  '/cpi': {
    validate(url) { requireSig('sig', url.searchParams.get('sig')) },
    run: async (url) => transactionInnerInstructions(url.searchParams.get('sig')),
  },
  '/lfee': {
    validate(url) { parseFeeAccounts(url.searchParams.get('accounts')) },
    run: async (url) => localPriorityFees(url.searchParams.get('accounts')),
  },
  '/until': {
    validate(url) {
      requirePubkey('address', url.searchParams.get('address'))
      requireSig('until', url.searchParams.get('until'))
    },
    run: async (url) => signatureHistoryUntil(url.searchParams.get('address'), url.searchParams.get('until')),
  },
  '/t22': {
    validate(url) { requirePubkey('owner', url.searchParams.get('owner')) },
    run: async (url) => token2022ByOwner(url.searchParams.get('owner')),
  },
  '/circw': {
    validate() {},
    run: async () => circulatingLargestAccounts(),
  },
  '/ldad': {
    validate(url) { requireSig('sig', url.searchParams.get('sig')) },
    run: async (url) => loadedAddresses(url.searchParams.get('sig')),
  },
  '/tpu': {
    validate() {},
    run: async () => clusterTpuEndpoints(),
  },
  '/ncw': {
    validate() {},
    run: async () => nonCirculatingLargestAccounts(),
  },
  '/bpid': {
    validate(url) { requirePubkey('identity', url.searchParams.get('identity')) },
    run: async (url) => blockProductionByIdentity(url.searchParams.get('identity')),
  },
  '/rewe': {
    validate(url) {
      requirePubkey('address', url.searchParams.get('address'))
      if (url.searchParams.get('epoch') === null || url.searchParams.get('epoch') === '') {
        const err = new Error('epoch query param is required')
        err.status = 400
        err.code = 'missing_param'
        throw err
      }
      const epoch = Number(url.searchParams.get('epoch'))
      if (!Number.isInteger(epoch) || epoch < 0) {
        const err = new Error('epoch must be a non-negative integer')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
    },
    run: async (url) => inflationRewardEpoch(url.searchParams.get('address'), url.searchParams.get('epoch')),
  },
  '/lsid': {
    validate(url) { requirePubkey('identity', url.searchParams.get('identity')) },
    run: async (url) => leaderScheduleByIdentity(url.searchParams.get('identity')),
  },
  '/mcs': {
    validate(url) {
      requirePubkey('address', url.searchParams.get('address'))
      parseSlot(url.searchParams.get('slot'))
    },
    run: async (url) => signaturesMinContextSlot(url.searchParams.get('address'), url.searchParams.get('slot')),
  },
  '/aslc': {
    validate(url) {
      requirePubkey('address', url.searchParams.get('address'))
      if (url.searchParams.get('offset') === null || url.searchParams.get('offset') === '') {
        const err = new Error('offset query param is required')
        err.status = 400
        err.code = 'missing_param'
        throw err
      }
      if (url.searchParams.get('length') === null || url.searchParams.get('length') === '') {
        const err = new Error('length query param is required')
        err.status = 400
        err.code = 'missing_param'
        throw err
      }
      const offset = Number(url.searchParams.get('offset'))
      const length = Number(url.searchParams.get('length'))
      if (!Number.isInteger(offset) || offset < 0) {
        const err = new Error('offset must be a non-negative integer')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
      if (!Number.isInteger(length) || length < 1 || length > 128) {
        const err = new Error('length must be an integer from 1 to 128')
        err.status = 400
        err.code = 'invalid_param'
        throw err
      }
    },
    run: async (url) => accountDataSlice(url.searchParams.get('address'), url.searchParams.get('offset'), url.searchParams.get('length')),
  },
  '/mslc': {
    validate(url) {
      parseAddresses(url.searchParams.get('addresses'))
      parseDataSlice(url.searchParams.get('offset'), url.searchParams.get('length'))
    },
    run: async (url) => multipleAccountsSlice(url.searchParams.get('addresses'), url.searchParams.get('offset'), url.searchParams.get('length')),
  },
  '/gpsl': {
    validate(url) {
      requirePubkey('program', url.searchParams.get('program'))
      parseSpace(url.searchParams.get('space'))
      parseDataSlice(url.searchParams.get('offset'), url.searchParams.get('length'))
    },
    run: async (url) => programAccountsSlice(url.searchParams.get('program'), url.searchParams.get('space'), url.searchParams.get('offset'), url.searchParams.get('length')),
  },
  '/blkt': {
    validate(url) { parseSlot(url.searchParams.get('slot')) },
    run: async (url) => blockSignatures(url.searchParams.get('slot')),
  },
  '/vdel': {
    validate() {},
    run: async () => delinquentVoteAccounts(),
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
    { path: '/fresh', description: 'Timestamped content fingerprint for a public HTTPS URL. Query: url' },
    { path: '/tz', description: 'Convert a timestamp into any IANA timezone. Query: to, optional iso' },
    { path: '/units', description: 'Convert metric and imperial units. Query: value, from, to' },
    { path: '/isbn', description: 'Validate ISBN-10/13 and convert formats. Query: isbn' },
    { path: '/semver', description: 'Compare two SemVer versions. Query: a, b' },
    { path: '/mime', description: 'Look up MIME type from a file extension. Query: ext' },
    { path: '/lang', description: 'Look up ISO 639-1 language code. Query: code' },
    { path: '/slug', description: 'Turn text into a URL slug. Query: text' },
    { path: '/fees', description: 'Live Solana prioritization fee snapshot' },
    { path: '/supply', description: 'Current SPL token supply. Query: mint' },
    { path: '/tax', description: 'Token-2022 transfer-fee config. Query: mint' },
    { path: '/tps', description: 'Live Solana TPS from recent performance samples' },
    { path: '/rent', description: 'Minimum lamports for rent exemption. Query: space' },
    { path: '/inflation', description: 'Current Solana inflation rate' },
    { path: '/circ', description: 'Native SOL circulating and total supply' },
    { path: '/votes', description: 'Current and delinquent Solana vote-account counts' },
    { path: '/whales', description: 'Largest native SOL accounts' },
    { path: '/blocks', description: 'Current-epoch Solana block production skip rate' },
    { path: '/nodes', description: 'Live Solana gossip cluster node counts' },
    { path: '/ver', description: 'Live Solana RPC software version and feature set' },
    { path: '/nid', description: 'Live Solana RPC node identity pubkey' },
    { path: '/ok', description: 'Live Solana RPC getHealth status' },
    { path: '/gen', description: 'Live Solana cluster genesis hash' },
    { path: '/epoch', description: 'Live Solana epoch schedule parameters' },
    { path: '/slot', description: 'Live Solana current slot' },
    { path: '/bh', description: 'Live Solana latest blockhash and last valid height' },
    { path: '/ht', description: 'Live Solana finalized block height' },
    { path: '/txc', description: 'Live Solana ledger transaction count since genesis' },
    { path: '/ldr', description: 'Live Solana current slot leader identity' },
    { path: '/fab', description: 'Live Solana first available confirmed block slot' },
    { path: '/snap', description: 'Live Solana highest full and incremental snapshot slots' },
    { path: '/rtx', description: 'Live Solana max retransmit slot' },
    { path: '/shred', description: 'Live Solana max shred-insert slot' },
    { path: '/epi', description: 'Live Solana current epoch progress' },
    { path: '/gov', description: 'Live Solana inflation governor parameters' },
    { path: '/valid', description: 'Check whether a Solana blockhash is still valid' },
    { path: '/sched', description: 'Live Solana current-epoch leader schedule summary' },
    { path: '/reward', description: 'Live Solana inflation reward for a stake or vote address' },
    { path: '/btime', description: 'Live Solana estimated production time for a slot' },
    { path: '/batch', description: 'Live Solana getMultipleAccounts batch lookup' },
    { path: '/tab', description: 'Live Solana SPL token-account balance' },
    { path: '/blks', description: 'Live Solana confirmed block slots in a range' },
    { path: '/stat', description: 'Live Solana transaction confirmation statuses' },
    { path: '/cmt', description: 'Live Solana stake-weighted block commitment for a slot' },
    { path: '/ldrs', description: 'Live Solana slot-leader identities for a range' },
    { path: '/blk', description: 'Live Solana confirmed block metadata for a slot' },
    { path: '/blim', description: 'Live Solana confirmed block slots from a start slot' },
    { path: '/smin', description: 'Live Solana cluster minimum stake delegation' },
    { path: '/mls', description: 'Live Solana lowest slot still in this node ledger' },
    { path: '/delg', description: 'Live Solana SPL token accounts by approved delegate' },
    { path: '/alt', description: 'Live Solana address lookup table metadata' },
    { path: '/gpa', description: 'Live Solana size-filtered program accounts' },
    { path: '/ffm', description: 'Live Solana fee for a serialized transaction message' },
    { path: '/sim', description: 'Live Solana simulateTransaction preflight for a signed transaction' },
    { path: '/nce', description: 'Live Solana durable nonce account metadata' },
    { path: '/brw', description: 'Live Solana getBlock reward rows for a slot' },
    { path: '/xfer', description: 'Live Solana parsed SOL and SPL token transfers for a signature' },
    { path: '/own', description: 'Live Solana SPL token balance for a wallet and mint' },
    { path: '/hist', description: 'Live Solana paginated signatures for an address with a before cursor' },
    { path: '/stk', description: 'Live Solana parsed stake account delegation and authorities' },
    { path: '/vac', description: 'Live Solana vote-account commission identity and activated stake' },
    { path: '/mdt', description: 'Live Solana mint name symbol decimals supply and authorities' },
    { path: '/ata', description: 'Live Solana associated token account address and existence' },
    { path: '/jts', description: 'Live Jupiter token search by name symbol or mint' },
    { path: '/gpm', description: 'Live Solana getProgramAccounts filtered by memcmp' },
    { path: '/logs', description: 'Live Solana transaction program logs compute and error' },
    { path: '/pda', description: 'Live Solana program derived address and existence' },
    { path: '/curv', description: 'Live Solana pubkey on-curve versus PDA check' },
    { path: '/cpi', description: 'Live Solana parsed inner CPI instructions for a signature' },
    { path: '/lfee', description: 'Live Solana account-specific prioritization fees' },
    { path: '/until', description: 'Live Solana paginated signatures with an until cursor' },
    { path: '/t22', description: 'Live Solana Token-2022 accounts for a wallet' },
    { path: '/circw', description: 'Live Solana circulating largest native SOL accounts' },
    { path: '/ldad', description: 'Live Solana versioned transaction loaded addresses' },
    { path: '/tpu', description: 'Live Solana cluster TPU gossip and RPC endpoints' },
    { path: '/ncw', description: 'Live Solana non-circulating largest native SOL accounts' },
    { path: '/bpid', description: 'Live Solana block production for one validator identity' },
    { path: '/rewe', description: 'Live Solana inflation reward for a chosen epoch' },
    { path: '/lsid', description: 'Live Solana leader-schedule slots for one validator identity' },
    { path: '/mcs', description: 'Live Solana signatures after a minimum context slot' },
    { path: '/aslc', description: 'Live Solana account data slice by offset and length' },
    { path: '/mslc', description: 'Live Solana multi-account data slices by offset and length' },
    { path: '/gpsl', description: 'Live Solana program accounts with a sized data slice' },
    { path: '/blkt', description: 'Live Solana versioned block signatures for a slot' },
    { path: '/vdel', description: 'Live Solana delinquent vote accounts including unstaked' },
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
    if (url.pathname === '/manifest.json') {
      return sendFile(res, join(ROOT, 'manifest.json'), 'application/json; charset=utf-8')
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
              { name: 'content_fresh', description: 'Paid HTTPS content fingerprint (sha256 + headers). 0.005 USDC.', inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
              { name: 'timezone_convert', description: 'Paid IANA timezone convert. 0.005 USDC. Query: to, optional iso.', inputSchema: { type: 'object', properties: { to: { type: 'string' }, iso: { type: 'string' } }, required: ['to'] } },
              { name: 'unit_convert', description: 'Paid metric/imperial unit convert. 0.005 USDC.', inputSchema: { type: 'object', properties: { value: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' } }, required: ['value', 'from', 'to'] } },
              { name: 'isbn_check', description: 'Paid ISBN-10/13 validate and convert. 0.003 USDC.', inputSchema: { type: 'object', properties: { isbn: { type: 'string' } }, required: ['isbn'] } },
              { name: 'semver_compare', description: 'Paid SemVer compare. 0.003 USDC.', inputSchema: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } }, required: ['a', 'b'] } },
              { name: 'mime_lookup', description: 'Paid MIME type from file extension. 0.003 USDC.', inputSchema: { type: 'object', properties: { ext: { type: 'string' } }, required: ['ext'] } },
              { name: 'lang_lookup', description: 'Paid ISO 639-1 language lookup. 0.003 USDC.', inputSchema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] } },
              { name: 'slugify', description: 'Paid URL slug from text. 0.002 USDC.', inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
              { name: 'priority_fees', description: 'Paid Solana prioritization fee snapshot. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'token_supply', description: 'Paid SPL token supply. 0.01 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'transfer_fee', description: 'Paid Token-2022 transfer-fee lookup. 0.015 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'cluster_tps', description: 'Paid Solana TPS snapshot. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'rent_exempt', description: 'Paid rent-exemption lamports by account size. 0.01 USDC.', inputSchema: { type: 'object', properties: { space: { type: 'string' } }, required: ['space'] } },
              { name: 'inflation_rate', description: 'Paid Solana inflation rate. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'circulating_supply', description: 'Paid native SOL circulating supply. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'vote_counts', description: 'Paid Solana vote-account counts. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'largest_accounts', description: 'Paid largest native SOL accounts. 0.015 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'block_production', description: 'Paid Solana block-production skip rate. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'cluster_nodes', description: 'Paid Solana gossip cluster node counts. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'cluster_version', description: 'Paid Solana RPC software version. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'node_identity', description: 'Paid Solana RPC node identity. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'rpc_health', description: 'Paid Solana RPC getHealth status. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'genesis_hash', description: 'Paid Solana cluster genesis hash. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'epoch_schedule', description: 'Paid Solana epoch schedule. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'current_slot', description: 'Paid Solana current slot. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'latest_blockhash', description: 'Paid Solana latest blockhash. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'block_height', description: 'Paid Solana finalized block height. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'transaction_count', description: 'Paid Solana ledger transaction count. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'slot_leader', description: 'Paid Solana current slot leader. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'first_available_block', description: 'Paid Solana first available block. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'highest_snapshot', description: 'Paid Solana highest snapshot slots. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'max_retransmit_slot', description: 'Paid Solana max retransmit slot. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'max_shred_insert_slot', description: 'Paid Solana max shred-insert slot. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'epoch_info', description: 'Paid Solana current epoch progress. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'inflation_governor', description: 'Paid Solana inflation governor parameters. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'blockhash_valid', description: 'Paid Solana isBlockhashValid check. 0.005 USDC.', inputSchema: { type: 'object', properties: { blockhash: { type: 'string' } }, required: ['blockhash'] } },
              { name: 'leader_schedule', description: 'Paid Solana current-epoch leader schedule summary. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'inflation_reward', description: 'Paid Solana inflation reward for a stake or vote address. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] } },
              { name: 'block_time', description: 'Paid Solana getBlockTime for a slot. 0.005 USDC.', inputSchema: { type: 'object', properties: { slot: { type: 'string' } }, required: ['slot'] } },
              { name: 'multiple_accounts', description: 'Paid Solana getMultipleAccounts batch lookup. 0.01 USDC.', inputSchema: { type: 'object', properties: { addresses: { type: 'string' } }, required: ['addresses'] } },
              { name: 'token_account_balance', description: 'Paid Solana SPL token-account balance. 0.005 USDC.', inputSchema: { type: 'object', properties: { account: { type: 'string' } }, required: ['account'] } },
              { name: 'confirmed_blocks', description: 'Paid Solana getBlocks confirmed slot range. 0.005 USDC.', inputSchema: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' } }, required: ['start'] } },
              { name: 'signature_statuses', description: 'Paid Solana getSignatureStatuses confirmation check. 0.005 USDC.', inputSchema: { type: 'object', properties: { sigs: { type: 'string' } }, required: ['sigs'] } },
              { name: 'block_commitment', description: 'Paid Solana getBlockCommitment stake-weighted slot check. 0.005 USDC.', inputSchema: { type: 'object', properties: { slot: { type: 'string' } }, required: ['slot'] } },
              { name: 'slot_leaders', description: 'Paid Solana getSlotLeaders range. 0.005 USDC.', inputSchema: { type: 'object', properties: { start: { type: 'string' }, limit: { type: 'string' } }, required: ['start'] } },
              { name: 'block_meta', description: 'Paid Solana getBlock metadata for a slot. 0.01 USDC.', inputSchema: { type: 'object', properties: { slot: { type: 'string' } }, required: ['slot'] } },
              { name: 'blocks_with_limit', description: 'Paid Solana getBlocksWithLimit from a start slot. 0.005 USDC.', inputSchema: { type: 'object', properties: { start: { type: 'string' }, limit: { type: 'string' } }, required: ['start'] } },
              { name: 'stake_minimum', description: 'Paid Solana getStakeMinimumDelegation. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'minimum_ledger_slot', description: 'Paid Solana minimumLedgerSlot. 0.005 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'token_accounts_by_delegate', description: 'Paid Solana getTokenAccountsByDelegate. 0.01 USDC.', inputSchema: { type: 'object', properties: { delegate: { type: 'string' } }, required: ['delegate'] } },
              { name: 'address_lookup_table', description: 'Paid Solana address lookup table metadata. 0.01 USDC.', inputSchema: { type: 'object', properties: { table: { type: 'string' } }, required: ['table'] } },
              { name: 'program_accounts', description: 'Paid Solana getProgramAccounts filtered by dataSize. 0.015 USDC.', inputSchema: { type: 'object', properties: { program: { type: 'string' }, space: { type: 'string' } }, required: ['program', 'space'] } },
              { name: 'fee_for_message', description: 'Paid Solana getFeeForMessage for a serialized message. 0.01 USDC.', inputSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
              { name: 'simulate_transaction', description: 'Paid Solana simulateTransaction preflight. 0.015 USDC.', inputSchema: { type: 'object', properties: { tx: { type: 'string' } }, required: ['tx'] } },
              { name: 'nonce_account', description: 'Paid Solana durable nonce account metadata. 0.01 USDC.', inputSchema: { type: 'object', properties: { nonce: { type: 'string' } }, required: ['nonce'] } },
              { name: 'block_rewards', description: 'Paid Solana getBlock reward rows for a slot. 0.01 USDC.', inputSchema: { type: 'object', properties: { slot: { type: 'string' } }, required: ['slot'] } },
              { name: 'parsed_transfers', description: 'Paid Solana parsed SOL and SPL transfers for a signature. 0.015 USDC.', inputSchema: { type: 'object', properties: { sig: { type: 'string' } }, required: ['sig'] } },
              { name: 'owner_mint_balance', description: 'Paid Solana SPL token balance for a wallet and mint. 0.01 USDC.', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, mint: { type: 'string' } }, required: ['owner', 'mint'] } },
              { name: 'signature_history', description: 'Paid Solana paginated signatures with a before cursor. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, before: { type: 'string' } }, required: ['address'] } },
              { name: 'stake_account', description: 'Paid Solana parsed stake account delegation. 0.01 USDC.', inputSchema: { type: 'object', properties: { stake: { type: 'string' } }, required: ['stake'] } },
              { name: 'vote_account', description: 'Paid Solana vote-account commission and identity. 0.01 USDC.', inputSchema: { type: 'object', properties: { vote: { type: 'string' } }, required: ['vote'] } },
              { name: 'mint_metadata', description: 'Paid Solana mint name symbol decimals and authorities. 0.01 USDC.', inputSchema: { type: 'object', properties: { mint: { type: 'string' } }, required: ['mint'] } },
              { name: 'associated_token_account', description: 'Paid Solana ATA derive and existence check. 0.01 USDC.', inputSchema: { type: 'object', properties: { owner: { type: 'string' }, mint: { type: 'string' } }, required: ['owner', 'mint'] } },
              { name: 'jupiter_token_search', description: 'Paid Jupiter token search by name symbol or mint. 0.01 USDC.', inputSchema: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } },
              { name: 'program_accounts_memcmp', description: 'Paid Solana getProgramAccounts filtered by memcmp. 0.015 USDC.', inputSchema: { type: 'object', properties: { program: { type: 'string' }, offset: { type: 'string' }, bytes: { type: 'string' } }, required: ['program', 'offset', 'bytes'] } },
              { name: 'transaction_logs', description: 'Paid Solana transaction program logs and compute. 0.01 USDC.', inputSchema: { type: 'object', properties: { sig: { type: 'string' } }, required: ['sig'] } },
              { name: 'program_derived_address', description: 'Paid Solana PDA derive and existence check. 0.01 USDC.', inputSchema: { type: 'object', properties: { program: { type: 'string' }, seeds: { type: 'string' } }, required: ['program', 'seeds'] } },
              { name: 'pubkey_curve', description: 'Paid Solana pubkey on-curve versus PDA check. 0.005 USDC.', inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } },
              { name: 'inner_instructions', description: 'Paid Solana parsed inner CPI instructions. 0.01 USDC.', inputSchema: { type: 'object', properties: { sig: { type: 'string' } }, required: ['sig'] } },
              { name: 'local_priority_fees', description: 'Paid Solana account-specific prioritization fees. 0.01 USDC.', inputSchema: { type: 'object', properties: { accounts: { type: 'string' } }, required: ['accounts'] } },
              { name: 'signature_history_until', description: 'Paid Solana paginated signatures with an until cursor. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, until: { type: 'string' } }, required: ['address', 'until'] } },
              { name: 'token2022_accounts', description: 'Paid Solana Token-2022 accounts for a wallet. 0.01 USDC.', inputSchema: { type: 'object', properties: { owner: { type: 'string' } }, required: ['owner'] } },
              { name: 'circulating_whales', description: 'Paid Solana circulating largest native SOL accounts. 0.015 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'loaded_addresses', description: 'Paid Solana versioned transaction loaded addresses. 0.01 USDC.', inputSchema: { type: 'object', properties: { sig: { type: 'string' } }, required: ['sig'] } },
              { name: 'cluster_tpu', description: 'Paid Solana cluster TPU gossip and RPC endpoints. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'noncirculating_whales', description: 'Paid Solana non-circulating largest native SOL accounts. 0.015 USDC.', inputSchema: { type: 'object', properties: {} } },
              { name: 'block_production_identity', description: 'Paid Solana block production for one validator identity. 0.01 USDC.', inputSchema: { type: 'object', properties: { identity: { type: 'string' } }, required: ['identity'] } },
              { name: 'inflation_reward_epoch', description: 'Paid Solana inflation reward for a chosen epoch. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, epoch: { type: 'string' } }, required: ['address', 'epoch'] } },
              { name: 'leader_schedule_identity', description: 'Paid Solana leader-schedule slots for one validator identity. 0.01 USDC.', inputSchema: { type: 'object', properties: { identity: { type: 'string' } }, required: ['identity'] } },
              { name: 'signatures_min_context', description: 'Paid Solana signatures after a minimum context slot. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, slot: { type: 'string' } }, required: ['address', 'slot'] } },
              { name: 'account_data_slice', description: 'Paid Solana account data slice by offset and length. 0.01 USDC.', inputSchema: { type: 'object', properties: { address: { type: 'string' }, offset: { type: 'string' }, length: { type: 'string' } }, required: ['address', 'offset', 'length'] } },
              { name: 'multiple_account_slices', description: 'Paid Solana multi-account data slices by offset and length. 0.01 USDC.', inputSchema: { type: 'object', properties: { addresses: { type: 'string' }, offset: { type: 'string' }, length: { type: 'string' } }, required: ['addresses', 'offset', 'length'] } },
              { name: 'program_account_slices', description: 'Paid Solana program accounts with a sized data slice. 0.015 USDC.', inputSchema: { type: 'object', properties: { program: { type: 'string' }, space: { type: 'string' }, offset: { type: 'string' }, length: { type: 'string' } }, required: ['program', 'space', 'offset', 'length'] } },
              { name: 'block_signatures', description: 'Paid Solana versioned block signatures for a slot. 0.01 USDC.', inputSchema: { type: 'object', properties: { slot: { type: 'string' } }, required: ['slot'] } },
              { name: 'delinquent_votes', description: 'Paid Solana delinquent vote accounts including unstaked. 0.01 USDC.', inputSchema: { type: 'object', properties: {} } },
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
        content_fresh: '/fresh',
        timezone_convert: '/tz',
        unit_convert: '/units',
        isbn_check: '/isbn',
        semver_compare: '/semver',
        mime_lookup: '/mime',
        lang_lookup: '/lang',
        slugify: '/slug',
        priority_fees: '/fees',
        token_supply: '/supply',
        transfer_fee: '/tax',
        cluster_tps: '/tps',
        rent_exempt: '/rent',
        inflation_rate: '/inflation',
        circulating_supply: '/circ',
        vote_counts: '/votes',
        largest_accounts: '/whales',
        block_production: '/blocks',
        cluster_nodes: '/nodes',
        cluster_version: '/ver',
        node_identity: '/nid',
        rpc_health: '/ok',
        genesis_hash: '/gen',
        epoch_schedule: '/epoch',
        current_slot: '/slot',
        latest_blockhash: '/bh',
        block_height: '/ht',
        transaction_count: '/txc',
        slot_leader: '/ldr',
        first_available_block: '/fab',
        highest_snapshot: '/snap',
        max_retransmit_slot: '/rtx',
        max_shred_insert_slot: '/shred',
        epoch_info: '/epi',
        inflation_governor: '/gov',
        blockhash_valid: '/valid',
        leader_schedule: '/sched',
        inflation_reward: '/reward',
        block_time: '/btime',
        multiple_accounts: '/batch',
        token_account_balance: '/tab',
        confirmed_blocks: '/blks',
        signature_statuses: '/stat',
        block_commitment: '/cmt',
        slot_leaders: '/ldrs',
        block_meta: '/blk',
        blocks_with_limit: '/blim',
        stake_minimum: '/smin',
        minimum_ledger_slot: '/mls',
        token_accounts_by_delegate: '/delg',
        address_lookup_table: '/alt',
        program_accounts: '/gpa',
        fee_for_message: '/ffm',
        simulate_transaction: '/sim',
        nonce_account: '/nce',
        block_rewards: '/brw',
        parsed_transfers: '/xfer',
        owner_mint_balance: '/own',
        signature_history: '/hist',
        stake_account: '/stk',
        vote_account: '/vac',
        mint_metadata: '/mdt',
        associated_token_account: '/ata',
        jupiter_token_search: '/jts',
        program_accounts_memcmp: '/gpm',
        transaction_logs: '/logs',
        program_derived_address: '/pda',
        pubkey_curve: '/curv',
        inner_instructions: '/cpi',
        local_priority_fees: '/lfee',
        signature_history_until: '/until',
        token2022_accounts: '/t22',
        circulating_whales: '/circw',
        loaded_addresses: '/ldad',
        cluster_tpu: '/tpu',
        noncirculating_whales: '/ncw',
        block_production_identity: '/bpid',
        inflation_reward_epoch: '/rewe',
        leader_schedule_identity: '/lsid',
        signatures_min_context: '/mcs',
        account_data_slice: '/aslc',
        multiple_account_slices: '/mslc',
        program_account_slices: '/gpsl',
        block_signatures: '/blkt',
        delinquent_votes: '/vdel',
      }[body.params?.name]
      if (body.method === 'tools/call' && paidTool) {
        const required = paymentRequired(paidTool, 'https://meant-aye-allan-exit.trycloudflare.com')
        return json(res, 402, required, { 'PAYMENT-REQUIRED': encodeHeader(required) })
      }
      return json(res, 200, { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } })
    }
    if (url.pathname === '/.well-known/mcp.json' || url.pathname === '/mcp') {
      return json(res, 200, {
        name: 'solana-pulse-xaas',
        description: 'Solana quotes and package preflight for agents. Free /sample. Paid Jupiter quote 0.01 USDC, license 0.10, preflight 0.15.',
        transport: 'http',
        url: 'https://meant-aye-allan-exit.trycloudflare.com/mcp',
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
      const origin = 'https://' + (req.headers.host || 'meant-aye-allan-exit.trycloudflare.com')
      const required = paymentRequired(url.pathname, origin.startsWith('https://127.') ? 'https://meant-aye-allan-exit.trycloudflare.com' : origin)
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
