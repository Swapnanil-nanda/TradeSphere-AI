# ==============================================================================
# TradeSphere AI Backend - Production Dockerfile
# Optimized for Render Cloud Deployments with Java 21 & Neon PostgreSQL
# Multi-stage build with non-root security & G1GC container memory limits
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /workspace

# Cache maven dependencies layer
COPY pom.xml .
RUN mvn dependency:resolve -B

# Build application artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production JRE Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for healthcheck probe
RUN apk add --no-cache curl tzdata

# Set UTC timezone as financial invariant
ENV TZ=UTC

# Create unprivileged system user and group (OWASP Container Hardening)
RUN addgroup -g 10001 -S tradesphere && \
    adduser -u 10001 -S tradesphere -G tradesphere

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder --chown=tradesphere:tradesphere /workspace/target/tradesphere-backend-*.jar app.jar

# Container configuration
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

# Expose HTTP port
EXPOSE 8080

# Switch to non-root user
USER tradesphere:tradesphere

# Docker & Render Health Check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Execute Spring Boot application
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
