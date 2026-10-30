package com.tradesphere.auth;

import com.tradesphere.common.config.ProductionDataSourceConfig;
import com.tradesphere.common.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProductionSecurityValidationTest {

    @Test
    @DisplayName("Security: Startup fails in production when JWT_SECRET is missing or default")
    void testProductionJwtSecretMissingThrowsException() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            new JwtTokenProvider("", 86400000L, env);
        });

        assertTrue(ex.getMessage().contains("JWT_SECRET environment variable is missing"));

        // Default secret test
        assertThrows(IllegalStateException.class, () -> {
            new JwtTokenProvider("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970", 86400000L, env);
        });
    }

    @Test
    @DisplayName("Security: Startup fails in production when H2 database is used")
    void testProductionH2DatabaseFallbackThrowsException() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("DATABASE_URL", "jdbc:h2:mem:tradesphere");

        ProductionDataSourceConfig config = new ProductionDataSourceConfig();
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            config.dataSource(env);
        });

        assertTrue(ex.getMessage().contains("H2 in-memory database fallback is strictly disabled in production"));
    }
}
