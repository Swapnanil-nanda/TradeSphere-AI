/**
 * TradeSphere AI — Market Data Provenance & Integrity System
 *
 * Establishes strict data labeling across all charts, tickers, and terminals:
 * - SIMULATED: Generated 24/7 by the Geometric Brownian Motion (GBM) microstructure engine.
 * - HISTORICAL: Sourced from verified end-of-day/intraday historical datasets.
 * - DELAYED: External delayed feed (typically 15-minute exchange delay).
 * - LIVE: Strictly reserved for verified, licensed direct broker/exchange connections.
 *
 * NEVER use 'LIVE' as a synonym for frequently refreshing simulated feeds.
 */

export type DataProvenance = 'SIMULATED' | 'HISTORICAL' | 'DELAYED' | 'LIVE';

export interface ProvenanceMetadata {
  provenance: DataProvenance;
  source: string;
  badgeLabel: string;
  badgeColor: string; // Tailwind class
  description: string;
  lastUpdated: number;
}

export function getProvenanceMetadata(
  provenance: DataProvenance = 'SIMULATED',
  customTimestamp?: number
): ProvenanceMetadata {
  const ts = customTimestamp || Date.now();

  switch (provenance) {
    case 'LIVE':
      return {
        provenance: 'LIVE',
        source: 'Direct Exchange Feed (Licensed API)',
        badgeLabel: 'LIVE EXCHANGE',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        description: 'Authentic real-time exchange quotes directly from licensed market feed.',
        lastUpdated: ts
      };

    case 'DELAYED':
      return {
        provenance: 'DELAYED',
        source: 'Delayed Exchange Feed (15-min delay)',
        badgeLabel: '15M DELAYED',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        description: 'External exchange quotes delayed by 15 minutes per standard regulatory rules.',
        lastUpdated: ts
      };

    case 'HISTORICAL':
      return {
        provenance: 'HISTORICAL',
        source: 'Verified EOD Historical Dataset',
        badgeLabel: 'HISTORICAL',
        badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        description: 'Static or walk-forward historical price records for backtesting and analogues.',
        lastUpdated: ts
      };

    case 'SIMULATED':
    default:
      return {
        provenance: 'SIMULATED',
        source: '24/7 Geometric Brownian Motion (GBM) Simulator',
        badgeLabel: 'SIMULATED (GBM)',
        badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        description: 'Simulated 24/7 microstructure feed with volatility clustering and ATR drift.',
        lastUpdated: ts
      };
  }
}
