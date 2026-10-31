-- V8__create_trade_journals.sql
-- Persistent Trade Journal, setup tags, rule compliance, and AI discipline tracking

CREATE TABLE IF NOT EXISTS trade_journals (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
    trade_id BIGINT REFERENCES paper_trades(id) ON DELETE SET NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    setup_type VARCHAR(100) NOT NULL,
    entry_rules_followed BOOLEAN NOT NULL DEFAULT TRUE,
    exit_rules_followed BOOLEAN NOT NULL DEFAULT TRUE,
    emotional_state VARCHAR(50) NOT NULL DEFAULT 'DISCIPLINED',
    mistakes_tagged VARCHAR(255) DEFAULT 'NONE',
    notes TEXT,
    rating INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_journals_account ON trade_journals(account_id);
CREATE INDEX IF NOT EXISTS idx_trade_journals_symbol ON trade_journals(symbol);
