'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import Watchlist from '../../components/Watchlist';
import TradingChart from '../../components/TradingChart';
import OrderTicket from '../../components/OrderTicket';
import OrderBookDOM from '../../components/OrderBookDOM';
import OptionsChain from '../../components/OptionsChain';
import Backtester from '../../components/Backtester';
import PortfolioBlotter from '../../components/PortfolioBlotter';
import AICoachModal from '../../components/AICoachModal';

const API_BASE = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws/ticks';

export default function TerminalPage() {
  const [mode, setMode] = useState<'basic' | 'active' | 'pro'>('active');
  const [activeSymbol, setActiveSymbol] = useState('RELIANCE');
  const [timeframe, setTimeframe] = useState('5m');
  const [tickers, setTickers] = useState<any[]>([]);
  const [candles, setCandles] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [coachOpen, setCoachOpen] = useState(false);
  const [proTab, setProTab] = useState<'ticket' | 'options' | 'backtest'>('ticket');
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const flashTimers = useRef<Record<string, any>>({});

  // 1. Fetch initial tickers & portfolio
  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tickers`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.tickers || []);
      if (Array.isArray(list) && list.length > 0) {
        setTickers(list);
      }
    } catch (e) {
      console.warn('Backend connecting...', e);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio`);
      const data = await res.json();
      if (data && data.account) {
        setPortfolio(data);
      }
    } catch (e) {
      console.warn('Failed to load portfolio:', e);
    }
  }, []);

  const fetchCandles = useCallback(async (sym: string, tf: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/candles?symbol=${sym}&timeframe=${tf}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.candles || []);
      if (Array.isArray(list)) {
        setCandles(list);
      }
    } catch (e) {
      console.warn('Failed to load candles:', e);
    }
  }, []);

  // Fetch initial on mount
  useEffect(() => {
    fetchTickers();
    fetchPortfolio();
  }, [fetchTickers, fetchPortfolio]);

  // Fetch candles when symbol or timeframe changes
  useEffect(() => {
    if (activeSymbol) {
      fetchCandles(activeSymbol, timeframe);
    }
  }, [activeSymbol, timeframe, fetchCandles]);

  // 2. Setup WebSocket for real-time ticks & portfolio
  useEffect(() => {
    let reconnectTimeout: any;
    const connectWs = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'snapshot' && Array.isArray(msg.tickers)) {
              setTickers(msg.tickers);
            } else if ((msg.type === 'TICK' || msg.type === 'tick') && (msg.data || msg.symbol)) {
              const tick = msg.data || msg;

              // Flash indication
              setTickers((prev) => {
                const existing = prev.find((t) => t.symbol === tick.symbol);
                if (existing) {
                  const dir = tick.ltp > existing.ltp ? 'up' : tick.ltp < existing.ltp ? 'down' : null;
                  if (dir) {
                    setFlashes((f) => ({ ...f, [tick.symbol]: dir }));
                    if (flashTimers.current[tick.symbol]) clearTimeout(flashTimers.current[tick.symbol]);
                    flashTimers.current[tick.symbol] = setTimeout(() => {
                      setFlashes((f) => {
                        const copy = { ...f };
                        delete copy[tick.symbol];
                        return copy;
                      });
                    }, 400);
                  }
                  return prev.map((t) => (t.symbol === tick.symbol ? tick : t));
                } else {
                  return [...prev, tick];
                }
              });

              // Update candle high/low/close if symbol matches
              if (tick.symbol === activeSymbol) {
                setCandles((prevCandles) => {
                  if (!prevCandles || prevCandles.length === 0) return prevCandles;
                  const lastIdx = prevCandles.length - 1;
                  const lastCandle = { ...prevCandles[lastIdx] };
                  lastCandle.close = tick.ltp;
                  lastCandle.high = Math.max(lastCandle.high, tick.ltp);
                  lastCandle.low = Math.min(lastCandle.low, tick.ltp);
                  lastCandle.volume = (lastCandle.volume || 0) + tick.volume;
                  return [...prevCandles.slice(0, lastIdx), lastCandle];
                });
              }
            } else if (msg.type === 'PORTFOLIO_UPDATE' && msg.data) {
              setPortfolio(msg.data);
            } else if (msg.type === 'CIRCUIT_BREAKER') {
              alert(`🚨 CIRCUIT BREAKER TRIGGERED: ${msg.message}`);
              fetchPortfolio();
            }
          } catch (err) {
            console.error('Error handling WS message:', err);
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 2000);
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 2000);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, [activeSymbol]);

  // Periodic candle refresh to maintain precision & indicators
  useEffect(() => {
    const timer = setInterval(() => {
      fetchCandles(activeSymbol, timeframe);
      fetchPortfolio();
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSymbol, timeframe, fetchCandles, fetchPortfolio]);

  const activeTicker = tickers.find((t) => t.symbol === activeSymbol) || {
    symbol: activeSymbol,
    name: activeSymbol,
    ltp: 100,
    change: 0,
    changePct: 0,
    currency: activeSymbol.length <= 4 && !activeSymbol.includes('NIFTY') ? 'USD' : 'INR',
    bids: [],
    asks: []
  };

  // Close position handler
  const handleClosePosition = async (sym: string) => {
    try {
      await fetch(`${API_BASE}/api/positions/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym })
      });
      fetchPortfolio();
    } catch (e) {
      console.error('Failed to close position:', e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Top Terminal Header Bar */}
      <Header
        mode={mode}
        setMode={setMode}
        portfolio={portfolio}
        activeSymbol={activeSymbol}
        onOpenCoach={() => setCoachOpen(true)}
      />

      {/* Main Workspace based on 3-Tier Adaptive Complexity */}
      <div className="flex-1 flex overflow-hidden">
        {/* Watchlist (Shared across all tiers) */}
        <Watchlist
          tickers={tickers}
          activeSymbol={activeSymbol}
          onSelectSymbol={setActiveSymbol}
          flashes={flashes}
        />

        {/* Dynamic Center Stage */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Stage: Charts & Order Processing */}
          <div className="flex-1 flex min-h-0">
            {/* Chart Area */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#1b253b]">
              <TradingChart
                symbol={activeSymbol}
                ticker={activeTicker}
                candles={candles}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                mode={mode}
              />
            </div>

            {/* Mode-Specific Right Panels */}
            {mode === 'basic' && (
              <div className="w-80 flex flex-col">
                <OrderTicket
                  symbol={activeSymbol}
                  ticker={activeTicker}
                  portfolio={portfolio}
                  mode={mode}
                  onOrderPlaced={fetchPortfolio}
                />
              </div>
            )}

            {mode === 'active' && (
              <div className="w-80 flex flex-col">
                <OrderTicket
                  symbol={activeSymbol}
                  ticker={activeTicker}
                  portfolio={portfolio}
                  mode={mode}
                  onOrderPlaced={fetchPortfolio}
                />
              </div>
            )}

            {mode === 'pro' && (
              <div className="flex flex-row">
                {/* Level 2 DOM Ladder */}
                <div className="w-64 border-r border-[#1b253b]">
                  <OrderBookDOM
                    ticker={activeTicker}
                    onQuickFill={() => {}}
                  />
                </div>

                {/* Tabbed Pro Quant Tools */}
                <div className="w-96 flex flex-col bg-[#0c121f]">
                  {/* Pro Tab Navigator */}
                  <div className="h-9 px-2 border-b border-[#1b253b] flex items-center gap-1 bg-[#090d16]">
                    <button
                      onClick={() => setProTab('ticket')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        proTab === 'ticket' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Smart Order Ticket
                    </button>
                    <button
                      onClick={() => setProTab('options')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        proTab === 'options' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Options Greeks
                    </button>
                    <button
                      onClick={() => setProTab('backtest')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        proTab === 'backtest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Backtester
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {proTab === 'ticket' && (
                      <OrderTicket
                        symbol={activeSymbol}
                        ticker={activeTicker}
                        portfolio={portfolio}
                        mode={mode}
                        onOrderPlaced={fetchPortfolio}
                      />
                    )}
                    {proTab === 'options' && (
                      <OptionsChain
                        symbol={activeSymbol}
                        spotPrice={activeTicker?.ltp}
                      />
                    )}
                    {proTab === 'backtest' && (
                      <Backtester symbol={activeSymbol} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stage: Portfolio Blotter, Orders Audit & Trade Journal */}
          <PortfolioBlotter
            portfolio={portfolio}
            onClosePosition={handleClosePosition}
          />
        </div>
      </div>

      {/* Contextual AI Coach Modal */}
      {coachOpen && (
        <AICoachModal
          symbol={activeSymbol}
          onClose={() => setCoachOpen(false)}
        />
      )}
    </div>
  );
}
