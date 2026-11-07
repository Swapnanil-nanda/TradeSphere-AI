import { NextResponse } from 'next/server';
import { paperEngine } from '@/lib/paper-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1M';

  // Get equity history from engine
  const history = paperEngine.getEquityHistory(period);

  return NextResponse.json(history);
}
