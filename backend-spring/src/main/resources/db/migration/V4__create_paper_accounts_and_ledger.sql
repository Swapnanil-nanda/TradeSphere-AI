-- V4__create_paper_accounts_and_ledger.sql
-- Paper trading account balance, circuit breaker flags, and double-entry cash ledger

CREATE TABLE IF NOT EXISTS paper_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    starting_capital NUMERIC(19, 4) NOT NULL DEFAULT 1000000.0000,
    current_cash NUMERIC(19, 4) NOT NULL DEFAULT 1000000.0000,
    net_liquidation NUMERIC(19, 4) NOT NULL DEFAULT 1000000.0000,
    day_start_equity NUMERIC(19, 4) NOT NULL DEFAULT 1000000.0000,
    daily_realized_pnl NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    daily_unrealized_pnl NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    trading_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lock_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cash_ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
    entry_type VARCHAR(50) NOT NULL,
    amount NUMERIC(19, 4) NOT NULL,
    balance_after NUMERIC(19, 4) NOT NULL,
    reference_id VARCHAR(100),
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_account ON cash_ledger_entries(account_id);

-- Seed default paper account for demo user (ANSI SQL compatible)
INSERT INTO paper_accounts (user_id, currency, starting_capital, current_cash, net_liquidation, day_start_equity)
SELECT u.id, 'INR', 1000000.0000, 1000000.0000, 1000000.0000, 1000000.0000
FROM users u
WHERE u.email = 'demo.trader@tradesphere.ai'
AND NOT EXISTS (SELECT 1 FROM paper_accounts pa JOIN users usr ON pa.user_id = usr.id WHERE usr.email = 'demo.trader@tradesphere.ai');

-- Initial deposit ledger entry
INSERT INTO cash_ledger_entries (account_id, entry_type, amount, balance_after, reference_id, description)
SELECT pa.id, 'INITIAL_DEPOSIT', 1000000.0000, 1000000.0000, 'SYS_INIT_001', 'Initial virtual paper capital seed'
FROM paper_accounts pa
JOIN users u ON pa.user_id = u.id
WHERE u.email = 'demo.trader@tradesphere.ai'
AND NOT EXISTS (SELECT 1 FROM cash_ledger_entries cle WHERE cle.account_id = pa.id AND cle.entry_type = 'INITIAL_DEPOSIT');
