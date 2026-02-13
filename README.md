# Local Stock Recommendation Studio

A local website that analyzes a **list of stocks** and returns:

- Which stocks are **BUY** candidates
- A ranked table of all submitted stocks with score, signal, and reason

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Input format

Provide one stock per line in CSV format:

```text
Stock,TrendStrength,Volatility,NewsSentiment,SectorMomentum,RSI,DmaGap,MACD,Volume,RevenueGrowth,EarningsGrowth,DebtEquity,ROE
```

Example:

```text
AAPL,78,35,22,74,56,9,21,72,11,14,1.5,26
MSFT,74,31,18,69,52,8,17,70,13,16,0.7,31
```

## Notes

- The app runs fully in the browser and does not need a backend.
- Output is educational and not investment advice.
