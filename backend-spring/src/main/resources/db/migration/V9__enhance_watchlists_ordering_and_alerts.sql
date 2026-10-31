-- V9__enhance_watchlists_ordering_and_alerts.sql
-- Add display_order and notes to watchlist_items, create watchlist_alerts table

-- 1. Alter watchlist_items to support drag-and-drop / explicit sorting & notes
ALTER TABLE watchlist_items ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
ALTER TABLE watchlist_items ADD COLUMN IF NOT EXISTS notes VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_watchlist_items_order ON watchlist_items(watchlist_id, display_order);

-- 2. Create user watchlist alerts table for price, volume, and technical indicator alerts
CREATE TABLE IF NOT EXISTS watchlist_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(30) NOT NULL,
    alert_type VARCHAR(40) NOT NULL, -- PRICE_ABOVE, PRICE_BELOW, VOLUME_SPIKE, RSI_OVERBOUGHT, RSI_OVERSOLD
    target_value NUMERIC(18, 4) NOT NULL,
    notes VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_user ON watchlist_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_symbol ON watchlist_alerts(symbol, is_active);
