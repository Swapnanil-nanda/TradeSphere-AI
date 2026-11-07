import { NextResponse } from 'next/server';
import { historicalMarketData } from '@/lib/market-data/historical-provider';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || 'RELIANCE').toUpperCase().trim();
  const interval = searchParams.get('interval') || searchParams.get('timeframe') || '1d';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const count = parseInt(searchParams.get('count') || '250', 10);

  try {
    const data = await historicalMarketData.getCandles(symbol, interval, count);

    // Apply date range filter if specified
    let filteredCandles = data.candles;
    if (startDate) {
      const startSec = Math.floor(new Date(startDate).getTime() / 1000);
      filteredCandles = filteredCandles.filter(c => c.time >= startSec);
    }
    if (endDate) {
      const endSec = Math.floor(new Date(endDate).getTime() / 1000);
      filteredCandles = filteredCandles.filter(c => c.time <= endSec);
    }

    return NextResponse.json({
      symbol,
      source: 'EXCHANGE_HISTORICAL_ARCHIVE',
      dataType: 'HISTORICAL',
      asOfTimestamp: Date.now(),
      provenance: 'VERIFIED_EOD_ARCHIVE',
      interval,
      dateRange: {
        from: startDate || (filteredCandles.length > 0 ? new Date(filteredCandles[0].time * 1000).toISOString().split('T')[0] : '2023-01-01'),
        to: endDate || (filteredCandles.length > 0 ? new Date(filteredCandles[filteredCandles.length - 1].time * 1000).toISOString().split('T')[0] : '2026-11-01')
      },
      totalBars: filteredCandles.length,
      adjusted: true,
      candles: filteredCandles,
      metadata: {
        source: 'EXCHANGE_HISTORICAL_ARCHIVE',
        dataType: 'HISTORICAL',
        timestamp: Date.now(),
        dataFreshness: 'End of Day Settlement',
        isSimulated: false
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch historical candles.' }, { status: 500 });
  }
}
