package com.tradesphere.modules.auth.dto;

import java.util.List;

public class AuthResponse {
    private boolean success = true;
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private String tier;
    private List<String> roles;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String email, String fullName, String tier, List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.tier = tier;
        this.roles = roles;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
