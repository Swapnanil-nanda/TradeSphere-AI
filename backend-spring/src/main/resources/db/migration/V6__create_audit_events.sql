-- V6__create_audit_events.sql
-- Audit logs for security, authorization, risk breaches, and financial ledger transitions

CREATE TABLE IF NOT EXISTS audit_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    details_json TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_events(event_type);

-- Initial system bootstrap audit log
INSERT INTO audit_events (user_id, event_type, details_json, ip_address)
SELECT u.id, 'SYSTEM_INIT', '{"message": "TradeSphere AI Spring Boot Modular Monolith bootstrapped."}', '127.0.0.1'
FROM users u
WHERE u.email = 'demo.trader@tradesphere.ai'
AND NOT EXISTS (SELECT 1 FROM audit_events ae WHERE ae.event_type = 'SYSTEM_INIT');
