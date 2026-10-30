-- V3__create_watchlists.sql
-- User watchlists and instrument collections

CREATE TABLE IF NOT EXISTS watchlists (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_watchlist_name UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS watchlist_items (
    id BIGSERIAL PRIMARY KEY,
    watchlist_id BIGINT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    instrument_id BIGINT NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist_instrument UNIQUE (watchlist_id, instrument_id)
);

-- Seed default watchlist for demo trader (ANSI SQL compatible)
INSERT INTO watchlists (user_id, name, is_default)
SELECT u.id, 'Core Market Watch', TRUE
FROM users u
WHERE u.email = 'demo.trader@tradesphere.ai'
AND NOT EXISTS (SELECT 1 FROM watchlists w JOIN users usr ON w.user_id = usr.id WHERE usr.email = 'demo.trader@tradesphere.ai' AND w.name = 'Core Market Watch');

INSERT INTO watchlist_items (watchlist_id, instrument_id)
SELECT w.id, i.id FROM watchlists w
JOIN users u ON w.user_id = u.id
JOIN instruments i ON i.symbol IN ('RELIANCE', 'TCS', 'HDFCBANK', 'AAPL', 'NVDA')
WHERE u.email = 'demo.trader@tradesphere.ai' AND w.name = 'Core Market Watch'
AND NOT EXISTS (SELECT 1 FROM watchlist_items wi WHERE wi.watchlist_id = w.id AND wi.instrument_id = i.id);
