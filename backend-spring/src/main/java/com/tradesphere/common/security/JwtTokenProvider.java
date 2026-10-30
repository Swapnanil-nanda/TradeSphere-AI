package com.tradesphere.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private static final String INSECURE_DEFAULT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs,
            org.springframework.core.env.Environment env) {
        boolean isProduction = env.acceptsProfiles(org.springframework.core.env.Profiles.of("prod"));

        if (isProduction) {
            if (secret == null || secret.isBlank() || INSECURE_DEFAULT_SECRET.equals(secret.trim())) {
                throw new IllegalStateException("CRITICAL SECURITY CONFIGURATION FAILURE: JWT_SECRET environment variable is missing or matches the insecure default key in production profile.");
            }
        }

        String effectiveSecret = secret;
        if (effectiveSecret == null || effectiveSecret.isBlank()) {
            log.warn("JWT_SECRET is unset in non-production profile. Using development fallback key.");
            effectiveSecret = INSECURE_DEFAULT_SECRET;
        }

        this.key = Keys.hmacShaKeyFor(effectiveSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId())
                .claim("fullName", userPrincipal.getFullName())
                .claim("tier", userPrincipal.getTier())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Number id = claims.get("userId", Number.class);
        return id != null ? id.longValue() : null;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }
}
