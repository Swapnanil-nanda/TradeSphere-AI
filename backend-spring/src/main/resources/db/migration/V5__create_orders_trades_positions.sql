-- V5__create_orders_trades_positions.sql
-- Paper orders, bracket OCO legs, fills, trades blotter, and open positions

CREATE TABLE IF NOT EXISTS paper_orders (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id),
    order_type VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    quantity INT NOT NULL,
    limit_price NUMERIC(19, 4),
    stop_loss_price NUMERIC(19, 4),
    take_profit_price NUMERIC(19, 4),
    executed_price NUMERIC(19, 4),
    rejection_reason VARCHAR(255),
    parent_order_id BIGINT REFERENCES paper_orders(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paper_trades (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES paper_orders(id),
    instrument_id BIGINT NOT NULL REFERENCES instruments(id),
    side VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(19, 4) NOT NULL,
    realized_pnl NUMERIC(19, 4),
    r_multiple NUMERIC(10, 2),
    exit_reason VARCHAR(100),
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id),
    side VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    entry_price NUMERIC(19, 4) NOT NULL,
    current_price NUMERIC(19, 4) NOT NULL,
    unrealized_pnl NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    unrealized_pnl_pct NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    stop_loss_price NUMERIC(19, 4),
    take_profit_price NUMERIC(19, 4),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_account_instrument UNIQUE (account_id, instrument_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_account ON paper_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_account ON paper_trades(account_id);
CREATE INDEX IF NOT EXISTS idx_positions_account ON positions(account_id);
