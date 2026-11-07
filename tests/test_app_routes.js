// test_app_routes.js — Automated verification of all public and authenticated routes
const http = require('http');

const routes = [
  // Public pages
  '/',
  '/features',
  '/markets',
  '/learning',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  // Authenticated application interface
  '/app/dashboard',
  '/app/markets',
  '/app/watchlists',
  '/app/screener',
  '/app/charts',
  '/app/research',
  '/app/paper-trading',
  '/app/portfolio',
  '/app/risk',
  '/app/learning',
  '/app/settings'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          statusCode: res.statusCode,
          ok: res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 308,
          bodySnippet: data.substring(0, 150).replace(/\s+/g, ' ')
        });
      });
    }).on('error', (err) => {
      resolve({
        route,
        statusCode: 0,
        ok: false,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('Testing TradeSphere AI Routes on http://localhost:3000...\n');
  let passed = 0;
  let failed = 0;

  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.ok) {
      console.log(`✅ [${res.statusCode}] ${res.route}`);
      passed++;
    } else {
      console.log(`❌ [${res.statusCode || 'ERROR'}] ${res.route} - ${res.error || 'Failed'}`);
      failed++;
    }
  }

  console.log(`\n================================`);
  console.log(`Total Routes: ${routes.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`================================`);

  if (failed > 0) process.exit(1);
}

runTests();
