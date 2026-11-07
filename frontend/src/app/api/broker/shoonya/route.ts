import { NextResponse } from 'next/server';
import {
  SHOONYA_BASE_URL,
  SHOONYA_INSTRUMENTS,
  sha256,
  ShoonyaCredentials,
  ShoonyaSession
} from '@/lib/broker/shoonya-service';

// In-memory server session store (can be populated via env or explicit login)
let serverShoonyaSession: ShoonyaSession | null = null;

// Initialize from server environment if provided
async function initializeEnvSession(): Promise<ShoonyaSession | null> {
  const uid = process.env.SHOONYA_USER_ID;
  const password = process.env.SHOONYA_PASSWORD;
  const vendorCode = process.env.SHOONYA_VENDOR_CODE;
  const apiKey = process.env.SHOONYA_API_KEY;
  const totp = process.env.SHOONYA_TOTP_SECRET || process.env.SHOONYA_TOTP_CODE || '123456';

  if (!uid || !password || !vendorCode || !apiKey) {
    return null;
  }

  try {
    const pwdHash = await sha256(password);
    const appkeyHash = await sha256(apiKey.trim() + uid.trim().toUpperCase());

    const payload = {
      apkversion: 'js:1.0.0',
      uid: uid.trim().toUpperCase(),
      pwd: pwdHash,
      factor2: totp,
      vc: vendorCode.trim(),
      appkey: appkeyHash,
      imei: 'tradesphere_server_worker'
    };

    const res = await fetch(SHOONYA_BASE_URL + 'QuickAuth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `jData=${encodeURIComponent(JSON.stringify(payload))}`
    });

    const data = await res.json();
    if (data.stat === 'Ok' && data.susertoken) {
      serverShoonyaSession = {
        stat: 'Ok',
        token: data.susertoken,
        actid: data.actid || uid,
        uname: data.uname || 'Finvasia Live Trader',
        email: data.email,
        connectedAt: Date.now(),
        isLive: true
      };
      return serverShoonyaSession;
    }
  } catch (err) {
    console.warn('[ShoonyaAPI] Could not initialize session from environment:', err);
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  if (!serverShoonyaSession) {
    await initializeEnvSession();
  }

  if (action === 'status') {
    return NextResponse.json({
      connected: !!serverShoonyaSession?.token,
      isLive: !!serverShoonyaSession?.token,
      session: serverShoonyaSession ? {
        uname: serverShoonyaSession.uname,
        actid: serverShoonyaSession.actid,
        connectedAt: serverShoonyaSession.connectedAt
      } : null,
      supportedExchanges: ['NSE', 'BSE', 'NFO', 'MCX'],
      supportedInstruments: Object.keys(SHOONYA_INSTRUMENTS)
    });
  }

  if (!serverShoonyaSession?.token) {
    return NextResponse.json({
      error: 'SHOONYA_NOT_CONNECTED',
      message: 'Finvasia Shoonya broker session is not connected. Enter credentials in Settings.',
      connected: false
    }, { status: 401 });
  }

  const token = serverShoonyaSession.token;
  const uid = serverShoonyaSession.actid;

  try {
    if (action === 'orders') {
      const res = await fetch(SHOONYA_BASE_URL + 'OrderBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify({ uid }))}&jKey=${encodeURIComponent(token)}`
      });
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (action === 'positions') {
      const res = await fetch(SHOONYA_BASE_URL + 'PositionBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify({ uid, actid: uid }))}&jKey=${encodeURIComponent(token)}`
      });
      const data = await res.json();
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (action === 'limits') {
      const res = await fetch(SHOONYA_BASE_URL + 'Limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify({ uid, actid: uid }))}&jKey=${encodeURIComponent(token)}`
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'auth';

    if (action === 'auth' || action === 'login') {
      const creds: ShoonyaCredentials = body.credentials;
      if (!creds?.userId || !creds?.password || !creds?.apiKey || !creds?.vendorCode) {
        return NextResponse.json({
          error: 'MISSING_CREDENTIALS',
          message: 'userId, password, vendorCode, and apiKey are mandatory for Finvasia Shoonya connection.'
        }, { status: 400 });
      }

      const uid = creds.userId.trim().toUpperCase();
      const pwdHash = await sha256(creds.password);
      const appkeyHash = await sha256(creds.apiKey.trim() + uid);
      const factor2 = creds.totpCode || creds.totpSecret || '123456';

      const payload = {
        apkversion: 'js:1.0.0',
        uid,
        pwd: pwdHash,
        factor2,
        vc: creds.vendorCode.trim(),
        appkey: appkeyHash,
        imei: creds.imei || 'tradesphere_web_terminal'
      };

      const res = await fetch(SHOONYA_BASE_URL + 'QuickAuth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify(payload))}`
      });

      const data = await res.json();
      if (data.stat !== 'Ok') {
        return NextResponse.json({
          error: 'AUTH_FAILED',
          message: data.emsg || data.message || 'Shoonya QuickAuth failed. Please check credentials or TOTP.'
        }, { status: 401 });
      }

      serverShoonyaSession = {
        stat: 'Ok',
        token: data.susertoken,
        actid: data.actid || uid,
        uname: data.uname || 'Finvasia Trader',
        email: data.email,
        connectedAt: Date.now(),
        isLive: true
      };

      return NextResponse.json({
        success: true,
        message: `Connected to Finvasia Shoonya live trading account (${serverShoonyaSession.uname})`,
        session: {
          uname: serverShoonyaSession.uname,
          actid: serverShoonyaSession.actid,
          connectedAt: serverShoonyaSession.connectedAt
        }
      });
    }

    if (action === 'disconnect') {
      serverShoonyaSession = null;
      return NextResponse.json({ success: true, message: 'Disconnected from Shoonya.' });
    }

    if (action === 'order') {
      if (!serverShoonyaSession?.token) {
        return NextResponse.json({
          error: 'NOT_CONNECTED',
          message: 'Shoonya broker session is offline. Connect in Settings or execute via paper trading.'
        }, { status: 401 });
      }

      const { symbol, side, orderType, quantity, price, stopLoss, accountEquity } = body;
      const canonical = symbol?.toUpperCase() === 'NIFTY50' ? 'NIFTY 50' : symbol?.toUpperCase();
      const inst = SHOONYA_INSTRUMENTS[canonical];

      if (!inst) {
        return NextResponse.json({
          error: 'UNSUPPORTED_SYMBOL',
          message: `Symbol '${symbol}' is not available on Finvasia Shoonya.`
        }, { status: 400 });
      }

      const entryPrice = price && price > 0 ? Number(price) : inst.basePrice;
      const productType = body.productType || 'CNC';
      const prdCode = productType === 'MIS' ? 'I' : productType === 'NRML' ? 'M' : 'C';

      // Cash Margin Gatekeeper validation
      const estTotal = entryPrice * Number(quantity);
      const equity = Number(accountEquity) || 1000000;
      const marginReq = productType === 'MIS' ? estTotal / 5 : estTotal;

      if (side === 'BUY' && marginReq > equity) {
        return NextResponse.json({
          error: 'INSUFFICIENT_MARGIN',
          message: `Cash Margin Breach: Required margin (₹${marginReq.toFixed(2)}) exceeds available equity (₹${equity.toFixed(2)}).`
        }, { status: 400 });
      }

      const payload = {
        uid: serverShoonyaSession.actid,
        actid: serverShoonyaSession.actid,
        exch: inst.exchange,
        tsym: inst.tradingSymbol,
        qty: String(quantity),
        prc: orderType === 'LIMIT' && price ? String(price) : '0',
        prd: prdCode,
        trantype: side === 'BUY' ? 'B' : 'S',
        prctyp: orderType === 'LIMIT' ? 'LMT' : 'MKT',
        ret: 'DAY',
        remarks: 'TradeSphere_AI'
      };

      const res = await fetch(SHOONYA_BASE_URL + 'PlaceOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify(payload))}&jKey=${encodeURIComponent(serverShoonyaSession.token)}`
      });

      const data = await res.json();
      if (data.stat !== 'Ok') {
        return NextResponse.json({
          error: 'ORDER_REJECTED',
          message: data.emsg || data.message || 'Finvasia Shoonya rejected order.'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        orderId: data.norenordno,
        message: `Order filled via Finvasia Shoonya. Order ID: ${data.norenordno}`
      });
    }

    if (action === 'cancel') {
      if (!serverShoonyaSession?.token) {
        return NextResponse.json({ error: 'NOT_CONNECTED' }, { status: 401 });
      }
      const { norenordno } = body;
      const payload = {
        uid: serverShoonyaSession.actid,
        norenordno
      };
      const res = await fetch(SHOONYA_BASE_URL + 'CancelOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `jData=${encodeURIComponent(JSON.stringify(payload))}&jKey=${encodeURIComponent(serverShoonyaSession.token)}`
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
