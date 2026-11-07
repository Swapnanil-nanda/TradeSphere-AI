/**
 * ApexTradeOS / TradeSphere AI - Unified Multi-Process Stack Launcher
 * Orchestrates:
 *  1. Authoritative OMS & Auth Backend (Spring Boot - Port 8080)
 *  2. Real-time Market Simulator & 20-Level DOM Feed (Node.js - Port 8000)
 *  3. React / Next.js Trading Terminal (Port 3000)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;
const backendSpringDir = path.join(rootDir, 'backend-spring');
const backendNodeDir = path.join(rootDir, 'backend');
const quantEngineDir = path.join(rootDir, 'quant-engine');
const frontendDir = path.join(rootDir, 'frontend');

console.log('================================================================');
console.log('  Ω  TradeSphere AI / ApexTradeOS - Institutional Stack Launcher');
console.log('================================================================');
console.log('  * Authoritative OMS & Auth: Spring Boot (Port 8080)');
console.log('  * Market Data & DOM Feed: Node.js GBM Engine (Port 8000)');
console.log('  * Quantitative Research Engine: Python FastAPI (Port 8100)');
console.log('  * UI Terminal: Next.js 15 (Port 3000)');
console.log('  * Pre-Trade Gatekeeper: Dynamic Risk & 3% Circuit Breaker Active');
console.log('----------------------------------------------------------------');

const processes = [];

// Helper to spawn and track processes
function launchProcess(name, cmd, args, cwd) {
  console.log(`[Launcher] Starting ${name} in ${cwd}...`);
  const child = spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  child.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
  });

  child.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      cleanupAndExit(code);
    }
  });

  processes.push({ name, child });
  return child;
}

// 1. Start Spring Boot Authoritative Backend (Port 8080)
const jarPath = path.join(backendSpringDir, 'target', 'tradesphere-backend-1.0.0.jar');
if (fs.existsSync(jarPath)) {
  launchProcess('Authoritative-OMS-8080', 'java', ['-jar', 'target/tradesphere-backend-1.0.0.jar'], backendSpringDir);
} else {
  const isWin = process.platform === 'win32';
  const mvnCmd = isWin ? 'mvn.cmd' : 'mvn';
  launchProcess('Authoritative-OMS-8080', mvnCmd, ['spring-boot:run'], backendSpringDir);
}

// 2. Start Node.js Market Feed & Microstructure Engine (Port 8000)
launchProcess('MarketFeed-Simulator-8000', 'node', ['src/server.js'], backendNodeDir);

// 3. Start Python Quantitative Research Engine (Port 8100)
if (fs.existsSync(quantEngineDir)) {
  launchProcess('Quant-Engine-8100', 'python', ['main.py'], quantEngineDir);
}

// 4. Start Next.js Frontend Terminal (Port 3000)
setTimeout(() => {
  launchProcess('Frontend-Terminal-3000', 'npx', ['next', 'start', '-p', '3000'], frontendDir);
}, 2000);

// Graceful cleanup
function cleanupAndExit(code = 0) {
  console.log('\n[Launcher] Shutting down all TradeSphere AI services...');
  processes.forEach(({ name, child }) => {
    try {
      if (child && !child.killed) {
        console.log(`[Launcher] Terminating ${name}...`);
        child.kill('SIGINT');
      }
    } catch (e) {}
  });
  process.exit(code);
}

process.on('SIGINT', () => cleanupAndExit(0));
process.on('SIGTERM', () => cleanupAndExit(0));
