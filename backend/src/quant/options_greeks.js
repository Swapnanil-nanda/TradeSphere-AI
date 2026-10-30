// Black-Scholes-Merton Options Pricing & Greeks Analytics

// Standard Normal cumulative distribution function
function cdf(x) {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * y);
}

// Standard Normal probability density function
function pdf(x) {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

export function blackScholes({ spot, strike, timeYears, rate = 0.065, vol = 0.16, type = 'call' }) {
  if (timeYears <= 0.0001) {
    const intrinsic = type === 'call' ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
    return {
      price: intrinsic,
      delta: type === 'call' ? (spot > strike ? 1 : 0) : (spot < strike ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0
    };
  }

  const d1 = (Math.log(spot / strike) + (rate + (vol * vol) / 2) * timeYears) / (vol * Math.sqrt(timeYears));
  const d2 = d1 - vol * Math.sqrt(timeYears);

  let price = 0;
  let delta = 0;

  if (type === 'call') {
    price = spot * cdf(d1) - strike * Math.exp(-rate * timeYears) * cdf(d2);
    delta = cdf(d1);
  } else {
    price = strike * Math.exp(-rate * timeYears) * cdf(-d2) - spot * cdf(-d1);
    delta = cdf(d1) - 1;
  }

  const gamma = pdf(d1) / (spot * vol * Math.sqrt(timeYears));
  const vega = (spot * pdf(d1) * Math.sqrt(timeYears)) / 100; // 1% vol change

  let theta = 0;
  if (type === 'call') {
    theta = (-(spot * pdf(d1) * vol) / (2 * Math.sqrt(timeYears)) - rate * strike * Math.exp(-rate * timeYears) * cdf(d2)) / 365;
  } else {
    theta = (-(spot * pdf(d1) * vol) / (2 * Math.sqrt(timeYears)) + rate * strike * Math.exp(-rate * timeYears) * cdf(-d2)) / 365;
  }

  return {
    price: Math.max(0.05, Math.round(price * 100) / 100),
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 10000) / 10000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100
  };
}

// Generate an entire options chain around the spot price
export function generateOptionsChain(symbol, spotPrice, daysToExpiry = 7) {
  const timeYears = daysToExpiry / 365;
  const rate = symbol.includes('NIFTY') ? 0.065 : 0.045; // 6.5% India, 4.5% US
  const strikeInterval = spotPrice > 10000 ? 50 : spotPrice > 1000 ? 20 : 5;
  const centerStrike = Math.round(spotPrice / strikeInterval) * strikeInterval;

  const chain = [];
  const strikesCount = 11; // 5 ITM, 1 ATM, 5 OTM

  for (let i = -5; i <= 5; i++) {
    const strike = centerStrike + (i * strikeInterval);
    // Skew IV slightly higher for OTM Puts (volatility smile)
    const moneyness = Math.log(strike / spotPrice);
    const iv = Math.max(0.10, Math.min(0.45, 0.15 + (moneyness * moneyness) * 0.8));

    const call = blackScholes({ spot: spotPrice, strike, timeYears, rate, vol: iv, type: 'call' });
    const put = blackScholes({ spot: spotPrice, strike, timeYears, rate, vol: iv, type: 'put' });

    chain.push({
      strike,
      call: {
        ltp: call.price,
        bid: Math.round((call.price * 0.99) * 100) / 100,
        ask: Math.round((call.price * 1.01) * 100) / 100,
        iv: Math.round(iv * 1000) / 10,
        delta: call.delta,
        gamma: call.gamma,
        theta: call.theta,
        vega: call.vega,
        oi: Math.floor(Math.random() * 450000) + 120000
      },
      put: {
        ltp: put.price,
        bid: Math.round((put.price * 0.99) * 100) / 100,
        ask: Math.round((put.price * 1.01) * 100) / 100,
        iv: Math.round(iv * 1000) / 10,
        delta: put.delta,
        gamma: put.gamma,
        theta: put.theta,
        vega: put.vega,
        oi: Math.floor(Math.random() * 450000) + 120000
      }
    });
  }

  return {
    symbol,
    spotPrice,
    expiryDays: daysToExpiry,
    chain
  };
}
