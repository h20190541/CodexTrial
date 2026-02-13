const inputIds = [
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

const button = document.getElementById('recommendButton');
const recommendationText = document.getElementById('recommendationText');
const scoreText = document.getElementById('scoreText');
const reasonList = document.getElementById('reasonList');

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

function readInputs() {
  const values = {};
  for (const id of inputIds) {
    const parsed = Number.parseFloat(document.getElementById(id).value);
    values[id] = Number.isFinite(parsed) ? parsed : 0;
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
    reasons.push('Market and sector momentum are supportive for upside continuation.');
  }
  if (v.volatility > 70) {
    reasons.push('High volatility increases risk and can invalidate setups quickly.');
  }
  if (v.rsi > 70) {
    reasons.push('RSI is overbought, so near-term pullback risk is elevated.');
  } else if (v.rsi < 30) {
    reasons.push('RSI is oversold, indicating possible rebound conditions.');
  }
  if (v.revenueGrowth > 10 && v.earningsGrowth > 10) {
    reasons.push('Strong revenue and earnings growth suggest healthy business momentum.');
  }
  if (v.debtEquity > 2) {
    reasons.push('Debt-to-equity is elevated, which may pressure valuation and risk.');
  }
  if (v.roe > 15) {
    reasons.push('Return on equity indicates efficient capital utilization.');
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

button.addEventListener('click', () => {
  const values = readInputs();
  const score = computeScore(values);
  const reasons = buildReasons(values);
  const { label, className } = recommendationFromScore(score);

  recommendationText.innerHTML = `Signal: <span class="tag ${className}">${label}</span>`;
  scoreText.textContent = `Composite score: ${score.toFixed(1)} / 100+`;
  reasonList.innerHTML = '';

  if (reasons.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No dominant factor detected; consider collecting more data.';
    reasonList.appendChild(item);
    return;
  }

  reasons.forEach((reason) => {
    const item = document.createElement('li');
    item.textContent = reason;
    reasonList.appendChild(item);
  });
});
