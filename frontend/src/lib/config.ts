/**
 * TradeSphere AI - Centralized Typed Environment & API Configuration
 * Invariant: Never hardcode localhost into deployed browser code.
 *
 * Production:
 * - REST uses the configured HTTPS backend (NEXT_PUBLIC_API_URL).
 * - WebSocket uses the configured WSS market-feed endpoint (NEXT_PUBLIC_MARKET_WS_URL).
 *
 * Development:
 * - REST uses http://localhost:8080 (or relative Next.js rewrite /api/*).
 * - WebSocket uses ws://localhost:8000/ws/ticks.
 */

export interface AppConfig {
  apiUrl: string;
  marketWsUrl: string;
  marketApiUrl: string;
  isProduction: boolean;
}

function resolveApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    // In browser, relative URL ('') allows Next.js rewrites to proxy /api/* seamlessly
    return '';
  }

  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080';
}

function resolveMarketApiUrl(): string {
  if (process.env.NEXT_PUBLIC_MARKET_API_URL && process.env.NEXT_PUBLIC_MARKET_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_MARKET_API_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_MARKET_WS_URL && process.env.NEXT_PUBLIC_MARKET_WS_URL.trim() !== '') {
    const wsUrl = process.env.NEXT_PUBLIC_MARKET_WS_URL.trim();
    return wsUrl.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://').replace(/\/ws\/.*$/i, '');
  }
  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
}

function resolveMarketWsUrl(): string {
  if (process.env.NEXT_PUBLIC_MARKET_WS_URL && process.env.NEXT_PUBLIC_MARKET_WS_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_MARKET_WS_URL;
  }

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    if (process.env.NODE_ENV === 'production') {
      const wsProto = isHttps ? 'wss:' : 'ws:';
      return `${wsProto}//${window.location.host}/ws/ticks`;
    }
    return 'ws://localhost:8000/ws/ticks';
  }

  return 'ws://localhost:8000/ws/ticks';
}

export const appConfig: AppConfig = {
  apiUrl: resolveApiUrl(),
  marketWsUrl: resolveMarketWsUrl(),
  marketApiUrl: resolveMarketApiUrl(),
  isProduction: process.env.NODE_ENV === 'production'
};
