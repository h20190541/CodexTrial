const button = document.getElementById('recommendButton');
const stockDataInput = document.getElementById('stockData');
const summaryText = document.getElementById('summaryText');
const buyList = document.getElementById('buyList');
const resultsTableBody = document.getElementById('resultsTableBody');

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const numericFields = [
  'trendStrength',
  'volatility',
  'newsSentiment',
  'sectorMomentum',
  'rsi',
  'dmaGap',
  'macd',
  'volume',
  'revenueGrowth',
  'earningsGrowth',
  'debtEquity',
  'roe',
];

function parseCsvLine(line) {
  const parts = line.split(',').map((part) => part.trim());
  if (parts.length !== 13) {
    return null;
  }

  const stock = parts[0];
  const values = {
    stock,
    trendStrength: Number.parseFloat(parts[1]),
    volatility: Number.parseFloat(parts[2]),
    newsSentiment: Number.parseFloat(parts[3]),
    sectorMomentum: Number.parseFloat(parts[4]),
    rsi: Number.parseFloat(parts[5]),
    dmaGap: Number.parseFloat(parts[6]),
    macd: Number.parseFloat(parts[7]),
    volume: Number.parseFloat(parts[8]),
    revenueGrowth: Number.parseFloat(parts[9]),
    earningsGrowth: Number.parseFloat(parts[10]),
    debtEquity: Number.parseFloat(parts[11]),
    roe: Number.parseFloat(parts[12]),
  };

  const hasInvalidNumber = numericFields.some((field) => !Number.isFinite(values[field]));
  if (!stock || hasInvalidNumber) {
    return null;
  }

  return values;
}

function computeScore(v) {
  const trendScore =
    clamp(v.trendStrength, 0, 100) * 0.15 +
    clamp(v.newsSentiment, -100, 100) * 0.06 +
    clamp(v.sectorMomentum, 0, 100) * 0.1 -
    clamp(v.volatility, 0, 100) * 0.08;

  const technicalScore =
    (50 - Math.abs(clamp(v.rsi, 0, 100) - 50)) * 0.18 +
    clamp(v.dmaGap, -50, 50) * 0.28 +
    clamp(v.macd, -100, 100) * 0.18 +
    clamp(v.volume, 0, 100) * 0.1;

  const fundamentalScore =
    clamp(v.revenueGrowth, -100, 200) * 0.18 +
    clamp(v.earningsGrowth, -100, 200) * 0.2 +
    (2 - clamp(v.debtEquity, 0, 10)) * 10 +
    clamp(v.roe, -100, 100) * 0.16;

  return trendScore + technicalScore + fundamentalScore;
}

function buildReasons(v) {
  const reasons = [];
  if (v.trendStrength > 60 && v.sectorMomentum > 55) {
    reasons.push('Strong market and sector momentum.');
  }
  if (v.volatility > 70) {
    reasons.push('High volatility risk.');
  }
  if (v.rsi > 70) {
    reasons.push('RSI overbought warning.');
  } else if (v.rsi < 30) {
    reasons.push('RSI oversold rebound setup.');
  }
  if (v.revenueGrowth > 10 && v.earningsGrowth > 10) {
    reasons.push('Strong revenue and earnings growth.');
  }
  if (v.debtEquity > 2) {
    reasons.push('Elevated debt-to-equity.');
  }
  if (v.roe > 15) {
    reasons.push('Healthy return on equity.');
  }
  if (reasons.length === 0) {
    reasons.push('No dominant factor detected.');
  }
  return reasons;
}

function recommendationFromScore(score) {
  if (score >= 70) {
    return { label: 'BUY', className: 'buy' };
  }
  if (score >= 40) {
    return { label: 'HOLD / WATCH', className: 'hold' };
  }
  return { label: 'SELL / AVOID', className: 'sell' };
}

function renderResults(results) {
  const buyCandidates = results.filter((entry) => entry.signal.label === 'BUY');
  summaryText.textContent = `Processed ${results.length} stocks. Found ${buyCandidates.length} buy candidate(s).`;

  buyList.innerHTML = '';
  if (buyCandidates.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No BUY signals in the provided list.';
    buyList.appendChild(item);
  } else {
    buyCandidates.forEach((entry) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${entry.stock}</strong> — score ${entry.score.toFixed(1)} (${entry.reasons[0]})`;
      buyList.appendChild(item);
    });
  }

  resultsTableBody.innerHTML = '';
  results.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.stock}</td>
      <td>${entry.score.toFixed(1)}</td>
      <td><span class="tag ${entry.signal.className}">${entry.signal.label}</span></td>
      <td>${entry.reasons[0]}</td>
    `;
    resultsTableBody.appendChild(row);
  });
}

button.addEventListener('click', () => {
  const lines = stockDataInput.value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedStocks = lines.map(parseCsvLine).filter(Boolean);

  if (parsedStocks.length === 0) {
    summaryText.textContent = 'No valid rows found. Please provide CSV rows in the expected format.';
    buyList.innerHTML = '';
    resultsTableBody.innerHTML = '';
    return;
  }

  const results = parsedStocks
    .map((stockValues) => {
      const score = computeScore(stockValues);
      return {
        stock: stockValues.stock,
        score,
        signal: recommendationFromScore(score),
        reasons: buildReasons(stockValues),
      };
    })
    .sort((a, b) => b.score - a.score);

  renderResults(results);
});
