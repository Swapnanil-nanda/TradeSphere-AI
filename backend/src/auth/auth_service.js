// TradeSphere AI - Server-Side Authentication & Session Service
import crypto from 'crypto';

class AuthService {
  constructor() {
    this.users = new Map(); // email -> user record
    this.sessions = new Map(); // token -> session data

    // Seed default demo trader
    this._seedDemoUser();
  }

  _hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  _seedDemoUser() {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this._hashPassword('TradeSafe2026!', salt);
    const demoUser = {
      id: 'usr_demo_01',
      name: 'Demo Trader',
      email: 'demo.trader@tradesphere.ai',
      salt,
      hash,
      tier: 'pro',
      paperCapital: 1000000.00,
      createdAt: new Date().toISOString()
    };
    this.users.set(demoUser.email.toLowerCase(), demoUser);
  }

  register({ name, email, password, tier = 'active' }) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long.');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('A valid email address is required.');
    }

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email address is already registered.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this._hashPassword(password, salt);
    const userId = 'usr_' + crypto.randomBytes(6).toString('hex');

    const newUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      salt,
      hash,
      tier: ['basic', 'active', 'pro'].includes(tier) ? tier : 'active',
      paperCapital: 1000000.00,
      createdAt: new Date().toISOString()
    };

    this.users.set(normalizedEmail, newUser);

    // Issue auth token
    const token = this._createSession(newUser);

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        tier: newUser.tier,
        paperCapital: newUser.paperCapital
      }
    };
  }

  login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const hash = this._hashPassword(password, user.salt);
    if (hash !== user.hash) {
      throw new Error('Invalid email or password.');
    }

    const token = this._createSession(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        paperCapital: user.paperCapital
      }
    };
  }

  _createSession(user) {
    const token = 'ts_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    this.sessions.set(token, {
      userId: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      expiresAt
    });
    return token;
  }

  verifySession(token) {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session || Date.now() > session.expiresAt) {
      if (session) this.sessions.delete(token);
      return null;
    }
    return session;
  }
}

export const authService = new AuthService();
