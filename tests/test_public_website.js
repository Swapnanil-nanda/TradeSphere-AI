/**
 * TradeSphere AI - Next.js Production Website & Navigation Verification Suite
 */

const http = require('http');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

function get(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
  });
}

function post(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(data);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  TESTING TRADESPHERE AI NEXT.JS & TYPESCRIPT APP ROUTER PAGES  ');
  console.log('================================================================');

  // 1. Test All 11 Requested Public Routes + Sitemap + Robots
  const routesToTest = [
    { path: '/', name: '1. Homepage' },
    { path: '/features', name: '2. Features Page' },
    { path: '/markets', name: '3. Markets Page' },
    { path: '/learning', name: '4. Learning Page' },
    { path: '/about', name: '5. About Page' },
    { path: '/contact', name: '6. Contact Page' },
    { path: '/disclaimer', name: '7. Disclaimer Page' },
    { path: '/privacy', name: '8. Privacy Policy Page' },
    { path: '/terms', name: '9. Terms of Service Page' },
    { path: '/login', name: '10. Login Page' },
    { path: '/register', name: '11. Registration Page' },
    { path: '/sitemap.xml', name: 'Sitemap XML' },
    { path: '/robots.txt', name: 'Robots TXT' }
  ];

  console.log('\n--- VERIFYING HTTP 200 STATUS ON ALL ROUTES ---');
  for (const route of routesToTest) {
    const res = await get(`${FRONTEND_URL}${route.path}`);
    if (res.status !== 200) {
      throw new Error(`Route ${route.path} failed with HTTP status ${res.status}`);
    }
    console.log(`   ✓ ${route.name} (${route.path}) -> HTTP 200 OK (${res.body.length} bytes)`);
  }

  // 2. Verify Homepage Key Elements
  console.log('\n--- VERIFYING HOMEPAGE SECTIONS ---');
  const homeRes = await get(`${FRONTEND_URL}/`);
  const body = homeRes.body;

  const checks = [
    { title: 'Premium Navigation Bar', match: 'TradeSphere' },
    { title: 'Hero Section', match: 'Master Market Structure' },
    { title: 'Platform Features', match: 'Pre-Trade Risk Gatekeeper' },
    { title: 'Product Preview (1% Auto-Sizer)', match: 'Product Preview: 1% Auto-Sizer' },
    { title: 'Beginner / Professional User Modes', match: 'Beginner: Guided Mode' },
    { title: 'Paper-Trading Introduction', match: 'Why Paper-Trading on TradeSphere AI Is Different' },
    { title: 'Learning Section', match: 'TradeSphere Academy' },
    { title: 'FAQ Section', match: 'Frequently Asked Questions' },
    { title: 'Demo-Data Disclaimer Banner', match: 'SIMULATED (DEMO) DATA' }
  ];

  for (const check of checks) {
    if (!body.includes(check.match)) {
      throw new Error(`Homepage missing section or match: "${check.title}" (expected text: "${check.match}")`);
    }
    console.log(`   ✓ [FOUND] ${check.title}`);
  }

  // 3. Test Connected Backend Authentication API
  console.log('\n--- TESTING BACKEND AUTHENTICATION API CONNECTION ---');
  
  // Test Registration
  const testEmail = `trader_${Date.now()}@tradesphere.ai`;
  console.log(`Registering test user: ${testEmail}...`);
  const regRes = await post(`${BACKEND_URL}/api/auth/register`, {
    name: 'Ananya Roy',
    email: testEmail,
    password: 'SecurePassword2026!',
    tier: 'active'
  });

  if (regRes.status !== 201 || !regRes.data.success) {
    throw new Error(`Backend registration failed: ${JSON.stringify(regRes)}`);
  }
  console.log(`   ✓ Registration API Connected: User created with ID "${regRes.data.user.id}" and ₹${regRes.data.user.paperCapital} paper balance.`);

  // Test Login with newly registered user
  console.log(`Authenticating test user: ${testEmail}...`);
  const loginRes = await post(`${BACKEND_URL}/api/auth/login`, {
    email: testEmail,
    password: 'SecurePassword2026!'
  });

  if (loginRes.status !== 200 || !loginRes.data.success || !loginRes.data.token) {
    throw new Error(`Backend login failed: ${JSON.stringify(loginRes)}`);
  }
  console.log(`   ✓ Login API Connected: Token issued "${loginRes.data.token.slice(0, 16)}..."`);

  // 4. Verify Sitemap Content
  console.log('\n--- VERIFYING SITEMAP CONTENT ---');
  const sitemapRes = await get(`${FRONTEND_URL}/sitemap.xml`);
  if (!sitemapRes.body.includes('<urlset') || !sitemapRes.body.includes('tradesphere.ai/features')) {
    throw new Error('Sitemap does not contain expected XML tags or routes');
  }
  console.log('   ✓ Sitemap XML contains valid URL set with canonical links.');

  // 5. Verify Robots.txt Content
  console.log('\n--- VERIFYING ROBOTS.TXT CONTENT ---');
  const robotsRes = await get(`${FRONTEND_URL}/robots.txt`);
  if (!robotsRes.body.includes('User-Agent: *') || !robotsRes.body.includes('sitemap.xml')) {
    throw new Error('Robots.txt does not contain standard User-Agent or Sitemap directive');
  }
  console.log('   ✓ Robots.txt contains valid crawler directives.');

  console.log('\n================================================================');
  console.log('  ALL NEXT.JS & TYPESCRIPT ACCEPTANCE CRITERIA VERIFIED 100%!   ');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('VERIFICATION SUITE FAILED:', err);
  process.exit(1);
});
