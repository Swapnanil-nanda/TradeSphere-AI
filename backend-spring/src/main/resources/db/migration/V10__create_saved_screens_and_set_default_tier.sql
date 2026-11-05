-- V10__create_saved_screens_and_set_default_tier.sql
-- Sets default user tier to BASIC and creates persistent saved screens table with tenant isolation

-- 1. Ensure default tier for new users is BASIC
ALTER TABLE users ALTER COLUMN tier SET DEFAULT 'BASIC';

-- 2. Create saved_screens table for authenticated user screener presets
CREATE TABLE IF NOT EXISTS saved_screens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(10),
    sector VARCHAR(100),
    trend VARCHAR(50),
    rsi_filter VARCHAR(50),
    min_pe NUMERIC(10, 2),
    max_pe NUMERIC(10, 2),
    min_price NUMERIC(19, 4),
    max_price NUMERIC(19, 4),
    min_market_cap_cr NUMERIC(19, 4),
    max_market_cap_cr NUMERIC(19, 4),
    min_volume BIGINT,
    search VARCHAR(100),
    sort_by VARCHAR(50) DEFAULT 'changePct',
    sort_direction VARCHAR(10) DEFAULT 'DESC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_screens_user_id ON saved_screens(user_id);
