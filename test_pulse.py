import unittest
from pulse import fmt, write_markdown


class PulseTests(unittest.TestCase):
    def test_fmt_handles_missing_and_numbers(self):
        self.assertEqual(fmt(None), "n/a")
        self.assertEqual(fmt(12.345, 1), "12.3")
        self.assertEqual(fmt(1000, 0), "1,000")

    def test_markdown_includes_core_sections(self):
        snap = {
            "generatedAt": "2026-08-17T00:00:00+00:00",
            "rpc": "https://example.invalid",
            "errors": [],
            "anomalies": ["none-test"],
            "network": {
                "health": "ok",
                "absoluteSlot": 1,
                "blockHeight": 1,
                "epoch": 1,
                "slotIndex": 1,
                "slotsInEpoch": 2,
                "transactionCount": 3,
                "meanTps": 1200.0,
                "meanSlotMs": 400.0,
                "sampleCount": 1,
            },
            "validators": {
                "active": 1,
                "delinquent": 0,
                "delinquentPct": 0.0,
                "activatedStakeLamports": 1,
                "delinquentStakeLamports": 0,
                "top": [{
                    "votePubkey": "Vote111111111111111111111111111111111111111",
                    "nodePubkey": "Node111111111111111111111111111111111111111",
                    "activatedStake": 1_000_000_000,
                    "commission": 7,
                }],
            },
            "economics": {
                "solUsd": 75.0,
                "solUsdChange24h": -0.2,
                "circulatingLamports": 1_000_000_000,
                "totalLamports": 2_000_000_000,
                "tvlUsd": 1.0,
                "tvlChangeApprox24hPct": 0.1,
            },
            "sources": ["solana json-rpc"],
        }
        md = write_markdown(snap)
        self.assertIn("# Solana Ecosystem Pulse", md)
        self.assertIn("Mean TPS", md)
        self.assertIn("none-test", md)


if __name__ == "__main__":
    unittest.main()
