package com.tradesphere.common.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes Render & Neon PostgreSQL URI strings (e.g. postgresql://user:pass@ep-host.neon.tech/neondb?sslmode=require)
 * into standard Spring Boot JDBC properties (spring.datasource.url, username, password).
 */
public class NeonDatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = environment.getProperty("SPRING_DATASOURCE_URL");
        }

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                URI uri = new URI(dbUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery() != null ? uri.getQuery() : "sslmode=require";
                if (!query.contains("sslmode=")) {
                    query = query.isEmpty() ? "sslmode=require" : query + "&sslmode=require";
                }

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s?%s", host, port, path, query);
                Map<String, Object> props = new HashMap<>();
                props.put("spring.datasource.url", jdbcUrl);
                props.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    props.put("spring.datasource.username", userInfo[0]);
                    if (userInfo.length > 1) {
                        props.put("spring.datasource.password", userInfo[1]);
                    }
                }

                environment.getPropertySources().addFirst(new MapPropertySource("neonDatabaseUrlProps", props));
                System.out.println("[TradeSphere Production] Normalized Neon DATABASE_URL into JDBC format: jdbc:postgresql://" + host + ":" + port + path);
            } catch (Exception e) {
                System.err.println("[TradeSphere Production] Warning: Unable to parse DATABASE_URL URI: " + e.getMessage());
            }
        }
    }
}
