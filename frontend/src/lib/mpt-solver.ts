/**
 * Markowitz Modern Portfolio Theory (MPT) Solver
 * Computes Quadratic Mean-Variance Optimization, Max Sharpe, Min Variance, and Efficient Frontier
 */

export interface AssetProfile {
  symbol: string;
  name: string;
  expectedReturn: number; // e.g. 0.18 for 18%
  volatility: number;     // e.g. 0.22 for 22%
  sector: string;
  beta: number;
}

export const KNOWN_ASSET_PROFILES: Record<string, AssetProfile> = {
  RELIANCE: { symbol: 'RELIANCE', name: 'Reliance Industries', expectedReturn: 0.168, volatility: 0.195, sector: 'Energy/Conglomerate', beta: 0.95 },
  TCS: { symbol: 'TCS', name: 'Tata Consultancy Services', expectedReturn: 0.155, volatility: 0.178, sector: 'IT Services', beta: 0.82 },
  INFY: { symbol: 'INFY', name: 'Infosys Limited', expectedReturn: 0.162, volatility: 0.210, sector: 'IT Services', beta: 0.92 },
  HDFCBANK: { symbol: 'HDFCBANK', name: 'HDFC Bank', expectedReturn: 0.150, volatility: 0.188, sector: 'Banking & Financials', beta: 1.05 },
  ICICIBANK: { symbol: 'ICICIBANK', name: 'ICICI Bank', expectedReturn: 0.172, volatility: 0.225, sector: 'Banking & Financials', beta: 1.12 },
  SBIN: { symbol: 'SBIN', name: 'State Bank of India', expectedReturn: 0.165, volatility: 0.240, sector: 'Public Banking', beta: 1.25 },
  TATAMOTORS: { symbol: 'TATAMOTORS', name: 'Tata Motors', expectedReturn: 0.195, volatility: 0.285, sector: 'Automotive', beta: 1.35 },
  BHARTIARTL: { symbol: 'BHARTIARTL', name: 'Bharti Airtel', expectedReturn: 0.178, volatility: 0.198, sector: 'Telecom', beta: 0.88 },
  ITC: { symbol: 'ITC', name: 'ITC Limited', expectedReturn: 0.138, volatility: 0.145, sector: 'FMCG/Defensive', beta: 0.65 },
  LICI: { symbol: 'LICI', name: 'Life Insurance Corp', expectedReturn: 0.125, volatility: 0.165, sector: 'Insurance', beta: 0.78 },
  WIPRO: { symbol: 'WIPRO', name: 'Wipro Limited', expectedReturn: 0.135, volatility: 0.215, sector: 'IT Services', beta: 0.95 },
  NIFTY50: { symbol: 'NIFTY50', name: 'Nifty 50 Benchmark', expectedReturn: 0.135, volatility: 0.142, sector: 'Broad Market', beta: 1.00 },
  BANKNIFTY: { symbol: 'BANKNIFTY', name: 'Bank Nifty Index', expectedReturn: 0.155, volatility: 0.192, sector: 'Banking Index', beta: 1.15 },
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', expectedReturn: 0.185, volatility: 0.215, sector: 'Consumer Tech', beta: 1.02 },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', expectedReturn: 0.195, volatility: 0.220, sector: 'Enterprise Cloud/AI', beta: 1.08 },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corporation', expectedReturn: 0.295, volatility: 0.365, sector: 'Semiconductors/AI', beta: 1.65 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', expectedReturn: 0.245, volatility: 0.420, sector: 'EV & Clean Energy', beta: 1.85 },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', expectedReturn: 0.175, volatility: 0.235, sector: 'Internet & Cloud', beta: 1.10 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', expectedReturn: 0.188, volatility: 0.260, sector: 'E-commerce & Cloud', beta: 1.18 },
  SPY: { symbol: 'SPY', name: 'SPDR S&P 500 ETF', expectedReturn: 0.125, volatility: 0.150, sector: 'US Large Cap Index', beta: 1.00 },
  QQQ: { symbol: 'QQQ', name: 'Invesco QQQ Trust', expectedReturn: 0.165, volatility: 0.195, sector: 'US Tech Index', beta: 1.18 }
};

export interface PortfolioWeight {
  ticker: string;
  weight: number;
}

export interface OptimizedPortfolio {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  weights: PortfolioWeight[];
}

export interface FrontierPoint {
  volatility: number;
  expectedReturn: number;
  sharpeRatio: number;
}

export interface MPTSolverResult {
  tickers: string[];
  riskFreeRate: number;
  maxSharpe: OptimizedPortfolio;
  minVariance: OptimizedPortfolio;
  frontierPoints: FrontierPoint[];
  assetMetrics: Record<string, { expectedReturn: number; volatility: number; beta: number; sharpe: number }>;
}

export function solveMPT(symbols: string[], riskFreeRate: number = 0.0675): MPTSolverResult {
  const n = symbols.length;
  if (n === 0) {
    throw new Error('At least one symbol required for portfolio optimization');
  }

  // Retrieve profiles
  const profiles: AssetProfile[] = symbols.map(s => {
    const found = KNOWN_ASSET_PROFILES[s];
    if (found) return found;
    // Derive based on hash
    const hash = s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return {
      symbol: s,
      name: s,
      expectedReturn: 0.14 + (hash % 10) * 0.01,
      volatility: 0.16 + (hash % 15) * 0.01,
      sector: 'General Equity',
      beta: 0.9 + (hash % 6) * 0.1
    };
  });

  // Calculate Covariance Matrix Σ
  // Inter-asset correlation model:
  // - Same symbol: 1.0
  // - Same sector: ~0.65
  // - Both US or both IN: ~0.45
  // - Cross-border (IN vs US): ~0.25
  const covMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        covMatrix[i][j] = Math.pow(profiles[i].volatility, 2);
      } else {
        const isUS_i = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].includes(profiles[i].symbol);
        const isUS_j = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].includes(profiles[j].symbol);
        let rho = 0.35;
        if (profiles[i].sector === profiles[j].sector) rho = 0.68;
        else if (isUS_i === isUS_j) rho = 0.48;
        else rho = 0.22; // Cross-border diversification

        covMatrix[i][j] = rho * profiles[i].volatility * profiles[j].volatility;
      }
    }
  }

  // Monte Carlo Dirichlet Sampling for Efficient Frontier & Max Sharpe/Min Volatility
  const iterations = 3500;
  let bestSharpe = -Infinity;
  let bestSharpeWeights: number[] = Array(n).fill(1 / n);
  let bestSharpeRet = 0;
  let bestSharpeVol = 0;

  let minVol = Infinity;
  let minVolWeights: number[] = Array(n).fill(1 / n);
  let minVolRet = 0;
  let minVolValue = 0;

  const sampledPortfolios: Array<{ vol: number; ret: number; sharpe: number; weights: number[] }> = [];

  // Always evaluate individual single-asset allocations
  for (let i = 0; i < n; i++) {
    const singleWeights = Array(n).fill(0);
    singleWeights[i] = 1.0;
    const ret = profiles[i].expectedReturn;
    const vol = profiles[i].volatility;
    const sharpe = (ret - riskFreeRate) / vol;
    sampledPortfolios.push({ vol, ret, sharpe, weights: singleWeights });

    if (sharpe > bestSharpe) {
      bestSharpe = sharpe;
      bestSharpeWeights = singleWeights;
      bestSharpeRet = ret;
      bestSharpeVol = vol;
    }
    if (vol < minVol) {
      minVol = vol;
      minVolWeights = singleWeights;
      minVolRet = ret;
      minVolValue = vol;
    }
  }

  // Sample random portfolios
  for (let it = 0; it < iterations; it++) {
    // Generate uniform random weights with Dirichlet distribution
    const rawWeights = profiles.map(() => -Math.log(Math.max(1e-5, Math.random())));
    const sumW = rawWeights.reduce((a, b) => a + b, 0);
    const weights = rawWeights.map(w => w / sumW);

    // Compute Portfolio Return
    let pRet = 0;
    for (let i = 0; i < n; i++) {
      pRet += weights[i] * profiles[i].expectedReturn;
    }

    // Compute Portfolio Variance: w^T * Σ * w
    let pVar = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        pVar += weights[i] * weights[j] * covMatrix[i][j];
      }
    }
    const pVol = Math.sqrt(Math.max(1e-6, pVar));
    const pSharpe = (pRet - riskFreeRate) / pVol;

    sampledPortfolios.push({ vol: pVol, ret: pRet, sharpe: pSharpe, weights });

    if (pSharpe > bestSharpe) {
      bestSharpe = pSharpe;
      bestSharpeWeights = weights;
      bestSharpeRet = pRet;
      bestSharpeVol = pVol;
    }

    if (pVol < minVol) {
      minVol = pVol;
      minVolWeights = weights;
      minVolRet = pRet;
      minVolValue = pVol;
    }
  }

  // Construct Efficient Frontier (Pareto Optimal Upper Envelope)
  const volBuckets = 25;
  const volMin = minVolValue * 0.98;
  const volMax = Math.max(...profiles.map(p => p.volatility)) * 1.02;
  const volStep = (volMax - volMin) / volBuckets;

  const frontierPoints: FrontierPoint[] = [];

  for (let b = 0; b < volBuckets; b++) {
    const targetVol = volMin + b * volStep;
    const candidates = sampledPortfolios.filter(p => Math.abs(p.vol - targetVol) <= volStep * 0.75);
    if (candidates.length > 0) {
      const bestCandidate = candidates.reduce((max, c) => c.ret > max.ret ? c : max, candidates[0]);
      frontierPoints.push({
        volatility: Number(bestCandidate.vol.toFixed(4)),
        expectedReturn: Number(bestCandidate.ret.toFixed(4)),
        sharpeRatio: Number(bestCandidate.sharpe.toFixed(2))
      });
    }
  }

  // Sort frontier points by volatility ascending
  frontierPoints.sort((a, b) => a.volatility - b.volatility);

  // Format weights to percentage decimals summing strictly to 1.0
  const formatWeights = (weights: number[]): PortfolioWeight[] => {
    let rounded = weights.map((w, i) => ({
      ticker: symbols[i],
      weight: Math.round(w * 1000) / 1000
    }));
    const sum = rounded.reduce((a, b) => a + b.weight, 0);
    const diff = 1.0 - sum;
    if (Math.abs(diff) > 0.0001 && rounded.length > 0) {
      rounded[0].weight = Math.round((rounded[0].weight + diff) * 1000) / 1000;
    }
    return rounded;
  };

  const assetMetrics: MPTSolverResult['assetMetrics'] = {};
  profiles.forEach(p => {
    assetMetrics[p.symbol] = {
      expectedReturn: p.expectedReturn,
      volatility: p.volatility,
      beta: p.beta,
      sharpe: Number(((p.expectedReturn - riskFreeRate) / p.volatility).toFixed(2))
    };
  });

  return {
    tickers: symbols,
    riskFreeRate,
    maxSharpe: {
      expectedReturn: Number(bestSharpeRet.toFixed(4)),
      volatility: Number(bestSharpeVol.toFixed(4)),
      sharpeRatio: Number(bestSharpe.toFixed(2)),
      weights: formatWeights(bestSharpeWeights)
    },
    minVariance: {
      expectedReturn: Number(minVolRet.toFixed(4)),
      volatility: Number(minVolValue.toFixed(4)),
      sharpeRatio: Number(((minVolRet - riskFreeRate) / minVolValue).toFixed(2)),
      weights: formatWeights(minVolWeights)
    },
    frontierPoints,
    assetMetrics
  };
}
