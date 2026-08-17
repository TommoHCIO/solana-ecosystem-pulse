# Solana Ecosystem Pulse

No-API-key report on Solana network health, validators, economics, and a few live ecosystem signals.

Built for the Superteam Canada listing [Develop Solana Ecosystem Auto-Updating Report & Interactive Dashboard](https://earn.superteam.fun/listing/develop-solana-ecosystem-auto-updating-report-and-interactive-dashboard).

## What it produces

```
out/report.json   machine-readable snapshot
out/report.md     human-readable Markdown
out/index.html    dark interactive dashboard
```

Refresh interval is configurable. Default is 60 seconds.

## Data sources

No vendor API keys. Public HTTP only.

| Source | Used for |
| --- | --- |
| Solana JSON-RPC (`getHealth`, `getEpochInfo`, `getRecentPerformanceSamples`, `getVoteAccounts`, `getSupply`) | TPS, slot/block time, epoch, validators, circulating supply |
| [CoinGecko](https://api.coingecko.com/api/v3/simple/price) public endpoint | SOL USD price and 24h change |
| [DefiLlama](https://api.llama.fi/v2/historicalChainTvl/Solana) public endpoint | Solana TVL |
| [solana.com/data](https://solana.com/data) linked from the dashboard | Official ecosystem data page |

Twitter sentiment is intentionally omitted. It needs keys or scrapers and the listing prefers no-key solutions.

## Run

Python 3.10+ stdlib only.

```bash
python pulse.py
python pulse.py --once
python pulse.py --rpc https://api.mainnet-beta.solana.com --interval 120
```

`--once` writes one snapshot and exits. Without it, the process refreshes until interrupted.

Open `out/index.html` in a browser. For a hosted demo, serve the `out/` folder with any static host.

## Anomaly checks

Each snapshot flags:

- RPC health not `ok`
- recent sample TPS below 500 or above 8000
- mean slot time above 600 ms
- delinquent validators above 5% of the vote set
- SOL 24h move beyond 8%
- Solana TVL 24h move beyond 8% when two samples exist

## Layout

```
pulse.py          collector + writer
README.md         this file
out/              generated artifacts (created on first run)
```

## Wallet

If this listing pays, send native SOL or USDG/USDC that can be swapped to SOL to:

`4tdArRo4cvUQcTm88egZeWwY1HpJsZiCAKLzSnUSdVTA`
