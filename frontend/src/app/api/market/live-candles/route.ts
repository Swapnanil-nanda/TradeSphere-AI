import { NextResponse } from 'next/server';

const SYMBOL_MAP: Record<string, string> = {
  'NIFTY50': '^NSEI',
  'NIFTY 50': '^NSEI',
  'SENSEX': '^BSESN',
  'BANKNIFTY': '^NSEBANK',
  'RELIANCE': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'INFY': 'INFY.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'ITC': 'ITC.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'WIPRO': 'WIPRO.NS',
  'LICI': 'LICI.NS',
  'SPY': 'SPY',
  'QQQ': 'QQQ',
  'AAPL': 'AAPL',
  'MSFT': 'MSFT',
  'NVDA': 'NVDA',
  'TSLA': 'TSLA',
  'GOOGL': 'GOOGL',
  'AMZN': 'AMZN'
};

// Map timeframe to Yahoo interval and range
function mapTimeframe(tf: string): { interval: string; range: string } {
  switch (tf) {
    case '1m': return { interval: '1m', range: '1d' };
    case '5m': return { interval: '5m', range: '1d' };
    case '15m': return { interval: '15m', range: '5d' };
    case '1h': return { interval: '60m', range: '1mo' };
    case '1d': return { interval: '1d', range: '3mo' };
    case '1w': return { interval: '1wk', range: '1y' };
    default: return { interval: '5m', range: '1d' };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = (searchParams.get('symbol') || 'RELIANCE').toUpperCase().trim();
  const rawTf = searchParams.get('timeframe') || '5m';

  const yahooSymbol = SYMBOL_MAP[rawSymbol] || (rawSymbol.endsWith('.NS') ? rawSymbol : `${rawSymbol}.NS`);
  const { interval, range } = mapTimeframe(rawTf);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal,
      next: { revalidate: 10 }
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      throw new Error('Invalid chart response');
    }

    const timestamps: number[] = result.timestamp;
    const quotes = result.indicators.quote[0];

    const candles: any[] = [];
    let lastValidClose = result.meta?.chartPreviousClose ?? 1000;

    for (let i = 0; i < timestamps.length; i++) {
      const open = quotes.open?.[i];
      const high = quotes.high?.[i];
      const low = quotes.low?.[i];
      const close = quotes.close?.[i];
      const volume = quotes.volume?.[i] ?? 0;

      // Filter null/undefined candle gaps
      if (open != null && high != null && low != null && close != null) {
        lastValidClose = close;
        candles.push({
          time: timestamps[i],
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.floor(volume),
          isDelayed: true,
          isLive: false,
          isSimulated: false
        });
      }
    }

    if (candles.length > 0) {
      return NextResponse.json(candles);
    }
  } catch (err: any) {
    console.warn('[LiveCandlesAPI] Yahoo chart fetch failed, falling back:', err.message);
  }

  // Fallback synthetic candles if external feed is unreachable
  const now = Math.floor(Date.now() / 1000);
  const BASE_PRICES: Record<string, number> = {
    'MSFT': 536.00,
    'AAPL': 234.50,
    'NVDA': 142.60,
    'TSLA': 219.80,
    'GOOGL': 181.40,
    'AMZN': 188.70,
    'SPY': 598.00,
    'QQQ': 518.00,
    'NIFTY 50': 24350.00,
    'NIFTY50': 24350.00,
    'SENSEX': 79500.00,
    'BANKNIFTY': 52200.00,
    'RELIANCE': 1312.70,
    'TCS': 4125.00,
    'INFY': 1892.50,
    'HDFCBANK': 1748.20,
    'ICICIBANK': 1230.50,
    'SBIN': 825.40,
    'TATAMOTORS': 985.00,
    'BHARTIARTL': 1640.80,
    'ITC': 478.20,
    'WIPRO': 545.00,
    'LICI': 980.00
  };
  const base = BASE_PRICES[rawSymbol] || 1000;
  const fallbackCandles = [];
  let price = base;

  for (let i = 50; i >= 0; i--) {
    const time = now - i * 300;
    const delta = (Math.random() - 0.49) * (base * 0.003);
    const open = Math.round((price + delta) * 100) / 100;
    const high = Math.round((open + Math.random() * (base * 0.002)) * 100) / 100;
    const low = Math.round((open - Math.random() * (base * 0.002)) * 100) / 100;
    const close = Math.round(((open + high + low) / 3) * 100) / 100;
    const volume = Math.floor(Math.random() * 20000) + 5000;
    price = close;
    fallbackCandles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
      isLive: false,
      isSimulated: true
    });
  }

  return NextResponse.json(fallbackCandles);
}
