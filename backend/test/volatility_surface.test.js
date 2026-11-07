import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVolatilitySurface, calculateSviImpliedVol, STANDARD_EXPIRIES_DAYS } from '../src/quant/volatility_surface.js';

test('Volatility Surface Engine generates multi-expiry calibrated SVI surface', () => {
  const surface = generateVolatilitySurface('NIFTY50', 24350.0);

  assert.equal(surface.symbol, 'NIFTY50');
  assert.equal(surface.spotPrice, 24350.0);
  assert.deepEqual(surface.expiries, STANDARD_EXPIRIES_DAYS);
  assert.ok(surface.strikes.length >= 15);
  assert.ok(surface.surfaceGrid.length > 0);
  assert.ok(surface.termStructure.length === STANDARD_EXPIRIES_DAYS.length);
  assert.ok(surface.skewSlices.length === STANDARD_EXPIRIES_DAYS.length);

  // Check no-arbitrage flags
  assert.equal(surface.arbitrageChecks.butterflyArbitrageFree, true);
  assert.equal(typeof surface.arbitrageChecks.calendarArbitrageFree, 'boolean');

  // Verify SVI calculation
  const ivAtm = calculateSviImpliedVol(0.0, 30 / 365, 0.16);
  assert.ok(ivAtm > 0.05 && ivAtm < 1.0);

  // Verify Put Skew: OTM put (negative log-moneyness) IV should be higher than ATM
  const otmPutLogM = -0.05;
  const ivOtmPut = calculateSviImpliedVol(otmPutLogM, 30 / 365, 0.16);
  assert.ok(ivOtmPut >= ivAtm, `Expected OTM Put IV (${ivOtmPut}) >= ATM IV (${ivAtm})`);

  // Verify Second-order Greeks exist on grid points
  const sample = surface.surfaceGrid[0];
  assert.ok('vanna' in sample);
  assert.ok('volga' in sample);
  assert.ok('delta' in sample);
  assert.ok('gamma' in sample);
});
