package com.tradesphere.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Robust DataSource Configuration that transparently accepts:
 * 1. Standard Neon/Render URI: postgresql://user:pass@host/db?sslmode=require
 * 2. Standard Spring JDBC URL: jdbc:postgresql://host:5432/db?sslmode=require
 * 3. H2 in-memory URL for testing and local fallback
 */
@Configuration
public class ProductionDataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String rawUrl = env.getProperty("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = env.getProperty("DATABASE_URL");
        }

        boolean isProduction = env.acceptsProfiles(org.springframework.core.env.Profiles.of("prod"));

        // In production profile, H2 fallback is strictly disallowed
        if (isProduction && (rawUrl == null || rawUrl.isBlank() || rawUrl.startsWith("jdbc:h2:"))) {
            throw new IllegalStateException("CRITICAL DATABASE CONFIGURATION FAILURE: Production profile requires a valid PostgreSQL DATABASE_URL or SPRING_DATASOURCE_URL. H2 in-memory database fallback is strictly disabled in production.");
        }

        // H2 in-memory fallback for local dev & testing
        if (rawUrl == null || rawUrl.isBlank() || rawUrl.startsWith("jdbc:h2:")) {
            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl(rawUrl != null && !rawUrl.isBlank()
                    ? rawUrl
                    : "jdbc:h2:mem:tradesphere;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL");
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setUsername(env.getProperty("SPRING_DATASOURCE_USERNAME", "sa"));
            h2Config.setPassword(env.getProperty("SPRING_DATASOURCE_PASSWORD", ""));
            return new HikariDataSource(h2Config);
        }

        HikariConfig config = new HikariConfig();
        config.setPoolName("TradeSphereNeonHikariPool");

        String username = env.getProperty("SPRING_DATASOURCE_USERNAME");
        String password = env.getProperty("SPRING_DATASOURCE_PASSWORD");
        String jdbcUrl;

        // Normalize postgresql:// or postgres:// URI into standard JDBC
        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                String sanitized = rawUrl.replace("postgresql://", "http://").replace("postgres://", "http://");
                URI uri = new URI(sanitized);

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath() != null && !uri.getPath().isBlank() ? uri.getPath() : "/neondb";
                String query = uri.getQuery();

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    if (username == null || username.isBlank()) {
                        username = userParts[0];
                    }
                    if (userParts.length > 1 && (password == null || password.isBlank())) {
                        password = userParts[1];
                    }
                }

                if (query == null || query.isBlank()) {
                    query = "sslmode=require";
                } else if (!query.contains("sslmode=")) {
                    query = query + "&sslmode=require";
                }

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?" + query;
                System.out.println("[TradeSphere Production] Configured Neon PostgreSQL JDBC DataSource: jdbc:postgresql://" + host + ":" + port + path);
            } catch (Exception ex) {
                System.err.println("[TradeSphere Production] Warning: Fallback parsing database URI: " + ex.getMessage());
                jdbcUrl = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
            }
        } else {
            jdbcUrl = rawUrl;
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl(jdbcUrl);

        if (username != null && !username.isBlank()) {
            config.setUsername(username);
        }
        if (password != null && !password.isBlank()) {
            config.setPassword(password);
        }

        // Hikari pool tuning for Neon Serverless
        int maxPoolSize = 10;
        try {
            String poolSizeStr = env.getProperty("HIKARI_MAX_POOL_SIZE");
            if (poolSizeStr != null) maxPoolSize = Integer.parseInt(poolSizeStr);
        } catch (Exception ignored) {}

        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTimeout(20000);
        config.setLeakDetectionThreshold(60000);

        return new HikariDataSource(config);
    }
}
