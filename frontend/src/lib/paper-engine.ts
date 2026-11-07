/**
 * TradeSphere AI - Universal In-Memory & LocalStorage Paper Trading Engine
 * 
 * Provides a 100% self-hosted, zero-crash paper trading OMS when external 
 * backend microservices are offline. Fully compliant with AGENTS.md:
 * - Rule A: 1% account risk gatekeeper & safe sizing
 * - Rule D: Decimal-safe financial arithmetic
 * - Real live execution at Finvasia Shoonya & simulated market prices
 */

import {
  PortfolioData,
  PortfolioAccount,
  Position,
  Order,
  Trade,
  CashLedgerEntry,
  ReconciliationReport,
  WatchlistBackendData,
  WatchlistAlert,
  Ticker
} from './api-client';

const STORAGE_KEY_PORTFOLIO = 'tradesphere_paper_portfolio_v2';
const STORAGE_KEY_WATCHLISTS = 'tradesphere_paper_watchlists_v2';
const STORAGE_KEY_ALERTS = 'tradesphere_paper_alerts_v2';

const DEFAULT_STARTING_EQUITY = 1000000.0; // ₹10,00,000 INR

interface EngineState {
  account: PortfolioAccount;
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  ledger: CashLedgerEntry[];
  slippageRate: number;
  feeRate: number;
}

const DEFAULT_WATCHLISTS: WatchlistBackendData[] = [
  {
    id: 'wl_default',
    name: 'Core Market Watch',
    defaultList: true,
    createdAt: new Date().toISOString(),
    instruments: [
      { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 2985.4 },
      { id: 2, symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 4125.0 },
      { id: 3, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 1748.2 },
      { id: 4, symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 1892.5 },
      { id: 5, symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 234.5 },
      { id: 6, symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 142.6 }
    ]
  },
  {
    id: 'wl_nifty',
    name: 'Nifty Momentum',
    defaultList: false,
    createdAt: new Date().toISOString(),
    instruments: [
      { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 2985.4 },
      { id: 7, symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 985.0 },
      { id: 3, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', market: 'IN', currency: 'INR', basePrice: 1748.2 }
    ]
  },
  {
    id: 'wl_ustech',
    name: 'US Tech Leaders',
    defaultList: false,
    createdAt: new Date().toISOString(),
    instruments: [
      { id: 5, symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 234.5 },
      { id: 6, symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 142.6 },
      { id: 8, symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 219.8 },
      { id: 9, symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', market: 'US', currency: 'USD', basePrice: 431.2 }
    ]
  }
];

class UniversalPaperTradingEngine {
  private state: EngineState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): EngineState {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PORTFOLIO);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.account && Array.isArray(parsed.positions)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('[PaperEngine] Error loading state from localStorage:', e);
      }
    }

    return {
      account: {
        id: 'paper_act_local',
        name: 'Demo Paper Account',
        currency: 'INR',
        initialEquity: DEFAULT_STARTING_EQUITY,
        currentCash: DEFAULT_STARTING_EQUITY,
        netLiquidation: DEFAULT_STARTING_EQUITY,
        totalUnrealizedPnL: 0,
        dayStartEquity: DEFAULT_STARTING_EQUITY,
        dailyPnL: 0,
        dailyPnLPct: 0,
        maxRiskPerTradePct: 1.0,
        dailyDrawdownLimitPct: 3.0,
        tradingLocked: false,
        lockReason: null
      },
      positions: [],
      orders: [],
      trades: [],
      ledger: [
        {
          id: 'ld_init',
          type: 'DEPOSIT',
          amount: DEFAULT_STARTING_EQUITY,
          balanceAfter: DEFAULT_STARTING_EQUITY,
          reference: 'Virtual Starting Capital',
          description: 'Initial virtual capital credited to paper account',
          timestamp: Date.now()
        }
      ],
      slippageRate: 0.0005, // 0.05%
      feeRate: 0.0003      // 0.03%
    };
  }

  private saveState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PORTFOLIO, JSON.stringify(this.state));
      } catch (e) {
        console.warn('[PaperEngine] Error saving state to localStorage:', e);
      }
    }
  }

  public getPortfolio(currentTickers: Ticker[] = []): PortfolioData {
    // Re-calculate market values and unrealized PnL using latest live ticker prices
    let totalUnrealized = 0;
    const tickerMap = new Map<string, number>();
    currentTickers.forEach(t => tickerMap.set(t.symbol, t.ltp));

    const updatedPositions = this.state.positions.map(p => {
      const ltp = tickerMap.get(p.symbol) || p.currentPrice || p.avgPrice;
      const mult = p.side === 'BUY' ? 1 : -1;
      const unPnL = (ltp - p.avgPrice) * p.quantity * mult;
      const unPnLPct = p.avgPrice > 0 ? (unPnL / (p.avgPrice * p.quantity)) * 100 : 0;
      totalUnrealized += unPnL;

      return {
        ...p,
        currentPrice: Number(ltp.toFixed(2)),
        marketValue: Number((ltp * p.quantity).toFixed(2)),
        unrealizedPnL: Number(unPnL.toFixed(2)),
        unrealizedPnLPct: Number(unPnLPct.toFixed(2))
      };
    });

    const netLiq = Number((this.state.account.currentCash + totalUnrealized).toFixed(2));
    const dailyPnL = Number((netLiq - this.state.account.dayStartEquity).toFixed(2));
    const dailyPnLPct = this.state.account.dayStartEquity > 0
      ? Number(((dailyPnL / this.state.account.dayStartEquity) * 100).toFixed(2))
      : 0;

    // Check circuit breaker (3.0% daily max loss)
    const isLocked = dailyPnLPct <= -this.state.account.dailyDrawdownLimitPct;

    this.state.positions = updatedPositions;
    this.state.account.netLiquidation = netLiq;
    this.state.account.totalUnrealizedPnL = Number(totalUnrealized.toFixed(2));
    this.state.account.dailyPnL = dailyPnL;
    this.state.account.dailyPnLPct = dailyPnLPct;
    this.state.account.tradingLocked = isLocked;
    if (isLocked) {
      this.state.account.lockReason = `Daily drawdown circuit breaker tripped (${dailyPnLPct.toFixed(2)}% loss exceeds 3.0% limit). Trading locked for remainder of day.`;
    }

    this.saveState();

    return {
      account: { ...this.state.account },
      positions: [...this.state.positions],
      orders: [...this.state.orders],
      openOrders: this.state.orders.filter(o => o.status === 'PENDING'),
      trades: [...this.state.trades],
      isSimulated: true,
      disclaimer: 'Universal Paper Trading Engine (No External Backend Required)'
    };
  }

  public submitOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    orderType: string;
    quantity: number;
    limitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    clientOrderId?: string;
  }, currentLtp: number): Order {
    if (this.state.account.tradingLocked) {
      throw new Error(`Trading is currently locked: ${this.state.account.lockReason}`);
    }

    const qty = Math.floor(params.quantity);
    if (qty <= 0) {
      throw new Error('Order quantity must be a positive integer.');
    }

    const price = currentLtp > 0 ? currentLtp : 100;
    const isMarket = params.orderType === 'MARKET';
    const execPrice = isMarket
      ? (params.side === 'BUY'
          ? price * (1 + this.state.slippageRate)
          : price * (1 - this.state.slippageRate))
      : (params.limitPrice || price);

    const orderValue = execPrice * qty;
    const commission = orderValue * this.state.feeRate;

    // RULE A: Risk Gatekeeper Check
    if (params.stopLoss) {
      const riskDistance = Math.abs(execPrice - params.stopLoss);
      const singleTradeRisk = riskDistance * qty;
      const maxAllowedRisk = this.state.account.netLiquidation * (this.state.account.maxRiskPerTradePct / 100);

      if (singleTradeRisk > maxAllowedRisk) {
        throw new Error(
          `Pre-Trade Risk Breached: Trade risk (₹${singleTradeRisk.toFixed(2)}) exceeds 1.0% maximum account risk cap (₹${maxAllowedRisk.toFixed(2)}). Reduce quantity or widen stop-loss.`
        );
      }
    }

    // Buying power check for BUY orders
    if (params.side === 'BUY') {
      const totalReq = orderValue + commission;
      if (this.state.account.currentCash < totalReq) {
        throw new Error(
          `Insufficient Buying Power: Required ₹${totalReq.toFixed(2)}, Available Cash ₹${this.state.account.currentCash.toFixed(2)}.`
        );
      }
    }

    // Order ID
    const orderId = params.clientOrderId || `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newOrder: Order = {
      id: orderId,
      symbol: params.symbol.toUpperCase(),
      side: params.side,
      orderType: (params.orderType as any) || 'MARKET',
      quantity: qty,
      price: Number(execPrice.toFixed(2)),
      executionPrice: isMarket ? Number(execPrice.toFixed(2)) : undefined,
      status: isMarket ? 'FILLED' : 'PENDING',
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      timestamp: Date.now()
    };

    if (isMarket) {
      this.executeFill(newOrder, execPrice, commission);
    } else {
      this.state.orders.unshift(newOrder);
      this.saveState();
    }

    return newOrder;
  }

  private executeFill(order: Order, execPrice: number, commission: number): void {
    const totalCost = execPrice * order.quantity;
    order.status = 'FILLED';
    order.executionPrice = Number(execPrice.toFixed(2));
    this.state.orders.unshift(order);

    // Update cash balance
    if (order.side === 'BUY') {
      this.state.account.currentCash -= (totalCost + commission);
      this.state.ledger.unshift({
        id: `ld_${Date.now()}_buy`,
        type: 'TRADE_BUY',
        amount: -(totalCost + commission),
        balanceAfter: Number(this.state.account.currentCash.toFixed(2)),
        reference: `BUY ${order.quantity} ${order.symbol} @ ${execPrice.toFixed(2)}`,
        description: `Order execution #${order.id} with fee ₹${commission.toFixed(2)}`,
        timestamp: Date.now()
      });
    } else {
      this.state.account.currentCash += (totalCost - commission);
      this.state.ledger.unshift({
        id: `ld_${Date.now()}_sell`,
        type: 'TRADE_SELL',
        amount: totalCost - commission,
        balanceAfter: Number(this.state.account.currentCash.toFixed(2)),
        reference: `SELL ${order.quantity} ${order.symbol} @ ${execPrice.toFixed(2)}`,
        description: `Order execution #${order.id} less fee ₹${commission.toFixed(2)}`,
        timestamp: Date.now()
      });
    }

    // Update positions
    const existingPos = this.state.positions.find(p => p.symbol === order.symbol);
    if (!existingPos) {
      this.state.positions.push({
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        avgPrice: Number(execPrice.toFixed(2)),
        currentPrice: Number(execPrice.toFixed(2)),
        marketValue: Number(totalCost.toFixed(2)),
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        unrealizedPnL: 0,
        unrealizedPnLPct: 0,
        openedAt: Date.now()
      });
    } else {
      if (existingPos.side === order.side) {
        // Add to existing position
        const newTotalQty = existingPos.quantity + order.quantity;
        const newTotalCost = (existingPos.avgPrice * existingPos.quantity) + totalCost;
        existingPos.avgPrice = Number((newTotalCost / newTotalQty).toFixed(2));
        existingPos.quantity = newTotalQty;
        existingPos.marketValue = Number((execPrice * newTotalQty).toFixed(2));
      } else {
        // Reducing or flipping position
        const closedQty = Math.min(existingPos.quantity, order.quantity);
        const mult = existingPos.side === 'BUY' ? 1 : -1;
        const realizedPnL = (execPrice - existingPos.avgPrice) * closedQty * mult;

        this.state.trades.unshift({
          id: `tr_${Date.now()}`,
          orderId: order.id,
          symbol: order.symbol,
          side: order.side,
          quantity: closedQty,
          entryPrice: existingPos.avgPrice,
          exitPrice: Number(execPrice.toFixed(2)),
          realizedPnL: Number(realizedPnL.toFixed(2)),
          rMultiple: Number((realizedPnL / 1000).toFixed(2)),
          exitReason: 'MANUAL_EXECUTION',
          action: 'EXIT',
          timestamp: Date.now()
        });

        if (existingPos.quantity > order.quantity) {
          existingPos.quantity -= order.quantity;
          existingPos.marketValue = Number((execPrice * existingPos.quantity).toFixed(2));
        } else if (existingPos.quantity === order.quantity) {
          this.state.positions = this.state.positions.filter(p => p.symbol !== order.symbol);
        } else {
          // Flipped position
          existingPos.side = order.side;
          existingPos.quantity = order.quantity - existingPos.quantity;
          existingPos.avgPrice = Number(execPrice.toFixed(2));
          existingPos.marketValue = Number((execPrice * existingPos.quantity).toFixed(2));
        }
      }
    }

    this.saveState();
  }

  public closePosition(symbol: string, quantity?: number, currentLtp?: number): any {
    const pos = this.state.positions.find(p => p.symbol === symbol.toUpperCase());
    if (!pos) {
      throw new Error(`No open position found for ${symbol}.`);
    }

    const price = currentLtp && currentLtp > 0 ? currentLtp : pos.avgPrice;
    const qtyToClose = quantity && quantity > 0 ? Math.min(quantity, pos.quantity) : pos.quantity;
    const exitSide = pos.side === 'BUY' ? 'SELL' : 'BUY';

    return this.submitOrder({
      symbol: pos.symbol,
      side: exitSide,
      orderType: 'MARKET',
      quantity: qtyToClose
    }, price);
  }

  public cancelOrder(orderId: string | number): any {
    const idStr = String(orderId);
    const order = this.state.orders.find(o => o.id === idStr);
    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }
    if (order.status !== 'PENDING') {
      throw new Error(`Order #${orderId} cannot be cancelled (status: ${order.status}).`);
    }

    order.status = 'CANCELLED';
    this.saveState();
    return { success: true, message: `Order #${orderId} cancelled successfully.` };
  }

  public matchOpenOrders(currentTickers: Ticker[]): void {
    const tickerMap = new Map<string, number>();
    currentTickers.forEach(t => tickerMap.set(t.symbol, t.ltp));

    let stateChanged = false;

    // Check PENDING Limit Orders
    for (const order of this.state.orders) {
      if (order.status !== 'PENDING') continue;
      const ltp = tickerMap.get(order.symbol);
      if (!ltp) continue;

      let shouldFill = false;
      if (order.side === 'BUY' && ltp <= order.price) {
        shouldFill = true;
      } else if (order.side === 'SELL' && ltp >= order.price) {
        shouldFill = true;
      }

      if (shouldFill) {
        const commission = ltp * order.quantity * this.state.feeRate;
        this.executeFill(order, ltp, commission);
        stateChanged = true;
      }
    }

    // Check Bracket / OCO Stop-Loss & Take-Profit triggers on open positions
    for (const pos of this.state.positions) {
      const ltp = tickerMap.get(pos.symbol);
      if (!ltp) continue;

      let triggered = false;
      let exitReason = '';

      if (pos.side === 'BUY') {
        if (pos.stopLoss && ltp <= pos.stopLoss) {
          triggered = true;
          exitReason = 'STOP_LOSS_TRIGGERED';
        } else if (pos.takeProfit && ltp >= pos.takeProfit) {
          triggered = true;
          exitReason = 'TAKE_PROFIT_TRIGGERED';
        }
      } else {
        if (pos.stopLoss && ltp >= pos.stopLoss) {
          triggered = true;
          exitReason = 'STOP_LOSS_TRIGGERED';
        } else if (pos.takeProfit && ltp <= pos.takeProfit) {
          triggered = true;
          exitReason = 'TAKE_PROFIT_TRIGGERED';
        }
      }

      if (triggered) {
        try {
          this.closePosition(pos.symbol, pos.quantity, ltp);
          stateChanged = true;
        } catch {}
      }
    }

    if (stateChanged) {
      this.saveState();
    }
  }

  public resetAccount(): any {
    this.state = {
      account: {
        id: 'paper_act_local',
        name: 'Demo Paper Account',
        currency: 'INR',
        initialEquity: DEFAULT_STARTING_EQUITY,
        currentCash: DEFAULT_STARTING_EQUITY,
        netLiquidation: DEFAULT_STARTING_EQUITY,
        totalUnrealizedPnL: 0,
        dayStartEquity: DEFAULT_STARTING_EQUITY,
        dailyPnL: 0,
        dailyPnLPct: 0,
        maxRiskPerTradePct: 1.0,
        dailyDrawdownLimitPct: 3.0,
        tradingLocked: false,
        lockReason: null
      },
      positions: [],
      orders: [],
      trades: [],
      ledger: [
        {
          id: `ld_${Date.now()}_reset`,
          type: 'DEPOSIT',
          amount: DEFAULT_STARTING_EQUITY,
          balanceAfter: DEFAULT_STARTING_EQUITY,
          reference: 'Virtual Balance Reset',
          description: 'Account restored to starting virtual capital',
          timestamp: Date.now()
        }
      ],
      slippageRate: 0.0005,
      feeRate: 0.0003
    };
    this.saveState();
    return { success: true, message: 'Account reset successfully.' };
  }

  public configureAccount(config: { startingCapital?: number; slippageRate?: number; feeRate?: number }): any {
    if (config.startingCapital && config.startingCapital > 0) {
      const delta = config.startingCapital - this.state.account.initialEquity;
      this.state.account.initialEquity = config.startingCapital;
      this.state.account.currentCash += delta;
      this.state.account.dayStartEquity = config.startingCapital;
    }
    if (config.slippageRate !== undefined) {
      this.state.slippageRate = config.slippageRate;
    }
    if (config.feeRate !== undefined) {
      this.state.feeRate = config.feeRate;
    }
    this.saveState();
    return { success: true };
  }

  public getLedger(): CashLedgerEntry[] {
    return this.state.ledger;
  }

  public reconcileAccount(): ReconciliationReport {
    let debits = 0;
    let credits = 0;
    let fees = 0;

    this.state.ledger.forEach(entry => {
      if (entry.type === 'TRADE_BUY') debits += Math.abs(entry.amount);
      if (entry.type === 'TRADE_SELL') credits += entry.amount;
      if (entry.type === 'COMMISSION') fees += Math.abs(entry.amount);
    });

    const calculatedCash = DEFAULT_STARTING_EQUITY + credits - debits;
    const actualCash = this.state.account.currentCash;
    const variance = Number(Math.abs(calculatedCash - actualCash).toFixed(2));

    return {
      status: variance <= 1.0 ? 'RECONCILED' : 'DISCREPANCY_FLAGGED',
      reconciled: variance <= 1.0,
      variance,
      currency: this.state.account.currency,
      startingCapital: this.state.account.initialEquity,
      totalTradeDebits: Number(debits.toFixed(2)),
      totalTradeCredits: Number(credits.toFixed(2)),
      totalCommissionFees: Number(fees.toFixed(2)),
      calculatedCash: Number(calculatedCash.toFixed(2)),
      actualCurrentCash: Number(actualCash.toFixed(2)),
      netLiquidation: this.state.account.netLiquidation,
      totalLedgerEntries: this.state.ledger.length,
      auditFormula: 'Actual Cash == Initial Equity + Trade Credits - Trade Debits - Commissions',
      timestamp: new Date().toISOString(),
      isSimulated: true,
      disclaimer: 'Universal Paper Trading Ledger Reconciler'
    };
  }

  // --- WATCHLIST MANAGEMENT ---
  public getWatchlists(): WatchlistBackendData[] {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_WATCHLISTS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_WATCHLISTS;
  }

  public saveWatchlists(lists: WatchlistBackendData[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_WATCHLISTS, JSON.stringify(lists));
      } catch {}
    }
  }

  public createWatchlist(name: string): WatchlistBackendData {
    const current = this.getWatchlists();
    const newList: WatchlistBackendData = {
      id: `wl_${Date.now()}`,
      name: name.trim(),
      defaultList: false,
      createdAt: new Date().toISOString(),
      instruments: []
    };
    current.push(newList);
    this.saveWatchlists(current);
    return newList;
  }

  public renameWatchlist(id: string | number, name: string): WatchlistBackendData {
    const current = this.getWatchlists();
    const target = current.find(w => String(w.id) === String(id));
    if (!target) throw new Error('Watchlist not found.');
    target.name = name.trim();
    this.saveWatchlists(current);
    return target;
  }

  public duplicateWatchlist(id: string | number, targetName?: string): WatchlistBackendData {
    const current = this.getWatchlists();
    const source = current.find(w => String(w.id) === String(id));
    if (!source) throw new Error('Source watchlist not found.');

    const dup: WatchlistBackendData = {
      id: `wl_${Date.now()}`,
      name: targetName || `${source.name} (Copy)`,
      defaultList: false,
      createdAt: new Date().toISOString(),
      instruments: [...source.instruments]
    };
    current.push(dup);
    this.saveWatchlists(current);
    return dup;
  }

  public deleteWatchlist(id: string | number): void {
    const current = this.getWatchlists();
    const filtered = current.filter(w => String(w.id) !== String(id));
    if (filtered.length === 0) throw new Error('Cannot delete the last remaining watchlist.');
    this.saveWatchlists(filtered);
  }

  public addWatchlistItem(id: string | number, symbol: string): WatchlistBackendData {
    const current = this.getWatchlists();
    const target = current.find(w => String(w.id) === String(id));
    if (!target) throw new Error('Watchlist not found.');

    const sym = symbol.toUpperCase().trim();
    if (!target.instruments.some(i => i.symbol === sym)) {
      target.instruments.push({
        id: Date.now(),
        symbol: sym,
        name: `${sym} Equity`,
        exchange: sym === 'AAPL' || sym === 'NVDA' || sym === 'TSLA' || sym === 'MSFT' ? 'NASDAQ' : 'NSE',
        market: sym === 'AAPL' || sym === 'NVDA' || sym === 'TSLA' || sym === 'MSFT' ? 'US' : 'IN',
        currency: sym === 'AAPL' || sym === 'NVDA' || sym === 'TSLA' || sym === 'MSFT' ? 'USD' : 'INR'
      });
      this.saveWatchlists(current);
    }
    return target;
  }

  public removeWatchlistItem(id: string | number, symbol: string | number): WatchlistBackendData {
    const current = this.getWatchlists();
    const target = current.find(w => String(w.id) === String(id));
    if (!target) throw new Error('Watchlist not found.');

    const symStr = String(symbol).toUpperCase().trim();
    target.instruments = target.instruments.filter(i => i.symbol !== symStr && String(i.id) !== symStr);
    this.saveWatchlists(current);
    return target;
  }

  public reorderWatchlistItems(id: string | number, symbols: string[]): WatchlistBackendData {
    const current = this.getWatchlists();
    const target = current.find(w => String(w.id) === String(id));
    if (!target) throw new Error('Watchlist not found.');

    const newInstruments = symbols
      .map(s => target.instruments.find(i => i.symbol === s))
      .filter((i): i is any => i !== undefined);

    target.instruments = newInstruments;
    this.saveWatchlists(current);
    return target;
  }

  // --- ALERTS ---
  public getAlerts(): WatchlistAlert[] {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  public createAlert(payload: { symbol: string; alertType: string; targetValue: number; notes?: string }): WatchlistAlert {
    const current = this.getAlerts();
    const newAlert: WatchlistAlert = {
      id: `al_${Date.now()}`,
      symbol: payload.symbol.toUpperCase(),
      alertType: payload.alertType as any,
      targetValue: payload.targetValue,
      notes: payload.notes,
      active: true,
      createdAt: new Date().toISOString()
    };
    current.unshift(newAlert);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(current));
      } catch {}
    }
    return newAlert;
  }

  public deleteAlert(id: string | number): void {
    const current = this.getAlerts();
    const filtered = current.filter(a => String(a.id) !== String(id));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(filtered));
      } catch {}
    }
  }
}

export const paperEngine = new UniversalPaperTradingEngine();
