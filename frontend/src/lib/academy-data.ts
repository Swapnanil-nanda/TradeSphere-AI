/**
 * TradeSphere AI — Trader Academy & Platform Knowledge Base
 * Curated free institutional educational resources, video series,
 * feature documentation, platform FAQs, and interactive exercises.
 */

export interface ExternalResource {
  id: string;
  title: string;
  provider: string;
  category: 'BEGINNER' | 'RISK' | 'TECHNICAL' | 'OPTIONS' | 'QUANT' | 'WEALTH';
  type: 'COURSE' | 'VIDEO_SERIES' | 'INTERACTIVE' | 'BOOK';
  url: string;
  duration: string;
  description: string;
  highlight: string;
}

export interface PlatformFeatureGuide {
  id: string;
  name: string;
  route: string;
  category: 'EXECUTION' | 'RISK' | 'OPTIONS' | 'QUANT' | 'WEALTH' | 'MARKETS';
  badge: string;
  description: string;
  whatItDoes: string;
  howToUse: string[];
  keyMetrics: { name: string; formulaOrMeaning: string }[];
  troubleshootingTip: string;
  videoGuideTitle: string;
  videoGuideUrl: string;
}

export interface PlatformFAQ {
  id: string;
  question: string;
  category: 'GENERAL' | 'PAPER_TRADING' | 'RISK' | 'OPTIONS' | 'QUANT' | 'WEALTH';
  answer: string;
  relatedFeatureRoute?: string;
  relatedFeatureName?: string;
}

export interface AcademyQuizQuestion {
  id: number;
  category: 'BEGINNER' | 'RISK' | 'TECHNICAL' | 'OPTIONS' | 'QUANT' | 'WEALTH';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedFeatureRoute: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetFeature: string;
  featureRoute: string;
  scenario: string;
  task: string;
  hints: string[];
  solution: string;
}

// 1. Curated Free Best External Resources & Video Series
export const FREE_EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    id: 'res-1',
    title: 'Zerodha Varsity — Introduction to Stock Markets & Technical Analysis',
    provider: 'Zerodha (Karthik Rangappa)',
    category: 'BEGINNER',
    type: 'COURSE',
    url: 'https://zerodha.com/varsity/module/introduction-to-stock-markets/',
    duration: '15 Modules (Self-Paced)',
    description: 'The definitive free curriculum for Indian & global equities covering market structure, bid/ask spreads, order types, and candlestick charting.',
    highlight: '100% Free • Beginner Friendly • Illustrated Examples'
  },
  {
    id: 'res-2',
    title: 'MIT OpenCourseWare 15.401 — Finance Theory & Capital Asset Pricing',
    provider: 'Massachusetts Institute of Technology (Prof. Andrew Lo)',
    category: 'QUANT',
    type: 'VIDEO_SERIES',
    url: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/',
    duration: '24 Full Lecture Videos',
    description: 'World-renowned video lecture series teaching portfolio theory, Markowitz efficient frontier, CAPM, and Black-Scholes options pricing mathematics.',
    highlight: 'Rigorous Academic Foundations • Free MIT Course'
  },
  {
    id: 'res-3',
    title: 'How The Economic Machine Works',
    provider: 'Ray Dalio (Bridgewater Associates)',
    category: 'WEALTH',
    type: 'VIDEO_SERIES',
    url: 'https://www.youtube.com/watch?v=PHe0bXAIuk8',
    duration: '31 mins Animated Masterclass',
    description: 'An intuitive animated breakdown of credit, short-term debt cycles, long-term deleveraging, and inflation by the founder of the world\'s largest hedge fund.',
    highlight: 'Over 40M Views • Essential Macro Understanding'
  },
  {
    id: 'res-4',
    title: 'The Options Playbook & Cboe Options Institute',
    provider: 'Cboe & Brian Overby',
    category: 'OPTIONS',
    type: 'INTERACTIVE',
    url: 'https://www.optionsplaybook.com/option-strategies/',
    duration: '40+ Strategies Reference',
    description: 'Interactive encyclopedia detailing Bull Call Spreads, Iron Condors, Straddles, Greeks (Delta, Theta decay), and risk graphs with max profit/loss formulas.',
    highlight: 'Visual Payoff Diagrams • Exact Mathematical Geometry'
  },
  {
    id: 'res-5',
    title: 'Khan Academy — Stocks, Bonds & Derivatives',
    provider: 'Khan Academy (Sal Khan)',
    category: 'BEGINNER',
    type: 'VIDEO_SERIES',
    url: 'https://www.khanacademy.org/economics-finance-domain/core-finance',
    duration: '50+ Short Video Lessons',
    description: 'Bite-sized visual lectures covering short selling, limit orders, margin requirements, put and call options, and market maker incentives.',
    highlight: 'Intuitive Blackboard Style • Zero Prior Knowledge Required'
  },
  {
    id: 'res-6',
    title: 'Aswath Damodaran — Corporate Finance & Equity Valuation',
    provider: 'NYU Stern School of Business',
    category: 'QUANT',
    type: 'VIDEO_SERIES',
    url: 'https://pages.stern.nyu.edu/~adamodar/',
    duration: 'Full Semester Lectures & Datasets',
    description: 'Free comprehensive databases of cost of capital, sector betas, P/E ratios, and discounted cash flow (DCF) valuation by the "Dean of Valuation".',
    highlight: 'Institutional Equity Research • Live Datasets'
  },
  {
    id: 'res-7',
    title: 'Zerodha Varsity — Options Theory for Professional Traders',
    provider: 'Zerodha Varsity',
    category: 'OPTIONS',
    type: 'COURSE',
    url: 'https://zerodha.com/varsity/module/option-theory/',
    duration: '22 Detailed Chapters',
    description: 'Covers Black-Scholes-Merton model mechanics, volatility smiles, open interest interpretation, PCR ratios, and multi-leg risk management.',
    highlight: 'Directly Applicable to Indian (NFO) & US Option Chains'
  },
  {
    id: 'res-8',
    title: 'Ben Felix — Common Sense Investing & Portfolio Design',
    provider: 'PWL Capital / Rational Reminder',
    category: 'WEALTH',
    type: 'VIDEO_SERIES',
    url: 'https://www.youtube.com/c/BenFelixCSI',
    duration: '80+ Evidence-Based Episodes',
    description: 'Rigorous empirical analysis of index investing, factor investing, expense ratios, asset location, and Monte Carlo retirement modeling.',
    highlight: 'Evidence-Based Financial Science • Peer-Reviewed'
  }
];

// 2. Comprehensive Platform Feature Guides (Connecting Academy to every single site feature)
export const PLATFORM_FEATURE_GUIDES: PlatformFeatureGuide[] = [
  {
    id: 'feat-paper-trading',
    name: 'Paper Trading Terminal',
    route: '/app/paper-trading',
    category: 'EXECUTION',
    badge: 'CORE OMS',
    description: 'Simulated multi-asset order execution engine featuring real-time market data quotes across 23 Indian (NSE) and US (NASDAQ) tickers.',
    whatItDoes: 'Allows risk-free live trading practice with virtual cash balance, supporting Market, Limit, Stop-Loss, and Bracket OCO orders with realistic slippage and fee simulation.',
    howToUse: [
      'Select any stock from the 23-instrument dropdown or watchlist.',
      'Choose order direction: BUY (Long) or SELL (Short).',
      'Select order type: MARKET (instant fill at ask/bid) or LIMIT (placed in queue).',
      'Use the 1.0% Risk Sizer to automatically calculate the maximum safe quantity based on your hard Stop-Loss.',
      'Submit the order and monitor live positions, cash ledger, and mark-to-market P&L.'
    ],
    keyMetrics: [
      { name: 'Unrealized P&L', formulaOrMeaning: '(Current Market Price - Average Entry Price) × Quantity' },
      { name: 'Realized P&L', formulaOrMeaning: 'Net closed profit or loss after exiting positions including simulated brokerage' },
      { name: 'Available Buying Power', formulaOrMeaning: 'Cash Balance - Capital locked in active margin requirements' }
    ],
    troubleshootingTip: 'If your BUY order is rejected, ensure you have sufficient buying power and that your quantity is a positive integer. Selling more shares than held in cash mode is prohibited.',
    videoGuideTitle: 'How to Execute Market, Limit & Bracket Orders (Zerodha Varsity Video)',
    videoGuideUrl: 'https://zerodha.com/varsity/chapter/the-trading-terminal/'
  },
  {
    id: 'feat-risk-guardrails',
    name: 'Risk Control Centre & Gatekeeper',
    route: '/app/risk',
    category: 'RISK',
    badge: 'RULE A GATEKEEPER',
    description: 'Institutional risk supervisory module that enforces non-negotiable capital preservation invariants on every simulated order.',
    whatItDoes: 'Validates that single-trade risk cannot exceed 1.0% of account equity and triggers a session lockout if cumulative daily drawdown hits 3.0%.',
    howToUse: [
      'Choose any of the 23 stocks to view its dynamic price levels and volatility.',
      'Enter planned entry and hard Stop-Loss to calculate maximum safe quantity.',
      'Observe the Rule A Safe Sizing Invariant: if risk per share exceeds allowable risk cash, quantity strictly locks at 0 units.',
      'Test the Daily Drawdown Circuit Breaker slider to see how account lockdown protects capital during severe market drawdowns.'
    ],
    keyMetrics: [
      { name: 'Single-Trade Max Risk', formulaOrMeaning: 'abs(Entry - StopLoss) × Qty ≤ 1.0% of Account Equity' },
      { name: 'Daily Drawdown Circuit Breaker', formulaOrMeaning: 'Session lockout enforced when Realized + Unrealized Loss ≥ 3.0% of starting equity' },
      { name: '1-Day 95% Parametric VaR', formulaOrMeaning: '1.645 × Daily Portfolio Volatility × Equity' }
    ],
    troubleshootingTip: 'Why does the position sizer return 0 shares? Under Rule A, if the distance to your Stop-Loss on even 1 single share is greater than your 1% total risk budget, the trade is rejected to prevent catastrophic risk.',
    videoGuideTitle: 'The 1% Rule and Risk Management Masterclass (Khan Academy)',
    videoGuideUrl: 'https://www.khanacademy.org/economics-finance-domain/core-finance'
  },
  {
    id: 'feat-depth-of-market',
    name: '20-Level Depth of Market (DOM Ladder)',
    route: '/app/risk/depth',
    category: 'RISK',
    badge: 'LEVEL 2 ORDER BOOK',
    description: 'High-frequency microstructure visualization showing the real-time bid and ask queue geometry 20 levels deep.',
    whatItDoes: 'Displays pending limit buy and sell order queues, cumulative liquidity distribution, order book imbalance, micro-price VWAP, and institutional liquidity walls.',
    howToUse: [
      'Select any stock to stream its 20-depth order book ladder.',
      'Inspect the green (bid) and red (ask) horizontal depth bars to identify liquidity clusters.',
      'Watch the Order Book Imbalance %: positive indicates buy-side pressure; negative indicates sell-side pressure.',
      'Locate Liquidity Walls to find strong potential support or resistance price pivots.'
    ],
    keyMetrics: [
      { name: 'Spread (bps)', formulaOrMeaning: '((Ask Price - Bid Price) / Spot Price) × 10,000' },
      { name: 'Theoretical Micro-Price', formulaOrMeaning: '(Ask × BidQty + Bid × AskQty) / (BidQty + AskQty)' },
      { name: 'Imbalance %', formulaOrMeaning: '((Total Bid Qty - Total Ask Qty) / (Total Bid Qty + Total Ask Qty)) × 100' }
    ],
    troubleshootingTip: 'A large bid order wall at Level 5 doesn\'t guarantee price won\'t break lower; institutions can pull orders (spoofing/cancellation). Always use a hard stop loss.',
    videoGuideTitle: 'Level 2 Market Depth & Order Flow Mechanics',
    videoGuideUrl: 'https://zerodha.com/varsity/chapter/depth-of-market-understanding-order-flow/'
  },
  {
    id: 'feat-options-chain',
    name: 'Options Analytics & Volatility Chain',
    route: '/app/risk/options',
    category: 'OPTIONS',
    badge: 'BLACK-SCHOLES',
    description: 'Comprehensive options matrix displaying Call and Put contracts across 15 strikes for any of the 23 tickers.',
    whatItDoes: 'Calculates theoretical option fair prices, Newton-Raphson implied volatility with volatility smile skew, Delta, Gamma, Theta decay, Vega, Put-Call Ratio (PCR), and Max Pain.',
    howToUse: [
      'Select a ticker and expiration timeframe (0-DTE, 7D, 14D, 30D, 60D).',
      'Compare Call LTP vs Put LTP across the center strike (ATM).',
      'Check the Put-Call Ratio (PCR): > 1.15 signals bullish bias; < 0.85 signals bearish bias.',
      'Review the Max Pain strike where option buyers face the largest expiration loss.'
    ],
    keyMetrics: [
      { name: 'Put-Call Ratio (PCR)', formulaOrMeaning: 'Total Put Open Interest ÷ Total Call Open Interest' },
      { name: 'Max Pain Strike', formulaOrMeaning: 'Strike at which total payout to all option buyers is minimized at expiry' },
      { name: 'ATM Implied Volatility', formulaOrMeaning: 'Annualized standard deviation implied by the market price of ATM contracts' }
    ],
    troubleshootingTip: 'Why are options on US tech stocks priced differently than NIFTY? US options trade on standard 100-share contracts in USD, while Indian indices trade in lot sizes (25 for Nifty, 15 for BankNifty) in INR.',
    videoGuideTitle: 'Introduction to Options Contracts & Chains (Zerodha Varsity)',
    videoGuideUrl: 'https://zerodha.com/varsity/module/option-theory/'
  },
  {
    id: 'feat-black-scholes-greeks',
    name: 'Black-Scholes Options Greeks Engine',
    route: '/app/risk/greeks',
    category: 'OPTIONS',
    badge: 'ANALYTIC GREEKS',
    description: 'Interactive closed-form Black-Scholes partial derivatives calculator and moneyness inspector.',
    whatItDoes: 'Computes exact partial derivatives (Delta, Gamma, Theta, Vega, Rho) and capital leverage from underlying spot, strike, DTE, IV, and risk-free rates.',
    howToUse: [
      'Select any stock or index to pre-populate its real market price and IV.',
      'Toggle between CALL and PUT options.',
      'Adjust the Days to Expiration (DTE) slider to see Theta decay accelerate near expiration.',
      'Adjust the Implied Volatility slider to observe Vega sensitivity on premium value.'
    ],
    keyMetrics: [
      { name: 'Delta (Δ)', formulaOrMeaning: '∂V/∂S: Change in option price per 1.0 unit move in underlying' },
      { name: 'Gamma (Γ)', formulaOrMeaning: '∂²V/∂S²: Rate of change of Delta per 1.0 unit move in underlying' },
      { name: 'Theta (Θ)', formulaOrMeaning: '∂V/∂t: Daily extrinsic value decay per calendar day' },
      { name: 'Vega (ν)', formulaOrMeaning: '∂V/∂σ: Change in option price per 1.0% shift in implied volatility' },
      { name: 'Leverage (Ω)', formulaOrMeaning: '|Delta| × (Spot Price / Option Price): Effective gearing ratio' }
    ],
    troubleshootingTip: 'Remember that Theta is negative for long option holders (time decays against you) but positive for option sellers.',
    videoGuideTitle: 'Understanding Options Greeks: Delta, Gamma, Theta, Vega (Options Playbook)',
    videoGuideUrl: 'https://www.optionsplaybook.com/option-strategies/'
  },
  {
    id: 'feat-options-payoff',
    name: 'Options Strategy Payoff Modeler',
    route: '/app/risk/payoff',
    category: 'OPTIONS',
    badge: 'PAYOFF GEOMETRY',
    description: 'Multi-leg options expiration and T+0 horizon profit/loss curve visualizer for any strategy archetype.',
    whatItDoes: 'Simulates payoff curves for 8 archetypes (Bull Call Spread, Bear Put Spread, Long Call, Long Put, Straddle, Iron Condor, Covered Call, Iron Butterfly), computing breakevens, max loss, max profit, and Probability of Profit (POP).',
    howToUse: [
      'Select an underlying stock and your preferred strategy archetype.',
      'Tune lower strike, upper strike, net debit/credit, and lot size.',
      'Toggle the T+0 Curve to see your expected PnL before expiration incorporating time value.',
      'Verify that maximum potential loss is strictly within your 1% account risk budget.'
    ],
    keyMetrics: [
      { name: 'Max Profit', formulaOrMeaning: 'Capped upside for spreads; unlimited for naked long calls' },
      { name: 'Max Defined Loss', formulaOrMeaning: 'Net premium debit paid for spreads; protects against black swan gaps' },
      { name: 'Breakeven Price(s)', formulaOrMeaning: 'Stock price where net strategy PnL at expiration equals exactly zero' },
      { name: 'Probability of Profit (POP)', formulaOrMeaning: 'Statistical likelihood of closing with > $0 profit based on lognormal distribution' }
    ],
    troubleshootingTip: 'Why trade a Bull Call Spread instead of a naked Call? A spread sells an OTM call to finance the lower call, dramatically reducing net debit and shielding against theta decay.',
    videoGuideTitle: 'Bull Call Spreads & Vertical Spreads Explained (The Options Playbook)',
    videoGuideUrl: 'https://www.optionsplaybook.com/option-strategies/'
  },
  {
    id: 'feat-trade-journal',
    name: 'Automated Trade Journal & Tilt Auditor',
    route: '/app/risk/journal',
    category: 'RISK',
    badge: 'PSYCHOLOGICAL AUDIT',
    description: 'Empirical behavioral audit tracking stop-loss discipline, revenge-trading anomalies, and R-multiple expectancy.',
    whatItDoes: 'Automatically logs simulated trades, calculates win rates and profit factors, checks for revenge trading after losses, and grades trader discipline.',
    howToUse: [
      'Filter trade logs by symbol or trade outcome (Wins vs Losses).',
      'Review your Stop-Loss Adherence Score (100% means zero manual SL deletions).',
      'Check Average Expectancy (R-multiple) to verify positive mathematical expectancy.',
      'Inspect the revenge-trading indicator to confirm healthy pacing between trades.'
    ],
    keyMetrics: [
      { name: 'Profit Factor', formulaOrMeaning: 'Gross Profits ÷ Gross Losses (Ideal: > 1.50)' },
      { name: 'Expectancy (R)', formulaOrMeaning: '(Win% × Avg Win R) - (Loss% × Avg Loss R)' },
      { name: 'Tilt Score', formulaOrMeaning: 'Alert flagged if trades are entered within 60s of a stopped-out loss' }
    ],
    troubleshootingTip: 'A 45% win rate can be highly profitable if your average win is 2.5R and your average loss is 1.0R. Focus on R-multiples, not just win rate.',
    videoGuideTitle: 'Trading Psychology & Risk Management (Mark Douglas - Trading in the Zone)',
    videoGuideUrl: 'https://zerodha.com/varsity/chapter/risk-management-and-trading-psychology/'
  },
  {
    id: 'feat-mpt-optimizer',
    name: 'Modern Portfolio Theory (MPT) Optimizer',
    route: '/app/wealth/optimizer',
    category: 'WEALTH',
    badge: 'MARKOWITZ SOLVER',
    description: 'Quadratic mean-variance portfolio optimizer calculating optimal asset weights across Indian and US equities.',
    whatItDoes: 'Samples 3,500 Dirichlet portfolios against cross-border empirical covariance matrices to identify the Tangency (Max Sharpe) and Global Minimum Variance (GMV) portfolios.',
    howToUse: [
      'Select 2 to 12 stocks from the 23-asset universe, or choose a 1-click preset.',
      'Adjust the Risk-Free Rate slider (6.5% INR or 4.5% USD).',
      'Click Optimize MPT Portfolio to run the quadratic Dirichlet solver.',
      'Compare weights, expected annual return, volatility, and Sharpe ratios side-by-side.'
    ],
    keyMetrics: [
      { name: 'Sharpe Ratio', formulaOrMeaning: '(Expected Portfolio Return - Risk Free Rate) ÷ Portfolio Volatility' },
      { name: 'Global Min Variance (GMV)', formulaOrMeaning: 'Portfolio allocation with the absolute lowest mathematical variance' },
      { name: 'Portfolio Beta', formulaOrMeaning: 'Weighted covariance with benchmark broad market index' }
    ],
    troubleshootingTip: 'Why does adding gold or IT stocks reduce overall portfolio risk? Low or negative correlation between sectors dampens portfolio swings through diversification.',
    videoGuideTitle: 'Markowitz Modern Portfolio Theory & Efficient Frontier (MIT OpenCourseWare)',
    videoGuideUrl: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/'
  },
  {
    id: 'feat-efficient-frontier',
    name: 'Efficient Frontier Interactive Visualizer',
    route: '/app/wealth/frontier',
    category: 'WEALTH',
    badge: 'PARETO ENVELOPE',
    description: 'Interactive HTML5 Canvas visualizer mapping the Pareto-optimal risk/return envelope for diversified portfolios.',
    whatItDoes: 'Renders the continuous parabolic frontier envelope, Capital Allocation Line (CAL), individual asset coordinates, Max Sharpe point, and GMV point.',
    howToUse: [
      'Toggle individual stocks on and off using the asset selector.',
      'Observe how the frontier curve shifts outward when adding uncorrelated international stocks (e.g. NVDA + RELIANCE).',
      'Hover over the curve to inspect specific risk/return coordinates along the Pareto frontier.'
    ],
    keyMetrics: [
      { name: 'Capital Allocation Line (CAL)', formulaOrMeaning: 'Straight line drawn from the Risk-Free Rate tangent to the Efficient Frontier' },
      { name: 'Pareto Optimal', formulaOrMeaning: 'No portfolio exists with higher return for the same level of risk' }
    ],
    troubleshootingTip: 'Portfolios located below the lower curve are inefficient; they carry excess risk for inadequate return.',
    videoGuideTitle: 'Understanding the Efficient Frontier & Tangency Portfolio (Khan Academy)',
    videoGuideUrl: 'https://www.khanacademy.org/economics-finance-domain/core-finance'
  },
  {
    id: 'feat-monte-carlo',
    name: 'Monte-Carlo Stochastic Scenario Modeler',
    route: '/app/wealth/scenarios',
    category: 'WEALTH',
    badge: '350-PATH GBM',
    description: 'Stochastic path simulator generating 350 geometric Brownian motion projection paths for any selected stock.',
    whatItDoes: 'Projects future wealth distribution over 1 to 10 years, displaying P95 (Bull), P50 (Median), and P5 (Bear Floor) envelopes alongside maximum path drawdowns.',
    howToUse: [
      'Select any stock and set your investment horizon (1 to 10 years).',
      'Set your Target Wealth Goal to compute the exact statistical probability of achieving it.',
      'Examine the P5 Bear floor to stress-test your downside tolerance during prolonged bear markets.'
    ],
    keyMetrics: [
      { name: 'GBM Equation', formulaOrMeaning: 'S(t+Δt) = S(t) × exp((μ - 0.5σ²)Δt + σ√Δt × Z)' },
      { name: 'P95 Bull Case', formulaOrMeaning: '95th percentile outcome across 350 simulated stochastic price paths' },
      { name: 'Max Empirical Drawdown', formulaOrMeaning: 'Worst peak-to-trough decline observed across all simulated paths' }
    ],
    troubleshootingTip: 'Monte Carlo models simulate statistical probabilities, not certainty. Use the median P50 and conservative P5 paths for financial planning.',
    videoGuideTitle: 'Monte Carlo Simulation in Finance & Wealth Planning (Ben Felix)',
    videoGuideUrl: 'https://www.youtube.com/c/BenFelixCSI'
  },
  {
    id: 'feat-sip-planner',
    name: 'Step-Up SIP Compounding Planner',
    route: '/app/wealth/sip-planner',
    category: 'WEALTH',
    badge: 'COMPOUND ENGINE',
    description: 'Multi-decade step-up systematic investment plan calculator with inflation adjustment.',
    whatItDoes: 'Models monthly recurring investments in stocks or mutual funds with annual percentage contribution step-ups (0–25%) and 6% inflation deflation.',
    howToUse: [
      'Choose a stock or mutual fund scheme.',
      'Adjust monthly investment (e.g. ₹10,000 / $500), tenure (1–30 years), and expected CAGR.',
      'Configure the Annual Step-Up % to model salary and income growth over time.',
      'Toggle the Inflation Adjustment switch to view returns in terms of real purchasing power.'
    ],
    keyMetrics: [
      { name: 'Step-Up Compounding', formulaOrMeaning: 'Monthly contribution increases by X% annually, compounding exponentially' },
      { name: 'Real Wealth (Inflation Adjusted)', formulaOrMeaning: 'Nominal Future Value ÷ (1 + Inflation Rate)^Years' }
    ],
    troubleshootingTip: 'Stepping up your monthly SIP by just 10% each year can more than double your 20-year corpus compared to a flat monthly investment.',
    videoGuideTitle: 'The Power of Step-Up SIP & Compounding Mathematics (Zerodha Varsity)',
    videoGuideUrl: 'https://zerodha.com/varsity/chapter/mutual-funds-investing/'
  },
  {
    id: 'feat-quant-agents',
    name: 'Autonomous Multi-Agent Quant Center',
    route: '/app/quant/multi-agent',
    category: 'QUANT',
    badge: '7 SPECIALIST AGENTS',
    description: 'Seven specialized AI quantitative agents collaborating on market intelligence, forecasting, and strategy formulation.',
    whatItDoes: 'Deconstructs any stock into Market Data, Technicals, News Intelligence, Historical Analogues, Price Forecasting, Risk Management, and Strategy synthesis.',
    howToUse: [
      'Select any of the 23 stocks to trigger the multi-agent consensus workflow.',
      'Inspect agent telemetry: Technical Agent (RSI/EMA), Historical Analogue Agent (matching fractal patterns), and Forecasting Agent (Monte Carlo paths).',
      'Review the verified synthesis report before formulating trading hypotheses.'
    ],
    keyMetrics: [
      { name: 'Agent Consensus Score', formulaOrMeaning: 'Synthesized signal weighted across technical, fundamental, and sentiment audits' },
      { name: 'Evidence Verification', formulaOrMeaning: 'Independent check auditing outputs against mathematical invariants' }
    ],
    troubleshootingTip: 'The multi-agent quant center provides analytical research, not automated trade execution. All orders must pass through the Risk Gatekeeper.',
    videoGuideTitle: 'Quantitative Trading & Multi-Factor Research Foundations',
    videoGuideUrl: 'https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/'
  }
];

// 3. Platform FAQs (Feature-wise Troubleshooting & Concepts)
export const PLATFORM_FAQS: PlatformFAQ[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'Is TradeSphere AI 100% free, and do I need to pay or deposit real money?',
    answer: 'TradeSphere AI is 100% free and self-hosted. There are zero subscription fees, and no real capital deposits are accepted. All trading features operate on virtual paper capital (₹10,00,000 / $100,000) for education and research.'
  },
  {
    id: 'faq-2',
    category: 'GENERAL',
    question: 'Are the market price quotes live or simulated?',
    answer: 'The platform integrates real live market quotes from global exchanges via low-latency proxies. When financial markets are closed or offline, an automated 24/7 Geometric Brownian Motion (GBM) microstructure engine streams simulated real-time ticks and 20-depth DOM queues, clearly marked with SIMULATED metadata labels.'
  },
  {
    id: 'faq-3',
    category: 'RISK',
    question: 'Why did the order sizing tool return 0 shares when I entered my Stop-Loss?',
    answer: 'This is the Rule A Invariant. If your account equity is ₹1,00,000, your 1.0% maximum risk cap is ₹1,000. If your planned entry is ₹3,000 and your Stop-Loss is ₹1,500, the risk per share is ₹1,500. Since risking even 1 single share (₹1,500) would breach your ₹1,000 risk cap, the platform refuses to round up and safely returns 0 shares to preserve your account.'
  },
  {
    id: 'faq-4',
    category: 'RISK',
    question: 'What happens when the Daily Drawdown Circuit Breaker is tripped?',
    answer: 'If cumulative realized + unrealized daily losses reach 3.0% of starting equity, the platform enforces an immediate lockout on all new opening orders for the remainder of the session. Existing open positions can still be closed or managed with bracket orders.'
  },
  {
    id: 'faq-5',
    category: 'PAPER_TRADING',
    question: 'What is a Bracket OCO (One-Cancels-the-Other) order and how does it work?',
    answer: 'A Bracket order binds an opening order to two exit legs: an upper Take-Profit limit order and a lower Stop-Loss stop order. When the opening order fills, both exit legs become active. As soon as one exit leg fills (e.g., target reached), the counter-leg (stop loss) is immediately and automatically canceled to prevent duplicate positions.'
  },
  {
    id: 'faq-6',
    category: 'OPTIONS',
    question: 'How does Implied Volatility (IV) affect my option premium?',
    answer: 'Implied Volatility reflects market expectations of future price variance. When IV increases, Vega causes both Call and Put premiums to expand. When IV collapses (such as immediately after corporate earnings announcements), option premiums drop rapidly—a phenomenon known as "IV Crush".'
  },
  {
    id: 'faq-7',
    category: 'OPTIONS',
    question: 'What is the Max Pain strike in the options chain?',
    answer: 'Max Pain theory suggests that at expiration, the underlying asset will gravitate toward the strike price where the greatest number of open option contracts (Calls and Puts) expire worthless, resulting in the maximum cumulative financial loss for option buyers and maximum profit for option sellers.'
  },
  {
    id: 'faq-8',
    category: 'WEALTH',
    question: 'What is the difference between the Tangency (Max Sharpe) and GMV portfolio in MPT?',
    answer: 'The Maximum Sharpe (Tangency) portfolio identifies the asset allocation that generates the greatest excess return per unit of volatility relative to the risk-free rate. The Global Minimum Variance (GMV) portfolio seeks only to minimize mathematical variance regardless of expected return.'
  },
  {
    id: 'faq-9',
    category: 'WEALTH',
    question: 'Why does the Step-Up SIP planner include an inflation adjustment toggle?',
    answer: 'A ₹1 Crore or $1 Million corpus in 25 years will not purchase the same goods and services as today due to monetary inflation. The inflation toggle discounts future nominal wealth by an estimated 6% annual inflation rate, revealing your true purchasing power in today\'s currency.'
  },
  {
    id: 'faq-10',
    category: 'QUANT',
    question: 'Can the 7 Specialist Quant Agents trade automatically on my behalf?',
    answer: 'No. The Python quantitative engine and multi-agent system are strictly read-only research tools. By architectural invariant (Rule C), agents cannot execute orders or write to user ledgers directly. All trade ideas must be manually reviewed and submitted through the Pre-Trade Risk Gatekeeper.'
  }
];

// 4. Interactive Academy Quizzes (5 categories, 15 comprehensive questions)
export const ACADEMY_QUIZ_QUESTIONS: AcademyQuizQuestion[] = [
  // Category 1: BEGINNER & MARKET STRUCTURE
  {
    id: 101,
    category: 'BEGINNER',
    difficulty: 'Beginner',
    question: 'What is the difference between a MARKET order and a LIMIT order?',
    options: [
      'Market orders execute immediately at the best available bid/ask; Limit orders execute only at your specified price or better.',
      'Market orders only work when the market is closed; Limit orders work 24/7.',
      'Market orders are free of charge; Limit orders require paying double brokerage.',
      'Market orders are exclusively for options; Limit orders are exclusively for stocks.'
    ],
    correctIndex: 0,
    explanation: 'A Market order prioritizes immediate execution speed over price certainty. A Limit order prioritizes price control, guaranteeing you will not pay more than your limit buy price or receive less than your limit sell price.',
    relatedFeatureRoute: '/app/paper-trading'
  },
  {
    id: 102,
    category: 'BEGINNER',
    difficulty: 'Beginner',
    question: 'What does the Bid-Ask spread represent in a stock quote?',
    options: [
      'The commission charged by the regulatory exchange.',
      'The difference between the highest price a buyer is willing to pay (Bid) and the lowest price a seller is willing to accept (Ask).',
      'The difference between yesterday\'s closing price and today\'s opening price.',
      'The annual dividend yield of the company.'
    ],
    correctIndex: 1,
    explanation: 'The bid is the top price buyers are offering, and the ask is the top price sellers are demanding. The difference is the spread, which compensates liquidity providers and market makers.',
    relatedFeatureRoute: '/app/risk/depth'
  },
  {
    id: 103,
    category: 'BEGINNER',
    difficulty: 'Intermediate',
    question: 'In a 20-level Depth of Market (DOM) ladder, what does an Order Book Imbalance of +35% signify?',
    options: [
      'There is 35% more bid quantity than ask quantity in the top 20 levels, indicating short-term buying pressure.',
      'The stock will automatically gap up by 35% on the next tick.',
      'The exchange has suspended 35% of trading participants.',
      '35% of orders on the book are fraudulent.'
    ],
    correctIndex: 0,
    explanation: 'Order book imbalance measures the proportion of resting buy orders versus sell orders. Positive imbalance indicates bid dominance and buying absorption.',
    relatedFeatureRoute: '/app/risk/depth'
  },

  // Category 2: RISK MANAGEMENT & CAPITAL PRESERVATION
  {
    id: 201,
    category: 'RISK',
    difficulty: 'Beginner',
    question: 'On an account with ₹10,00,000 equity, what is the maximum rupee loss allowed on any single trade under Rule A (1.0% cap)?',
    options: [
      '₹50,000',
      '₹10,000',
      '₹1,00,000',
      'Whatever margin the broker provides'
    ],
    correctIndex: 1,
    explanation: 'Under Rule A, 1.0% of ₹10,00,000 equity equals exactly ₹10,000. Your position size must ensure that hitting your Stop-Loss never loses more than ₹10,000.',
    relatedFeatureRoute: '/app/risk'
  },
  {
    id: 202,
    category: 'RISK',
    difficulty: 'Intermediate',
    question: 'If planned Entry is ₹2,000, Stop-Loss is ₹1,950, and Account Risk Cap is ₹10,000, what is the maximum safe share quantity?',
    options: [
      '100 shares',
      '200 shares',
      '500 shares',
      '50 shares'
    ],
    correctIndex: 1,
    explanation: 'Risk per share = ₹2,000 - ₹1,950 = ₹50. Safe Quantity = Max Allowed Risk (₹10,000) ÷ Risk per share (₹50) = 200 shares.',
    relatedFeatureRoute: '/app/risk'
  },
  {
    id: 203,
    category: 'RISK',
    difficulty: 'Intermediate',
    question: 'Under the Strict Safe Sizing Rule, what happens if the calculated risk per share is ₹1,200 but your max allowed risk is ₹1,000?',
    options: [
      'The platform rounds up to 1 share so you can still participate.',
      'The platform sizes strictly to 0 units with an explicit risk breach alert.',
      'The platform executes a half-share fraction.',
      'The platform overrides your stop-loss.'
    ],
    correctIndex: 1,
    explanation: 'Rule A Invariant strictly prohibits rounding up. If the risk for even 1 single share exceeds your 1.0% risk cap, the safe sizer must return 0 units.',
    relatedFeatureRoute: '/app/risk'
  },

  // Category 3: TECHNICALS & EXECUTION
  {
    id: 301,
    category: 'TECHNICAL',
    difficulty: 'Beginner',
    question: 'What is the Volume-Weighted Average Price (VWAP) and why do institutions monitor it?',
    options: [
      'An arbitrary technical line with no institutional relevance.',
      'The true benchmark average price at which an asset traded throughout the day, weighted by volume at each price level.',
      'The highest price recorded during the trading session.',
      'A proprietary AI indicator that predicts future earnings.'
    ],
    correctIndex: 1,
    explanation: 'Institutions use VWAP to evaluate trade execution quality. Buying below VWAP represents receiving an above-average price relative to volume for that session.',
    relatedFeatureRoute: '/app/charts'
  },
  {
    id: 302,
    category: 'TECHNICAL',
    difficulty: 'Intermediate',
    question: 'What does a classic 14-period RSI reading above 70 conventionally suggest?',
    options: [
      'The asset is oversold and guaranteed to decline immediately.',
      'The asset is in overbought territory and experiencing strong upward momentum, with risk of consolidation.',
      'The market is closed for trading.',
      'Trading volume has dropped to zero.'
    ],
    correctIndex: 1,
    explanation: 'RSI > 70 indicates strong bullish momentum pushing into overbought territory. In trending markets, RSI can remain above 70 for extended periods.',
    relatedFeatureRoute: '/app/charts'
  },

  // Category 4: OPTIONS GREEKS & STRATEGIES
  {
    id: 401,
    category: 'OPTIONS',
    difficulty: 'Intermediate',
    question: 'Which Options Greek measures the rate of decay of an option\'s premium as time passes?',
    options: [
      'Delta (Δ)',
      'Gamma (Γ)',
      'Theta (Θ)',
      'Vega (ν)'
    ],
    correctIndex: 2,
    explanation: 'Theta (Θ) measures calendar time decay. As an option contract approaches expiration, its extrinsic time value erodes faster, especially in the final 14 days.',
    relatedFeatureRoute: '/app/risk/greeks'
  },
  {
    id: 402,
    category: 'OPTIONS',
    difficulty: 'Advanced',
    question: 'What is the primary advantage of a Bull Call Debit Spread over buying a naked Out-of-the-Money Call?',
    options: [
      'It has unlimited upside potential.',
      'Selling the higher strike call offsets upfront premium cost and reduces negative Theta time decay.',
      'It guarantees 100% win rate in all market conditions.',
      'It eliminates the need for an underlying stock.'
    ],
    correctIndex: 1,
    explanation: 'By selling a higher strike call, you receive premium that finances the lower call. This reduces upfront net debit, lowers your breakeven, and cushions against theta decay.',
    relatedFeatureRoute: '/app/risk/payoff'
  },
  {
    id: 403,
    category: 'OPTIONS',
    difficulty: 'Advanced',
    question: 'When should a quantitative options trader deploy a Delta-Neutral Iron Condor?',
    options: [
      'When anticipating an explosive directional breakout in either direction.',
      'In a low-volatility or range-bound market regime with high implied volatility where price is expected to stay between the wings.',
      'Only during stock market crashes.',
      'When holding a long stock position for dividend collection.'
    ],
    correctIndex: 1,
    explanation: 'Iron Condors are short volatility, positive Theta strategies that generate maximum profit when the underlying asset remains confined within the inner strike boundaries.',
    relatedFeatureRoute: '/app/risk/payoff'
  },

  // Category 5: WEALTH & MODERN PORTFOLIO THEORY
  {
    id: 501,
    category: 'WEALTH',
    difficulty: 'Intermediate',
    question: 'What mathematical principle enables Markowitz Modern Portfolio Theory (MPT) to reduce portfolio risk without sacrificing expected return?',
    options: [
      'Buying only the highest performing stock of the previous year.',
      'Combining assets with low or negative covariance (correlation) so fluctuations offset one another.',
      'Using 10x leverage on benchmark indices.',
      'Holding 100% cash in high-yield savings accounts.'
    ],
    correctIndex: 1,
    explanation: 'Diversification across imperfectly correlated assets reduces overall portfolio variance below the weighted average of individual asset variances.',
    relatedFeatureRoute: '/app/wealth/optimizer'
  },
  {
    id: 502,
    category: 'WEALTH',
    difficulty: 'Advanced',
    question: 'In a 350-path Monte-Carlo simulation, what does the P5 Bear Floor curve represent?',
    options: [
      'The 5th percentile worst-case path, meaning 95% of simulated stochastic paths performed better.',
      'A guaranteed price support floor that cannot be breached.',
      'The average performance of the best 5 stocks.',
      'A 5% dividend yield payment.'
    ],
    correctIndex: 0,
    explanation: 'The P5 path is the 5th percentile outcome across 350 geometric Brownian motion paths, representing severe downside stress for risk planning.',
    relatedFeatureRoute: '/app/wealth/scenarios'
  },

  // Category 6: PLATFORM TOOLS & ADVANCED QUANTITATIVE FEATURES
  {
    id: 601,
    category: 'BEGINNER',
    difficulty: 'Intermediate',
    question: 'In a Bracket OCO (One-Cancels-the-Other) order on TradeSphere AI, what happens when the Take-Profit leg is filled?',
    options: [
      'The Stop-Loss leg remains open and can be triggered later.',
      'The Stop-Loss child leg is immediately and automatically cancelled by the state machine.',
      'Both legs are doubled in size.',
      'The trader must manually log in and click cancel.'
    ],
    correctIndex: 1,
    explanation: 'Bracket OCO orders couple the Take-Profit and Stop-Loss orders. When one child leg executes, the counter-leg is immediately cancelled by the OMS to prevent accidental counter-trend exposure.',
    relatedFeatureRoute: '/app/paper-trading'
  },
  {
    id: 602,
    category: 'RISK',
    difficulty: 'Intermediate',
    question: 'How does the Trade Journal Tilt Auditor detect potential revenge trading?',
    options: [
      'By checking if the user typed angry keywords in their notes.',
      'By flagging trades placed within 60 seconds of a stopped-out loss or trades with oversized position sizing.',
      'By measuring the trader\'s physical heart rate via webcam.',
      'By randomly locking the terminal after 5 trades.'
    ],
    correctIndex: 1,
    explanation: 'The Tilt Auditor analyzes order timestamps and sizing. Entering positions immediately after taking a loss or dramatically increasing quantity is an empirical signature of emotional tilt and revenge trading.',
    relatedFeatureRoute: '/app/risk/journal'
  },
  {
    id: 603,
    category: 'OPTIONS',
    difficulty: 'Advanced',
    question: 'Why does option Vega peak for At-the-Money (ATM) contracts and drop off for deep In-the-Money or deep Out-of-the-Money contracts?',
    options: [
      'Because exchanges apply special margin fees only to ATM options.',
      'Because ATM options have the maximum extrinsic time value and uncertainty, making their fair price most sensitive to shifts in volatility.',
      'Because Vega is always equal to 1.0 for all strikes.',
      'Because ATM options are exclusively cash-settled.'
    ],
    correctIndex: 1,
    explanation: 'Vega measures ∂V/∂σ. Deep ITM options behave like underlying stock (Delta ~ 1.0, low time value) and deep OTM options have low probability of expiring in the money. ATM options contain peak extrinsic value and maximum volatility sensitivity.',
    relatedFeatureRoute: '/app/risk/greeks'
  },
  {
    id: 604,
    category: 'WEALTH',
    difficulty: 'Intermediate',
    question: 'In the Step-Up SIP Planner, what is the impact of a 10% annual Step-Up compared to a fixed monthly SIP over 20 years?',
    options: [
      'It has no effect because interest rates remain flat.',
      'It significantly expands the final maturity corpus because higher contributions are invested during higher-income career years, multiplying compounding growth.',
      'It halves your total wealth due to taxation.',
      'It forces the trader to liquidate their stock portfolio every December.'
    ],
    correctIndex: 1,
    explanation: 'A Step-Up SIP increases monthly contributions each year inline with career salary growth (e.g. 10%). Because later contributions are larger, the terminal corpus often exceeds a flat SIP by 80% to 150% over a 20-year horizon.',
    relatedFeatureRoute: '/app/wealth/sip-planner'
  },
  {
    id: 605,
    category: 'QUANT',
    difficulty: 'Advanced',
    question: 'What is the role of the Evidence Verification Engine in the 7-Agent Quantitative Architecture?',
    options: [
      'To execute high-frequency arbitrage trades directly on live stock exchanges.',
      'To autonomously audit specialist agent outputs against regulatory invariants, verifying that mathematical formulas and risk constraints are strictly satisfied.',
      'To delete all negative financial news articles.',
      'To generate random buy signals when market volume is low.'
    ],
    correctIndex: 1,
    explanation: 'The Evidence Verification Engine acts as an independent auditor. It verifies that agent claims adhere to mathematical invariants (such as valid Sharpe ratios, bounded probabilities, and non-empty evidence citations) before results are presented.',
    relatedFeatureRoute: '/app/quant/multi-agent'
  },
  {
    id: 606,
    category: 'QUANT',
    difficulty: 'Advanced',
    question: 'In the Vectorized Strategy Backtester, why is accounting for bid-ask slippage and commissions essential?',
    options: [
      'To make backtest results look artificially higher.',
      'Because frictionless backtests create severe overfitting illusions where strategies that appear profitable on paper actually lose money in real execution.',
      'Because regulatory exchanges require backtests to simulate a 50% commission rate.',
      'Slippage has zero impact on intraday trading strategies.'
    ],
    correctIndex: 1,
    explanation: 'Frictionless backtests assume every fill occurs at the exact mid-price with zero execution delay. In reality, crossing the bid-ask spread and paying transaction costs can turn a theoretically profitable strategy into a net losing one.',
    relatedFeatureRoute: '/app/quant/backtesting'
  },
  {
    id: 607,
    category: 'TECHNICAL',
    difficulty: 'Intermediate',
    question: 'When analyzing the 20-Level Depth of Market (DOM) ladder, what does a large resting Bid Wall represent?',
    options: [
      'An indicator that all buyers have cancelled their accounts.',
      'A dense concentration of limit buy orders at a specific price tier that can absorb aggressive market sell orders and act as short-term support.',
      'A regulatory halt placed on the stock.',
      'An order book that has run out of liquidity.'
    ],
    correctIndex: 1,
    explanation: 'A Bid Wall represents significant resting liquidity on the buy side of the order book ladder. For market price to decline through that level, aggressive sellers must consume all resting buy quantity at that price.',
    relatedFeatureRoute: '/app/risk/depth'
  }
];

// 5. Practical Hands-On Trading Exercises (Connecting theory directly to action)
export const PRACTICAL_EXERCISES: PracticalExercise[] = [
  {
    id: 'ex-1',
    title: 'Exercise 1: Calculate Strict 1.0% Risk Safe Position Size',
    difficulty: 'Beginner',
    targetFeature: 'Risk Management & Guardrails',
    featureRoute: '/app/risk?symbol=RELIANCE',
    scenario: 'You are trading RELIANCE with ₹10,00,000 starting equity. The stock is currently trading at ₹2,980. Your technical plan calls for a breakout buy at ₹2,980 with a mandatory Stop-Loss placed at ₹2,930.',
    task: 'Determine your exact risk per share, your total allowed cash risk, and the maximum safe share quantity you can purchase under Rule A.',
    hints: [
      'Max allowed risk cash = ₹10,00,000 × 1.0% = ₹10,000.',
      'Risk per share = Entry (₹2,980) - Stop-Loss (₹2,930) = ₹50.',
      'Safe Quantity = ₹10,000 ÷ ₹50.'
    ],
    solution: 'Risk per share is ₹50. Maximum allowable risk is ₹10,000. Maximum safe quantity is 200 shares. Total capital required is 200 × ₹2,980 = ₹5,96,000. If stopped out, total loss is exactly ₹10,000 (1.0% of equity).'
  },
  {
    id: 'ex-2',
    title: 'Exercise 2: Identify DOM Liquidity Walls & Micro-Price Skew',
    difficulty: 'Intermediate',
    targetFeature: '20-Level Depth of Market',
    featureRoute: '/app/risk/depth?symbol=NVDA',
    scenario: 'You open the Level 2 DOM ladder for NVDA at $142.50. You observe a massive 15,000-share bid cluster at $141.00 (Level 5) and only 2,500 shares scattered across asks between $142.50 and $144.00.',
    task: 'Analyze the Order Book Imbalance, identify whether buyers or sellers have the structural edge, and establish a logical entry and stop loss.',
    hints: [
      'The $141.00 cluster acts as a potential liquidity support wall.',
      'Order Book Imbalance is strongly positive (bid-dominant).',
      'Placing a stop-loss just below $140.90 leverages institutional order absorption.'
    ],
    solution: 'The heavy bid wall at $141.00 creates structural support. Buyers have the order-flow edge with positive depth imbalance. A logical setup is buying near $141.50–$142.00 with a stop-loss at $140.80 below the wall.'
  },
  {
    id: 'ex-3',
    title: 'Exercise 3: Construct a Defined-Risk Bull Call Spread for Earnings',
    difficulty: 'Advanced',
    targetFeature: 'Options Strategy Payoff Modeler',
    featureRoute: '/app/risk/payoff?symbol=TCS',
    scenario: 'TCS reports earnings in 14 days and is trading at ₹4,120. Implied volatility has spiked to 32%. You have a moderately bullish outlook targeting ₹4,250, but fear an IV crush post-announcement.',
    task: 'Design a Bull Call Debit Spread that caps maximum loss and shields against IV crush, and calculate your breakeven.',
    hints: [
      'Buy the ₹4,100 Call and sell the ₹4,250 Call with 14 DTE.',
      'Selling the ₹4,250 Call brings in premium to offset high IV.',
      'Breakeven = Lower Strike + Net Debit Paid.'
    ],
    solution: 'Buy 4100 CE and sell 4250 CE for a net debit of ₹45. Max loss is strictly capped at ₹45 × 175 lot = ₹7,875. Max profit is (150 width - 45 debit) × 175 = ₹18,375. Breakeven is ₹4,145. If IV drops, the short call gains value, protecting the trade.'
  },
  {
    id: 'ex-4',
    title: 'Exercise 4: Construct an Indo-US Markowitz Efficient Portfolio',
    difficulty: 'Intermediate',
    targetFeature: 'MPT Portfolio Optimizer',
    featureRoute: '/app/wealth/optimizer',
    scenario: 'An investor holds 100% of their capital in Indian tech (TCS and INFY). During a localized tech sector correction, the portfolio suffers a steep 18% drawdown.',
    task: 'Use the MPT Optimizer to select 4 uncorrelated assets across Indian and US markets to achieve a higher Sharpe ratio.',
    hints: [
      'Combine Indian banking (HDFCBANK) and energy (RELIANCE) with US tech (NVDA / MSFT) and broad benchmark (SPY).',
      'Cross-border currency and sector diversification flattens the covariance matrix.'
    ],
    solution: 'By adding RELIANCE (0.15 correlation with US tech), HDFCBANK, and SPY, portfolio volatility drops from 22.5% to 15.8% while Sharpe ratio increases from 0.65 to 1.18. Diversification provides a genuine free lunch.'
  }
];
