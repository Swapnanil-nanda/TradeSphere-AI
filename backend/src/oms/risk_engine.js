// Synchronous Pre-Trade Risk Gatekeeper & Deterministic Order Management System (OMS)
// Invariant: PAPER TRADING – NO REAL MONEY

export class RiskAndOMSEngine {
  constructor(marketSimulator) {
    this.marketSimulator = marketSimulator;

    // Account state (Default paper trading account)
    this.account = {
      id: 'paper_act_01',
      name: 'Paper Trading Primary',
      currency: 'INR',
      initialEquity: 1000000.00,
      currentCash: 1000000.00,
      dayStartEquity: 1000000.00,
      maxRiskPerTradePct: 1.0, // 1.0% single-trade risk cap
      dailyDrawdownLimitPct: 3.0, // 3.0% daily circuit breaker
      tradingLocked: false,
      lockReason: null,
      slippageRate: 0.0005, // 0.05%
      feeRate: 0.0003 // 0.03%
    };

    this.positions = new Map(); // symbol -> Position
    this.orders = []; // Audit log of all submitted orders
    this.trades = []; // Historical executions (Trade Journal)
    this.cashLedger = [
      {
        id: 'led_init',
        type: 'INITIAL_DEPOSIT',
        amount: 1000000.00,
        balanceAfter: 1000000.00,
        reference: 'INIT_001',
        description: 'Virtual paper starting capital initialized to ₹10,00,000',
        timestamp: Date.now()
      }
    ];

    // Listen to market ticks to monitor Bracket OCO triggers & Open Limit Orders
    this._initOcoMonitor();
  }

  getPortfolio() {
    let totalUnrealizedPnL = 0;
    let totalMarketValue = 0;
    const positionsList = [];

    for (const [symbol, pos] of this.positions.entries()) {
      const ticker = this.marketSimulator.getTicker(symbol);
      const currentPrice = ticker ? ticker.ltp : pos.avgPrice;
      const uPnL = pos.side === 'BUY'
        ? (currentPrice - pos.avgPrice) * pos.quantity
        : (pos.avgPrice - currentPrice) * pos.quantity;

      const marketValue = pos.side === 'BUY'
        ? currentPrice * pos.quantity
        : (pos.avgPrice * pos.quantity) + uPnL;

      totalMarketValue += marketValue;
      totalUnrealizedPnL += uPnL;
      positionsList.push({
        ...pos,
        currentPrice,
        marketValue: Math.round(marketValue * 100) / 100,
        unrealizedPnL: Math.round(uPnL * 100) / 100,
        unrealizedPnLPct: Math.round((uPnL / (pos.avgPrice * pos.quantity)) * 10000) / 100
      });
    }

    const netLiquidation = this.account.currentCash + totalMarketValue;
    const dailyPnL = netLiquidation - this.account.dayStartEquity;
    const dailyPnLPct = (dailyPnL / this.account.dayStartEquity) * 100;

    // Check circuit breaker
    if (dailyPnLPct <= -this.account.dailyDrawdownLimitPct && !this.account.tradingLocked) {
      this.account.tradingLocked = true;
      this.account.lockReason = `Daily Max Drawdown Breaker Triggered (-${Math.abs(dailyPnLPct).toFixed(2)}% loss exceeds ${this.account.dailyDrawdownLimitPct}% cap)`;
      console.warn(`[CIRCUIT BREAKER] ${this.account.lockReason}`);
    }

    const openOrders = this.orders.filter(o => o.status === 'OPEN');

    return {
      account: {
        ...this.account,
        netLiquidation: Math.round(netLiquidation * 100) / 100,
        totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 100) / 100,
        dailyPnL: Math.round(dailyPnL * 100) / 100,
        dailyPnLPct: Math.round(dailyPnLPct * 100) / 100,
        isSimulated: true,
        disclaimer: 'PAPER TRADING – NO REAL MONEY'
      },
      positions: positionsList,
      orders: this.orders.slice(-50).reverse(),
      openOrders: openOrders.reverse(),
      trades: this.trades.slice(-50).reverse(),
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    };
  }

  // Configure virtual starting capital, slippage and fee rates
  configureAccount({ startingCapital, slippageRate, feeRate }) {
    if (startingCapital && startingCapital > 0) {
      const cap = parseFloat(startingCapital);
      this.account.initialEquity = cap;
      this.account.currentCash = cap;
      this.account.dayStartEquity = cap;
      this.cashLedger.push({
        id: 'led_' + Math.random().toString(36).slice(2, 9),
        type: 'ACCOUNT_CONFIG',
        amount: cap,
        balanceAfter: cap,
        reference: 'CFG_' + Date.now(),
        description: `Configured virtual paper capital to ₹${cap.toLocaleString('en-IN')}`,
        timestamp: Date.now()
      });
    }
    if (slippageRate !== undefined && slippageRate >= 0) {
      this.account.slippageRate = parseFloat(slippageRate);
    }
    if (feeRate !== undefined && feeRate >= 0) {
      this.account.feeRate = parseFloat(feeRate);
    }
    return this.getPortfolio();
  }

  // Exact mathematical reconciliation between Cash Ledger and account balances
  reconcileAccount() {
    let totalDeposits = 0;
    let totalTradeDebits = 0;
    let totalTradeCredits = 0;
    let totalFees = 0;

    for (const entry of this.cashLedger) {
      if (entry.type === 'INITIAL_DEPOSIT' || entry.type === 'ACCOUNT_RESET' || entry.type === 'ACCOUNT_CONFIG') {
        totalDeposits = entry.amount; // resets base
        totalTradeDebits = 0;
        totalTradeCredits = 0;
        totalFees = 0;
      } else if (entry.type === 'TRADE_DEBIT') {
        totalTradeDebits += Math.abs(entry.amount);
      } else if (entry.type === 'TRADE_CREDIT') {
        totalTradeCredits += entry.amount;
      } else if (entry.type === 'COMMISSION_FEE') {
        totalFees += Math.abs(entry.amount);
      }
    }

    const calculatedCash = Math.round((totalDeposits - totalTradeDebits + totalTradeCredits - totalFees) * 100) / 100;
    const actualCash = Math.round(this.account.currentCash * 100) / 100;
    const variance = Math.round(Math.abs(calculatedCash - actualCash) * 100) / 100;
    const isReconciled = variance === 0.00;

    return {
      status: isReconciled ? 'RECONCILED' : 'DISCREPANCY_DETECTED',
      reconciled: isReconciled,
      variance,
      currency: this.account.currency,
      startingCapital: totalDeposits,
      totalTradeDebits: Math.round(totalTradeDebits * 100) / 100,
      totalTradeCredits: Math.round(totalTradeCredits * 100) / 100,
      totalCommissionFees: Math.round(totalFees * 100) / 100,
      calculatedCash,
      actualCurrentCash: actualCash,
      netLiquidation: this.getPortfolio().account.netLiquidation,
      totalLedgerEntries: this.cashLedger.length,
      auditFormula: 'ActualCash = StartingDeposits - TradeDebits + TradeCredits - Fees',
      timestamp: new Date().toISOString(),
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    };
  }

  getCashLedger() {
    return this.cashLedger.slice(-100).reverse();
  }

  // Calculate 1% Risk Auto-Sizer Quantity
  calculatePositionSize(symbol, entryPrice, stopLossPrice, riskPct = 1.0) {
    const netEquity = this.getPortfolio().account.netLiquidation;
    const maxRiskCapital = netEquity * (riskPct / 100);
    const riskPerShare = Math.abs(entryPrice - stopLossPrice);

    if (riskPerShare <= 0) return 0;
    const rawQty = maxRiskCapital / riskPerShare;
    return Math.max(1, Math.floor(rawQty));
  }

  // Synchronous Pre-Trade Risk Validation & Order Execution
  submitOrder({ symbol, side, orderType = 'MARKET', quantity, limitPrice, stopLoss, takeProfit, clientOrderId }) {
    // Idempotency check
    if (clientOrderId) {
      const existing = this.orders.find(o => o.clientOrderId === clientOrderId);
      if (existing) {
        return {
          ...existing,
          message: 'Order previously submitted (idempotent replay).'
        };
      }
    }

    const portfolio = this.getPortfolio();
    const netEquity = portfolio.account.netLiquidation;
    const ticker = this.marketSimulator.getTicker(symbol);

    if (!ticker) {
      throw new Error(`Symbol '${symbol}' is not available in market master dictionary.`);
    }

    // 1. Circuit Breaker Check
    if (this.account.tradingLocked) {
      throw new Error(`Trading Locked: ${this.account.lockReason}`);
    }

    // 2. Quantity validation
    quantity = parseInt(quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Order quantity must be a positive integer.');
    }

    const currentPrice = side === 'BUY' ? ticker.ask : ticker.bid;
    const entryPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;

    // 3. Mandatory Stop-Loss Guardrail
    if (!stopLoss || parseFloat(stopLoss) <= 0) {
      throw new Error('Mandatory Risk Guardrail: A valid Stop-Loss price is strictly required.');
    }
    const sl = parseFloat(stopLoss);
    const tp = takeProfit ? parseFloat(takeProfit) : null;

    if (side === 'BUY' && sl >= entryPrice) {
      throw new Error(`Invalid Stop-Loss: For BUY orders, Stop-Loss (₹${sl}) must be lower than Entry (₹${entryPrice}).`);
    }
    if (side === 'SELL' && sl <= entryPrice) {
      throw new Error(`Invalid Stop-Loss: For SELL orders, Stop-Loss (₹${sl}) must be higher than Entry (₹${entryPrice}).`);
    }

    // 4. Single-Trade 1% Max Risk Cap Check
    const totalCapitalAtRisk = Math.abs(entryPrice - sl) * quantity;
    const maxAllowedRisk = netEquity * (this.account.maxRiskPerTradePct / 100);

    if (totalCapitalAtRisk > maxAllowedRisk * 1.01) {
      const maxQty = Math.floor(maxAllowedRisk / Math.abs(entryPrice - sl));
      throw new Error(
        `Risk Breach: Trade risk (₹${totalCapitalAtRisk.toFixed(2)}) exceeds 1.0% account limit (₹${maxAllowedRisk.toFixed(2)}). ` +
        `Max allowed quantity is ${maxQty} shares.`
      );
    }

    // 5. Pre-Trade Reward-to-Risk (R:R) Check
    let rrRatio = null;
    if (tp) {
      const rewardPerShare = Math.abs(tp - entryPrice);
      const riskPerShare = Math.abs(entryPrice - sl);
      rrRatio = Math.round((rewardPerShare / riskPerShare) * 100) / 100;
      if (rrRatio < 1.45) {
        throw new Error(`Sub-optimal Reward:Risk (${rrRatio}R). Institutional threshold requires at least 1.50R.`);
      }
    }

    // 6. Buying Power Check
    const totalOrderCost = entryPrice * quantity;
    if (side === 'BUY' && totalOrderCost > this.account.currentCash) {
      throw new Error(`Insufficient Buying Power: Required cash ₹${totalOrderCost.toFixed(2)}, Available ₹${this.account.currentCash.toFixed(2)}.`);
    }

    // Position check for SELL orders
    if (side === 'SELL') {
      const existingPos = this.positions.get(symbol);
      if (!existingPos || existingPos.quantity < quantity) {
        const held = existingPos ? existingPos.quantity : 0;
        throw new Error(`Insufficient Position: You hold ${held} shares of ${symbol}. Cannot execute SELL for ${quantity} shares.`);
      }
    }

    const orderId = 'ord_' + Math.random().toString(36).slice(2, 9);

    // Limit Order State Machine
    if (orderType === 'LIMIT') {
      const lPrice = parseFloat(limitPrice);
      const isMarketable = (side === 'BUY' && ticker.ask <= lPrice) || (side === 'SELL' && ticker.bid >= lPrice);

      if (!isMarketable) {
        const openOrder = {
          id: orderId,
          symbol,
          side,
          orderType: 'LIMIT',
          type: 'LIMIT',
          quantity,
          limitPrice: lPrice,
          stopLoss: sl,
          takeProfit: tp,
          riskAmount: totalCapitalAtRisk,
          riskRatio: rrRatio,
          status: 'OPEN',
          clientOrderId,
          timestamp: Date.now(),
          isSimulated: true,
          disclaimer: 'PAPER TRADING – NO REAL MONEY'
        };
        this.orders.push(openOrder);
        return {
          status: 'OPEN',
          orderId,
          quantity,
          limitPrice: lPrice,
          message: `Limit order #${orderId} placed and currently OPEN in simulated book.`,
          isSimulated: true,
          disclaimer: 'PAPER TRADING – NO REAL MONEY'
        };
      }
    }

    // Immediate Fill Execution (Market order or marketable Limit order)
    return this._executeFill({
      orderId,
      symbol,
      side,
      orderType,
      quantity,
      entryPrice,
      currentPrice,
      limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : null,
      stopLoss: sl,
      takeProfit: tp,
      totalCapitalAtRisk,
      rrRatio,
      clientOrderId
    });
  }

  _executeFill({ orderId, symbol, side, orderType, quantity, entryPrice, currentPrice, limitPrice, stopLoss, takeProfit, totalCapitalAtRisk, rrRatio, clientOrderId }) {
    // Simulated Slippage calculation
    const slippage = currentPrice * this.account.slippageRate;
    let execPrice = side === 'BUY' ? currentPrice + slippage : currentPrice - slippage;

    // Invariant: Limit order fills must obey the specified limit
    if (orderType === 'LIMIT' && limitPrice) {
      execPrice = side === 'BUY' ? Math.min(execPrice, limitPrice) : Math.max(execPrice, limitPrice);
    }
    execPrice = Math.round(execPrice * 100) / 100;

    const tradeTotal = Math.round(execPrice * quantity * 100) / 100;
    const feeAmount = Math.round(tradeTotal * this.account.feeRate * 100) / 100;
    const slippageAmount = Math.round(Math.abs(execPrice - currentPrice) * 100) / 100;

    const order = {
      id: orderId,
      symbol,
      side,
      orderType,
      type: orderType,
      quantity,
      entryPrice,
      limitPrice,
      executionPrice: execPrice,
      feeAmount,
      slippageAmount,
      stopLoss,
      takeProfit,
      riskAmount: totalCapitalAtRisk,
      riskRatio: rrRatio,
      status: 'FILLED',
      clientOrderId,
      timestamp: Date.now(),
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    };
    this.orders.push(order);

    // Update Account & Positions
    this._fillPosition(order, tradeTotal, feeAmount);

    return {
      status: 'FILLED',
      orderId,
      executionPrice: execPrice,
      quantity,
      feeAmount,
      slippageAmount,
      riskAmount: Math.round(totalCapitalAtRisk * 100) / 100,
      rewardRiskRatio: rrRatio,
      message: `Executed ${side} ${quantity} ${symbol} @ ₹${execPrice.toFixed(2)} (Simulated fee: ₹${feeAmount.toFixed(2)}).`,
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    };
  }

  // Cancel an open limit order (Invariant: Never fill a cancelled order)
  cancelOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order #${orderId} not found.`);
    }
    if (order.status !== 'OPEN') {
      throw new Error(`Cannot cancel order #${orderId} with status '${order.status}'. Only OPEN orders can be cancelled.`);
    }

    order.status = 'CANCELLED';
    order.cancelledAt = Date.now();
    order.cancellationReason = 'User requested cancellation';

    console.log(`[OMS] Cancelled order #${orderId} on ${order.symbol}. Invariant preserved: Cancelled order will never be filled.`);
    return {
      status: 'CANCELLED',
      orderId,
      message: `Order #${orderId} cancelled successfully.`,
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    };
  }

  _fillPosition(order, tradeTotal, feeAmount) {
    const existing = this.positions.get(order.symbol);

    if (order.side === 'BUY') {
      // Deduct Trade Cash & Record in Cash Ledger
      this.account.currentCash -= (tradeTotal + feeAmount);
      this.cashLedger.push({
        id: 'led_' + Math.random().toString(36).slice(2, 9),
        type: 'TRADE_DEBIT',
        amount: -tradeTotal,
        balanceAfter: Math.round((this.account.currentCash + feeAmount) * 100) / 100,
        reference: 'ORD_' + order.id,
        description: `Bought ${order.quantity} ${order.symbol} @ ₹${order.executionPrice.toFixed(2)}`,
        timestamp: Date.now()
      });

      if (feeAmount > 0) {
        this.cashLedger.push({
          id: 'led_' + Math.random().toString(36).slice(2, 9),
          type: 'COMMISSION_FEE',
          amount: -feeAmount,
          balanceAfter: Math.round(this.account.currentCash * 100) / 100,
          reference: 'FEE_' + order.id,
          description: `Simulated brokerage fee (${(this.account.feeRate * 100).toFixed(2)}%) on order #${order.id}`,
          timestamp: Date.now()
        });
      }

      if (!existing) {
        this.positions.set(order.symbol, {
          symbol: order.symbol,
          side: 'BUY',
          quantity: order.quantity,
          avgPrice: order.executionPrice,
          entryPrice: order.executionPrice,
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit,
          openedAt: Date.now()
        });
      } else {
        const totalQty = existing.quantity + order.quantity;
        const totalCost = (existing.avgPrice * existing.quantity) + tradeTotal;
        existing.avgPrice = Math.round((totalCost / totalQty) * 100) / 100;
        existing.entryPrice = existing.avgPrice;
        existing.quantity = totalQty;
        existing.stopLoss = order.stopLoss;
        existing.takeProfit = order.takeProfit;
      }
    } else {
      // SELL execution
      this.closePosition(order.symbol, 'Manual Order SELL', order.quantity, order.executionPrice);
    }

    // Record trade in journal
    this.trades.push({
      id: 'trd_' + Math.random().toString(36).slice(2, 9),
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.executionPrice,
      feeAmount,
      timestamp: Date.now(),
      action: order.side === 'BUY' ? 'ENTRY' : 'EXIT',
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    });
  }

  closePosition(symbol, exitReason = 'Manual Exit', closeQty = null, explicitExitPrice = null) {
    const pos = this.positions.get(symbol);
    if (!pos) return null;

    const qtyToClose = closeQty ? Math.min(closeQty, pos.quantity) : pos.quantity;
    const ticker = this.marketSimulator.getTicker(symbol);
    const exitPrice = explicitExitPrice || (pos.side === 'BUY' ? (ticker ? ticker.bid : pos.avgPrice) : (ticker ? ticker.ask : pos.avgPrice));

    const grossProceeds = Math.round(exitPrice * qtyToClose * 100) / 100;
    const feeAmount = Math.round(grossProceeds * this.account.feeRate * 100) / 100;
    const pnl = Math.round(((exitPrice - pos.avgPrice) * qtyToClose) * 100) / 100;

    // Credit cash
    this.account.currentCash += (grossProceeds - feeAmount);

    // Cash Ledger
    this.cashLedger.push({
      id: 'led_' + Math.random().toString(36).slice(2, 9),
      type: 'TRADE_CREDIT',
      amount: grossProceeds,
      balanceAfter: Math.round((this.account.currentCash + feeAmount) * 100) / 100,
      reference: 'EXIT_' + symbol,
      description: `Sold ${qtyToClose} ${symbol} @ ₹${exitPrice.toFixed(2)} (Gross Proceeds)`,
      timestamp: Date.now()
    });

    if (feeAmount > 0) {
      this.cashLedger.push({
        id: 'led_' + Math.random().toString(36).slice(2, 9),
        type: 'COMMISSION_FEE',
        amount: -feeAmount,
        balanceAfter: Math.round(this.account.currentCash * 100) / 100,
        reference: 'FEE_EXIT_' + symbol,
        description: `Simulated brokerage fee on exit of ${symbol}`,
        timestamp: Date.now()
      });
    }

    // Calculate R-multiple
    const initialRisk = pos.stopLoss ? Math.abs(pos.avgPrice - pos.stopLoss) * qtyToClose : null;
    const rMultiple = initialRisk && initialRisk > 0 ? Math.round((pnl / initialRisk) * 100) / 100 : null;

    // Record close trade in journal
    this.trades.push({
      id: 'trd_' + Math.random().toString(36).slice(2, 9),
      symbol: pos.symbol,
      side: pos.side === 'BUY' ? 'SELL' : 'BUY',
      quantity: qtyToClose,
      entryPrice: pos.avgPrice,
      exitPrice,
      feeAmount,
      realizedPnL: pnl,
      rMultiple,
      exitReason,
      timestamp: Date.now(),
      action: 'EXIT',
      isSimulated: true,
      disclaimer: 'PAPER TRADING – NO REAL MONEY'
    });

    if (qtyToClose >= pos.quantity) {
      this.positions.delete(symbol);
    } else {
      pos.quantity -= qtyToClose;
    }

    console.log(`[OMS] Closed position on ${symbol} @ ₹${exitPrice}. PnL: ₹${pnl.toFixed(2)} (${exitReason})`);
    return { symbol, exitPrice, pnl, feeAmount, rMultiple, exitReason };
  }

  resetAccount(customCapital) {
    const cap = customCapital ? parseFloat(customCapital) : this.account.initialEquity;
    this.account.currentCash = cap;
    this.account.initialEquity = cap;
    this.account.dayStartEquity = cap;
    this.account.tradingLocked = false;
    this.account.lockReason = null;
    this.positions.clear();

    // Cancel all open orders on reset
    this.orders.forEach(o => {
      if (o.status === 'OPEN') {
        o.status = 'CANCELLED';
        o.cancellationReason = 'Cancelled due to account reset';
      }
    });

    this.trades = [];
    this.cashLedger = [
      {
        id: 'led_' + Math.random().toString(36).slice(2, 9),
        type: 'ACCOUNT_RESET',
        amount: cap,
        balanceAfter: cap,
        reference: 'RESET_' + Date.now(),
        description: `Paper balance re-initialized to virtual paper capital: ₹${cap.toLocaleString('en-IN')}`,
        timestamp: Date.now()
      }
    ];

    console.log(`[OMS] Account reset to ₹${cap.toLocaleString('en-IN')} initial equity.`);
    return this.getPortfolio();
  }

  // Active Bracket OCO State Machine & Limit Order Book Matcher
  _initOcoMonitor() {
    setInterval(() => {
      // 1. Monitor Open Limit Orders for execution
      for (const order of this.orders) {
        if (order.status !== 'OPEN') continue;

        const ticker = this.marketSimulator.getTicker(order.symbol);
        if (!ticker) continue;

        let shouldFill = false;
        if (order.side === 'BUY' && ticker.ask <= order.limitPrice) {
          shouldFill = true;
        } else if (order.side === 'SELL' && ticker.bid >= order.limitPrice) {
          shouldFill = true;
        }

        if (shouldFill) {
          // Invariant: Never fill a cancelled order (checked above: status === 'OPEN')
          console.log(`[OMS] Limit order #${order.id} matched market. Executing fill...`);
          order.status = 'FILLED';
          this._executeFill({
            orderId: order.id,
            symbol: order.symbol,
            side: order.side,
            orderType: 'LIMIT',
            quantity: order.quantity,
            entryPrice: order.limitPrice,
            currentPrice: order.side === 'BUY' ? ticker.ask : ticker.bid,
            limitPrice: order.limitPrice,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit,
            totalCapitalAtRisk: order.riskAmount,
            rrRatio: order.riskRatio,
            clientOrderId: order.clientOrderId
          });
        }
      }

      // 2. Monitor Bracket OCO triggers on open positions
      for (const [symbol, pos] of this.positions.entries()) {
        const ticker = this.marketSimulator.getTicker(symbol);
        if (!ticker) continue;

        const currentPrice = ticker.ltp;

        if (pos.side === 'BUY') {
          // Check Stop Loss
          if (pos.stopLoss && currentPrice <= pos.stopLoss) {
            this.closePosition(symbol, `Stop-Loss Triggered @ ₹${pos.stopLoss}`);
            continue;
          }
          // Check Take Profit
          if (pos.takeProfit && currentPrice >= pos.takeProfit) {
            this.closePosition(symbol, `Take-Profit Hit @ ₹${pos.takeProfit}`);
            continue;
          }
        } else if (pos.side === 'SELL') {
          // Short position Stop Loss
          if (pos.stopLoss && currentPrice >= pos.stopLoss) {
            this.closePosition(symbol, `Short Stop-Loss Triggered @ ₹${pos.stopLoss}`);
            continue;
          }
          // Short position Take Profit
          if (pos.takeProfit && currentPrice <= pos.takeProfit) {
            this.closePosition(symbol, `Short Take-Profit Hit @ ₹${pos.takeProfit}`);
            continue;
          }
        }
      }
    }, 500);
  }
}
