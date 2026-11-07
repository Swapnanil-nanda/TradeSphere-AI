import { NextResponse } from 'next/server';
import {
  SHOONYA_BASE_URL,
  SHOONYA_INSTRUMENTS,
  generateSyntheticCandles,
  enrichCandlesWithIndicators,
  NormalizedCandle
} from '@/lib/broker/shoonya-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = (searchParams.get('symbol') || 'RELIANCE').toUpperCase().trim();
  const canonical = rawSymbol === 'NIFTY50' ? 'NIFTY 50' : rawSymbol;
  const rawTf = searchParams.get('timeframe') || '5m';

  // Guaranteed 120-bar series generated around authoritative base prices
  // (e.g. MSFT ~$536, RELIANCE ~₹1312.70, NIFTY 50 ~24350)
  const candles: NormalizedCandle[] = generateSyntheticCandles(canonical, rawTf, 120);

  return NextResponse.json(candles);
}
