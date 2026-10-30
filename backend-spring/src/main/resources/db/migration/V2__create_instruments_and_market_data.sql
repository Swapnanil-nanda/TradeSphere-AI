-- V2__create_instruments_and_market_data.sql
-- Master instrument catalogue for Indian (NSE/BSE) and US (NASDAQ/NYSE) markets

CREATE TABLE IF NOT EXISTS instruments (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    exchange VARCHAR(50) NOT NULL,
    market VARCHAR(10) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    sector VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tick_size NUMERIC(10, 4) NOT NULL DEFAULT 0.05,
    lot_size INT NOT NULL DEFAULT 1,
    base_price NUMERIC(19, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instruments_market ON instruments(market);
CREATE INDEX IF NOT EXISTS idx_instruments_sector ON instruments(sector);

-- Seed initial instruments (ANSI SQL compatible with PostgreSQL 18 & H2)
INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'RELIANCE', 'Reliance Industries Limited', 'NSE', 'IN', 'INR', 'Energy & Retail', 'Oil & Gas Refining', 2985.4000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'RELIANCE');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'TCS', 'Tata Consultancy Services Ltd', 'NSE', 'IN', 'INR', 'IT Services', 'Software Consulting', 4125.0000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'TCS');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'INFY', 'Infosys Limited', 'NSE', 'IN', 'INR', 'IT Services', 'Cloud & Digital Services', 1892.5000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'INFY');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'HDFCBANK', 'HDFC Bank Limited', 'NSE', 'IN', 'INR', 'Banking & Financials', 'Private Sector Bank', 1748.2000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'HDFCBANK');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'ICICIBANK', 'ICICI Bank Limited', 'NSE', 'IN', 'INR', 'Banking & Financials', 'Private Sector Bank', 1230.5000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'ICICIBANK');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'SBIN', 'State Bank of India', 'NSE', 'IN', 'INR', 'Banking & Financials', 'Public Sector Bank', 825.4000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'SBIN');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'TATAMOTORS', 'Tata Motors Limited', 'NSE', 'IN', 'INR', 'Automobile', 'Commercial & Passenger EV', 985.0000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'TATAMOTORS');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'AAPL', 'Apple Inc.', 'NASDAQ', 'US', 'USD', 'Technology', 'Consumer Electronics', 232.5000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'AAPL');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'MSFT', 'Microsoft Corporation', 'NASDAQ', 'US', 'USD', 'Technology', 'Enterprise Cloud & AI', 438.1000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'MSFT');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'NVDA', 'NVIDIA Corporation', 'NASDAQ', 'US', 'USD', 'Semiconductor', 'GPU Computing & AI Acceleration', 141.2000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'NVDA');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'TSLA', 'Tesla Inc.', 'NASDAQ', 'US', 'USD', 'Automobile', 'Electric Vehicles & Clean Energy', 258.4000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'TSLA');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'SPY', 'SPDR S&P 500 ETF Trust', 'NYSE', 'US', 'USD', 'Index ETF', 'Large Cap Broad Market', 582.4000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'SPY');

INSERT INTO instruments (symbol, name, exchange, market, currency, sector, industry, base_price)
SELECT 'QQQ', 'Invesco QQQ Trust', 'NASDAQ', 'US', 'USD', 'Index ETF', 'Nasdaq 100 Tech Heavy', 494.1000
WHERE NOT EXISTS (SELECT 1 FROM instruments WHERE symbol = 'QQQ');
