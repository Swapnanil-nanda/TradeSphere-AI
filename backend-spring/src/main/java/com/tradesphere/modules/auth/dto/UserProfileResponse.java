package com.tradesphere.modules.auth.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String tier;
    private BigDecimal riskCapPct;
    private BigDecimal dailyDrawdownLimitPct;
    private List<String> roles;
    private Instant createdAt;

    public UserProfileResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public BigDecimal getRiskCapPct() { return riskCapPct; }
    public void setRiskCapPct(BigDecimal riskCapPct) { this.riskCapPct = riskCapPct; }
    public BigDecimal getDailyDrawdownLimitPct() { return dailyDrawdownLimitPct; }
    public void setDailyDrawdownLimitPct(BigDecimal dailyDrawdownLimitPct) { this.dailyDrawdownLimitPct = dailyDrawdownLimitPct; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
