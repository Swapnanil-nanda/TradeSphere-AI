/**
 * ApexTradeOS / TradeSphere AI - Unified Root Launcher
 * Starts both Backend (Port 8000) and Frontend (Port 3000) concurrently.
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('================================================================');
console.log('  Ω  ApexTradeOS / TradeSphere AI - Institutional Terminal');
console.log('================================================================');
console.log('  * Mode: 100% Free / Local-First ($0 budget)');
console.log('  * Exchanges: NSE (India) & NASDAQ (US) Dual-Market');
console.log('  * Market Data: 24/7 GBM Tick Simulator + 20-Depth DOM Ladder');
console.log('  * Pre-Trade Gatekeeper: 1% Max Risk & 3% Circuit Breaker Active');
console.log('----------------------------------------------------------------');

// 1. Start Backend Server
const backend = spawn('node', ['src/server.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

// 2. Wait 800ms and start Frontend Next.js Server
setTimeout(() => {
  const frontend = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('close', (code) => {
    console.log(`[Frontend] Exited with code ${code}`);
    process.exit(code);
  });
}, 800);

backend.on('close', (code) => {
  console.log(`[Backend] Exited with code ${code}`);
  process.exit(code);
});

// Graceful cleanup
process.on('SIGINT', () => {
  console.log('\nStopping ApexTradeOS services...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  process.exit(0);
});
