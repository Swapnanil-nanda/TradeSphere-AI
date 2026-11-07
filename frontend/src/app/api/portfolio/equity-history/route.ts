import { NextResponse } from 'next/server';
import { paperEngine } from '@/lib/paper-engine';
import { appConfig } from '@/lib/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1M';
  const authHeader = request.headers.get('authorization');

  // If user is authenticated and backend is reachable, proxy to authoritative Spring Boot service
  if (authHeader && appConfig.apiUrl) {
    try {
      const res = await fetch(`${appConfig.apiUrl}/api/portfolio/equity-history?period=${encodeURIComponent(period)}`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      // Fallback to guest paper engine
    }
  }

  // Get equity history from engine
  const history = paperEngine.getEquityHistory(period);
  return NextResponse.json(history);
}
