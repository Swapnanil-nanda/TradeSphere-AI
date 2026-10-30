package com.tradesphere.common.exception;

public class RiskGatekeeperException extends TradeSphereException {
    private final String riskRuleCode;

    public RiskGatekeeperException(String riskRuleCode, String message) {
        super(String.format("[Pre-Trade Risk Gatekeeper] %s: %s", riskRuleCode, message));
        this.riskRuleCode = riskRuleCode;
    }

    public String getRiskRuleCode() {
        return riskRuleCode;
    }
}
