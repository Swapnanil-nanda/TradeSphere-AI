-- V1__create_users_and_roles.sql
-- User entities, progressive complexity tiers, and security credentials

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    risk_cap_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    daily_drawdown_limit_pct NUMERIC(5, 2) NOT NULL DEFAULT 3.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed initial roles (Standard ANSI SQL compatible with PostgreSQL 18 & H2)
INSERT INTO roles (name)
SELECT 'ROLE_USER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_USER');

INSERT INTO roles (name)
SELECT 'ROLE_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

INSERT INTO roles (name)
SELECT 'ROLE_QUANT' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_QUANT');

-- Seed default demo trader: demo.trader@tradesphere.ai / TradeSafe2026!
INSERT INTO users (email, password_hash, full_name, tier, risk_cap_pct, daily_drawdown_limit_pct, is_active)
SELECT 'demo.trader@tradesphere.ai', '$2a$10$4qADO1Z4TNomIvp9W3om5elc0ARuMMWKixmJix3iXroq8zByswNX2', 'Professional Demo Trader', 'PRO', 1.00, 3.00, TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo.trader@tradesphere.ai');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'demo.trader@tradesphere.ai'
AND r.name = 'ROLE_USER'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
