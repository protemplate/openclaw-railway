# MoltBot Railway Template
# Multi-stage build with health checks and security hardening

# ==============================================================================
# Stage 1: Build the wrapper server
# ==============================================================================
FROM node:24-bookworm AS builder

WORKDIR /app

# Copy package files for wrapper server
COPY package.json ./
RUN npm install --omit=dev

# Copy wrapper server source
COPY src/ ./src/

# ==============================================================================
# Stage 2: Production runtime
# ==============================================================================
FROM node:24-bookworm-slim AS runtime

# Install runtime dependencies
# - tini: proper PID 1 handling for signal forwarding
# - curl: health checks
# - ca-certificates: HTTPS requests
RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install MoltBot globally
# Uses latest version - Railway auto-rebuilds when code changes
RUN npm install -g moltbot@latest

# Create non-root user for security
RUN groupadd --system --gid 1001 moltbot && \
    useradd --system --uid 1001 --gid moltbot --shell /bin/bash --create-home moltbot

WORKDIR /app

# Copy wrapper server from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create data directory with proper permissions
RUN mkdir -p /data/.moltbot /data/workspace && \
    chown -R moltbot:moltbot /data /app

# Volume for persistent data (Railway mounts here)
VOLUME /data

# Switch to non-root user
USER moltbot

# Default port (Railway overrides via PORT env var)
EXPOSE 8080

# Environment defaults
ENV NODE_ENV=production \
    MOLTBOT_STATE_DIR=/data/.moltbot \
    MOLTBOT_WORKSPACE_DIR=/data/workspace \
    INTERNAL_GATEWAY_PORT=18789

# Health check - checks wrapper server health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
