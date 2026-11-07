#!/usr/bin/env node
/**
 * TradeSphere AI — Multi-Service Deployment Health Checker
 * Probes Spring Boot (8080), Node Microstructure Engine (8000), Python Quant Engine (8100),
 * and Next.js Web Frontend (3000) for operational readiness.
 */

const http = require('http');
const https = require('https');
const { parse } = require('url');

const SERVICES = [
  {
    name: 'Spring Boot Authoritative OMS',
    url: process.env.SPRING_BOOT_URL ? `${process.env.SPRING_BOOT_URL}/actuator/health` : 'http://localhost:8080/actuator/health',
    required: true,
    timeoutMs: 5000
  },
  {
    name: 'Node Microstructure Engine',
    url: process.env.NODE_BACKEND_URL ? `${process.env.NODE_BACKEND_URL}/api/health` : 'http://localhost:8000/api/health',
    required: true,
    timeoutMs: 3000
  },
  {
    name: 'Python Quant Research Engine',
    url: process.env.QUANT_ENGINE_URL ? `${process.env.QUANT_ENGINE_URL}/api/health` : 'http://localhost:8100/api/health',
    required: true,
    timeoutMs: 3000
  },
  {
    name: 'Next.js Trading Terminal',
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    required: false,
    timeoutMs: 3000
  }
];

function checkService(service) {
  return new Promise((resolve) => {
    const parsed = new URL(service.url);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(service.url, { timeout: service.timeoutMs }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({
            name: service.name,
            url: service.url,
            status: 'UP',
            code: res.statusCode,
            required: service.required
          });
        } else {
          resolve({
            name: service.name,
            url: service.url,
            status: 'DEGRADED',
            code: res.statusCode,
            required: service.required,
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        url: service.url,
        status: 'DOWN',
        required: service.required,
        error: `Timed out after ${service.timeoutMs}ms`
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        url: service.url,
        status: 'DOWN',
        required: service.required,
        error: err.message
      });
    });
  });
}

async function main() {
  console.log('===============================================================');
  console.log('🩺 TradeSphere AI — Full-Stack Deployment Health Diagnostics');
  console.log('===============================================================\n');

  const results = await Promise.all(SERVICES.map(checkService));
  let hasCriticalFailure = false;

  for (const r of results) {
    const icon = r.status === 'UP' ? '✅' : (r.required ? '❌' : '⚠️');
    console.log(`${icon} [${r.status.padEnd(8)}] ${r.name}`);
    console.log(`    Endpoint: ${r.url}`);
    if (r.error) {
      console.log(`    Detail:   ${r.error}`);
    }
    if (r.status !== 'UP' && r.required) {
      hasCriticalFailure = true;
    }
  }

  console.log('\n===============================================================');
  if (hasCriticalFailure) {
    console.error('❌ Critical deployment health check failed: essential services offline.');
    // Exit with code 0 in local dev check mode unless STRICT_HEALTHCHECK is set
    if (process.env.STRICT_HEALTHCHECK === 'true') {
      process.exit(1);
    } else {
      console.log('ℹ️  Run with STRICT_HEALTHCHECK=true in CI to fail on offline services.');
      process.exit(0);
    }
  } else {
    console.log('✅ All monitored services healthy and operational.');
    process.exit(0);
  }
}

main();
