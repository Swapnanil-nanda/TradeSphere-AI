-- V7__enhance_paper_trading_features.sql
-- Idempotency keys, simulated fees, configurable slippage, and limit order tracking

ALTER TABLE paper_orders ADD COLUMN IF NOT EXISTS client_order_id VARCHAR(100);
ALTER TABLE paper_orders ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(19, 4) DEFAULT 0.0000;
ALTER TABLE paper_orders ADD COLUMN IF NOT EXISTS slippage_amount NUMERIC(19, 4) DEFAULT 0.0000;

ALTER TABLE paper_trades ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(19, 4) DEFAULT 0.0000;

ALTER TABLE paper_accounts ADD COLUMN IF NOT EXISTS slippage_rate NUMERIC(8, 6) DEFAULT 0.000500;
ALTER TABLE paper_accounts ADD COLUMN IF NOT EXISTS fee_rate NUMERIC(8, 6) DEFAULT 0.000300;

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON paper_orders(account_id, client_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON paper_orders(status);
