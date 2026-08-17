#!/usr/bin/env python3
"""Collect a no-key Solana ecosystem snapshot and write JSON, Markdown, HTML."""

from __future__ import annotations

import argparse
import json
import statistics
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
UA = {"User-Agent": "solana-ecosystem-pulse/1.0", "Accept": "application/json"}


def http_json(url: str, payload: dict | None = None, timeout: int = 20) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    headers = dict(UA)
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def rpc(url: str, method: str, params: list | None = None) -> object:
    body = http_json(url, {"jsonrpc": "2.0", "id": 1, "method": method, "params": params or []})
    if body.get("error"):
        raise RuntimeError(f"{method}: {body['error']}")
    return body.get("result")


def safe(label: str, fn):
    try:
        return fn(), None
    except Exception as exc:  # noqa: BLE001 — collector must keep going
        return None, f"{label}: {exc}"


def collect(rpc_url: str) -> dict:
    errors: list[str] = []
    now = datetime.now(timezone.utc).isoformat()

    health, err = safe("getHealth", lambda: rpc(rpc_url, "getHealth"))
    if err:
        errors.append(err)
    epoch, err = safe("getEpochInfo", lambda: rpc(rpc_url, "getEpochInfo"))
    if err:
        errors.append(err)
    samples, err = safe(
        "getRecentPerformanceSamples",
        lambda: rpc(rpc_url, "getRecentPerformanceSamples", [20]),
    )
    if err:
        errors.append(err)
    votes, err = safe("getVoteAccounts", lambda: rpc(rpc_url, "getVoteAccounts"))
    if err:
        errors.append(err)
    supply, err = safe("getSupply", lambda: rpc(rpc_url, "getSupply", [{"commitment": "confirmed"}]))
    if err:
        errors.append(err)
    price, err = safe(
        "coingecko",
        lambda: http_json(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true"
        ),
    )
    if err:
        errors.append(err)
    tvl, err = safe("defillama", lambda: http_json("https://api.llama.fi/v2/historicalChainTvl/Solana"))
    if err:
        errors.append(err)

    tps_values = []
    slot_ms_values = []
    if isinstance(samples, list):
        for sample in samples:
            num_tx = float(sample.get("numTransactions") or 0)
            slots = float(sample.get("numSlots") or 0)
            secs = float(sample.get("samplePeriodSecs") or 0)
            if secs > 0:
                tps_values.append(num_tx / secs)
            if slots > 0 and secs > 0:
                slot_ms_values.append((secs / slots) * 1000)

    current = votes.get("current") if isinstance(votes, dict) else []
    delinquent = votes.get("delinquent") if isinstance(votes, dict) else []
    current = current if isinstance(current, list) else []
    delinquent = delinquent if isinstance(delinquent, list) else []
    vote_total = len(current) + len(delinquent)
    delinquent_pct = (len(delinquent) / vote_total * 100) if vote_total else None
    stake_current = sum(int(item.get("activatedStake") or 0) for item in current)
    stake_delinquent = sum(int(item.get("activatedStake") or 0) for item in delinquent)
    top = sorted(current, key=lambda item: int(item.get("activatedStake") or 0), reverse=True)[:8]

    sol = price.get("solana") if isinstance(price, dict) else {}
    sol = sol if isinstance(sol, dict) else {}
    tvl_points = tvl if isinstance(tvl, list) else []
    tvl_now = tvl_points[-1] if tvl_points else None
    tvl_prev = tvl_points[-2] if len(tvl_points) >= 2 else None
    tvl_usd = tvl_now.get("tvl") if isinstance(tvl_now, dict) else None
    tvl_change = None
    if isinstance(tvl_now, dict) and isinstance(tvl_prev, dict):
        prev_val = tvl_prev.get("tvl")
        now_val = tvl_now.get("tvl")
        if prev_val:
            tvl_change = (float(now_val) - float(prev_val)) / float(prev_val) * 100

    mean_tps = statistics.fmean(tps_values) if tps_values else None
    mean_slot_ms = statistics.fmean(slot_ms_values) if slot_ms_values else None
    epoch = epoch if isinstance(epoch, dict) else {}
    supply = supply.get("value") if isinstance(supply, dict) else {}
    circulating = supply.get("circulating") if isinstance(supply, dict) else None
    total_supply = supply.get("total") if isinstance(supply, dict) else None

    anomalies = []
    if health not in (None, "ok"):
        anomalies.append(f"RPC health is {health!r}")
    if mean_tps is not None and mean_tps < 500:
        anomalies.append(f"TPS low: {mean_tps:.1f}")
    if mean_tps is not None and mean_tps > 8000:
        anomalies.append(f"TPS spike: {mean_tps:.1f}")
    if mean_slot_ms is not None and mean_slot_ms > 600:
        anomalies.append(f"slow slots: {mean_slot_ms:.1f} ms")
    if delinquent_pct is not None and delinquent_pct > 5:
        anomalies.append(f"delinquent validators {delinquent_pct:.2f}%")
    change_24h = sol.get("usd_24h_change")
    if isinstance(change_24h, (int, float)) and abs(change_24h) > 8:
        anomalies.append(f"SOL 24h move {change_24h:.2f}%")
    if tvl_change is not None and abs(tvl_change) > 8:
        anomalies.append(f"TVL move {tvl_change:.2f}%")

    return {
        "generatedAt": now,
        "rpc": rpc_url,
        "errors": errors,
        "anomalies": anomalies,
        "network": {
            "health": health,
            "absoluteSlot": epoch.get("absoluteSlot"),
            "blockHeight": epoch.get("blockHeight"),
            "epoch": epoch.get("epoch"),
            "slotIndex": epoch.get("slotIndex"),
            "slotsInEpoch": epoch.get("slotsInEpoch"),
            "transactionCount": epoch.get("transactionCount"),
            "meanTps": mean_tps,
            "meanSlotMs": mean_slot_ms,
            "sampleCount": len(tps_values),
        },
        "validators": {
            "active": len(current),
            "delinquent": len(delinquent),
            "delinquentPct": delinquent_pct,
            "activatedStakeLamports": stake_current,
            "delinquentStakeLamports": stake_delinquent,
            "top": [
                {
                    "votePubkey": item.get("votePubkey"),
                    "nodePubkey": item.get("nodePubkey"),
                    "activatedStake": int(item.get("activatedStake") or 0),
                    "commission": item.get("commission"),
                }
                for item in top
            ],
        },
        "economics": {
            "solUsd": sol.get("usd"),
            "solUsdChange24h": change_24h,
            "circulatingLamports": circulating,
            "totalLamports": total_supply,
            "tvlUsd": tvl_usd,
            "tvlChangeApprox24hPct": tvl_change,
        },
        "sources": [
            "solana json-rpc",
            "https://api.coingecko.com/api/v3/simple/price",
            "https://api.llama.fi/v2/historicalChainTvl/Solana",
            "https://solana.com/data",
        ],
    }


def fmt(value, digits=2, suffix=""):
    if value is None:
        return "n/a"
    if isinstance(value, float):
        return f"{value:,.{digits}f}{suffix}"
    if isinstance(value, int):
        return f"{value:,}{suffix}"
    return str(value)


def write_markdown(snap: dict) -> str:
    net = snap["network"]
    val = snap["validators"]
    eco = snap["economics"]
    anomalies = snap["anomalies"] or ["none"]
    errors = snap["errors"] or ["none"]
    lines = [
        f"# Solana Ecosystem Pulse",
        "",
        f"Generated: `{snap['generatedAt']}`",
        f"RPC: `{snap['rpc']}`",
        "",
        "## Network",
        "",
        f"- Health: **{net['health']}**",
        f"- Epoch: {fmt(net['epoch'], 0)} ({fmt(net['slotIndex'], 0)} / {fmt(net['slotsInEpoch'], 0)})",
        f"- Slot / block height: {fmt(net['absoluteSlot'], 0)} / {fmt(net['blockHeight'], 0)}",
        f"- Mean TPS (last samples): {fmt(net['meanTps'], 1)}",
        f"- Mean slot time: {fmt(net['meanSlotMs'], 1)} ms",
        f"- Lifetime transactions: {fmt(net['transactionCount'], 0)}",
        "",
        "## Validators",
        "",
        f"- Active: {fmt(val['active'], 0)}",
        f"- Delinquent: {fmt(val['delinquent'], 0)} ({fmt(val['delinquentPct'], 2)}%)",
        "",
        "| Vote | Node | Stake (SOL) | Commission |",
        "| --- | --- | ---: | ---: |",
    ]
    for item in val["top"]:
        stake_sol = int(item["activatedStake"]) / 1_000_000_000
        lines.append(
            f"| `{item['votePubkey']}` | `{item['nodePubkey']}` | {stake_sol:,.0f} | {item['commission']}% |"
        )
    lines += [
        "",
        "## Economics",
        "",
        f"- SOL: ${fmt(eco['solUsd'], 2)} ({fmt(eco['solUsdChange24h'], 2)}% 24h)",
        f"- Circulating / total: {fmt((eco['circulatingLamports'] or 0) / 1e9, 0)} / {fmt((eco['totalLamports'] or 0) / 1e9, 0)} SOL",
        f"- Solana TVL: ${fmt(eco['tvlUsd'], 0)} ({fmt(eco['tvlChangeApprox24hPct'], 2)}% vs prior DefiLlama point)",
        "",
        "## Anomalies",
        "",
    ]
    lines += [f"- {item}" for item in anomalies]
    lines += ["", "## Collector errors", ""]
    lines += [f"- {item}" for item in errors]
    lines += [
        "",
        "## Sources",
        "",
    ]
    lines += [f"- {item}" for item in snap["sources"]]
    lines.append("")
    return "\n".join(lines)


def write_html(snap: dict) -> str:
    payload = json.dumps(snap, indent=2)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Solana Ecosystem Pulse</title>
  <style>
    :root {{ color-scheme: dark; }}
    body {{ margin: 0; font: 15px/1.45 ui-sans-serif, system-ui, sans-serif; background: #0b1020; color: #e8edf7; }}
    main {{ max-width: 980px; margin: 0 auto; padding: 28px 20px 64px; }}
    h1 {{ font-size: 28px; margin: 0 0 8px; }}
    .muted {{ color: #93a0bb; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 20px 0; }}
    .card {{ background: #151b2e; border: 1px solid #243049; border-radius: 12px; padding: 14px; }}
    .label {{ font-size: 12px; color: #93a0bb; text-transform: uppercase; letter-spacing: .04em; }}
    .value {{ font-size: 22px; margin-top: 6px; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
    th, td {{ text-align: left; padding: 8px 6px; border-bottom: 1px solid #243049; }}
    code {{ color: #9ad1ff; }}
    .bad {{ color: #ffb4b4; }}
    a {{ color: #8ab4ff; }}
  </style>
</head>
<body>
  <main>
    <h1>Solana Ecosystem Pulse</h1>
    <p class="muted">Generated <span id="when"></span> · RPC <code id="rpc"></code></p>
    <div class="grid" id="cards"></div>
    <section class="card">
      <div class="label">Anomalies</div>
      <ul id="anomalies"></ul>
    </section>
    <h2>Top validators by stake</h2>
    <table>
      <thead><tr><th>Vote</th><th>Commission</th><th>Stake SOL</th></tr></thead>
      <tbody id="validators"></tbody>
    </table>
    <p class="muted">Official page: <a href="https://solana.com/data">solana.com/data</a>. Refresh by rerunning <code>python pulse.py</code>.</p>
  </main>
  <script>
    const snap = {payload};
    const fmt = (v, d=2) => v == null ? "n/a" : Number(v).toLocaleString(undefined, {{maximumFractionDigits: d}});
    document.getElementById("when").textContent = snap.generatedAt;
    document.getElementById("rpc").textContent = snap.rpc;
    const cards = [
      ["Health", snap.network.health],
      ["Mean TPS", fmt(snap.network.meanTps, 1)],
      ["Slot ms", fmt(snap.network.meanSlotMs, 1)],
      ["Epoch", fmt(snap.network.epoch, 0)],
      ["Active vals", fmt(snap.validators.active, 0)],
      ["Delinquent %", fmt(snap.validators.delinquentPct, 2)],
      ["SOL USD", "$" + fmt(snap.economics.solUsd, 2)],
      ["TVL USD", "$" + fmt(snap.economics.tvlUsd, 0)],
    ];
    document.getElementById("cards").innerHTML = cards.map(([k,v]) =>
      `<div class="card"><div class="label">${{k}}</div><div class="value">${{v}}</div></div>`
    ).join("");
    const anomalies = snap.anomalies.length ? snap.anomalies : ["none"];
    document.getElementById("anomalies").innerHTML = anomalies.map(a => `<li class="${{snap.anomalies.length ? "bad" : ""}}">${{a}}</li>`).join("");
    document.getElementById("validators").innerHTML = snap.validators.top.map(v =>
      `<tr><td><code>${{v.votePubkey}}</code></td><td>${{v.commission}}%</td><td>${{fmt(v.activatedStake/1e9, 0)}}</td></tr>`
    ).join("");
  </script>
</body>
</html>
"""


def write_outputs(snap: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "report.json").write_text(json.dumps(snap, indent=2) + "\n", encoding="utf-8")
    (OUT / "report.md").write_text(write_markdown(snap), encoding="utf-8")
    (OUT / "index.html").write_text(write_html(snap), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rpc", default="https://api.mainnet-beta.solana.com")
    parser.add_argument("--interval", type=int, default=60)
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()
    while True:
        snap = collect(args.rpc)
        write_outputs(snap)
        print(f"wrote {OUT} at {snap['generatedAt']} anomalies={len(snap['anomalies'])} errors={len(snap['errors'])}")
        if args.once:
            return 0
        time.sleep(max(15, args.interval))


if __name__ == "__main__":
    raise SystemExit(main())
