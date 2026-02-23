# OpenClaw Railway Template
# Multi-stage build from source with health checks and security hardening

# ==============================================================================
# Stage 1: Build OpenClaw from source
# ==============================================================================
FROM node:24-bookworm AS openclaw-builder

# Fix apt sources: use HTTPS to avoid 403 from CDN on Docker Desktop
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Clone OpenClaw source
ARG OPENCLAW_GIT_REF=v2026.2.19
RUN git clone --depth 1 --branch "${OPENCLAW_GIT_REF}" https://github.com/openclaw/openclaw.git /openclaw

WORKDIR /openclaw

# Install dependencies and build
RUN pnpm install --no-frozen-lockfile && pnpm build && pnpm ui:build

# ==============================================================================
# Stage 2: Build the wrapper server (with node-pty native module)
# ==============================================================================
FROM node:24-bookworm AS wrapper-builder

# Fix apt sources: use HTTPS to avoid 403 from CDN on Docker Desktop
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources

# Install build dependencies for node-pty
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for wrapper server
COPY package.json ./
RUN npm install --omit=dev

# Copy wrapper server source
COPY src/ ./src/

# ==============================================================================
# Stage 3: Production runtime
# ==============================================================================
FROM node:24-bookworm-slim AS runtime

# Copy CA certificates from builder (slim image doesn't have them)
COPY --from=wrapper-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Fix apt sources: use HTTPS to avoid 403 from CDN on Docker Desktop
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources

# Install runtime dependencies
# - tini: proper PID 1 handling for signal forwarding
# - curl: health checks
# - ca-certificates: HTTPS requests
# - git, python3, make, g++: required for npm install -g (in-app upgrades)
# - openjdk-17-jre-headless: required by signal-cli for Signal channel
RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    curl \
    ca-certificates \
    git \
    python3 \
    make \
    g++ \
    openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Install signal-cli for Signal channel support
ARG SIGNAL_CLI_VERSION=0.13.24
RUN curl -L -o /tmp/signal-cli.tar.gz \
    "https://github.com/AsamK/signal-cli/releases/download/v${SIGNAL_CLI_VERSION}/signal-cli-${SIGNAL_CLI_VERSION}.tar.gz" \
    && tar xf /tmp/signal-cli.tar.gz -C /opt \
    && ln -sf /opt/signal-cli-${SIGNAL_CLI_VERSION}/bin/signal-cli /usr/local/bin/signal-cli \
    && rm /tmp/signal-cli.tar.gz

# Create non-root user for security
RUN groupadd --system --gid 1001 openclaw && \
    useradd --system --uid 1001 --gid openclaw --shell /bin/bash --create-home openclaw

# Copy OpenClaw from builder
COPY --from=openclaw-builder /openclaw/dist /openclaw/dist
COPY --from=openclaw-builder /openclaw/node_modules /openclaw/node_modules
COPY --from=openclaw-builder /openclaw/package.json /openclaw/package.json
COPY --from=openclaw-builder /openclaw/extensions /openclaw/extensions
COPY --from=openclaw-builder /openclaw/packages /openclaw/packages
COPY --from=openclaw-builder /openclaw/docs /openclaw/docs

# Create openclaw CLI wrapper script
# Injects OPENCLAW_GATEWAY_TOKEN from the token file so the CLI can authenticate
# with the gateway in any shell context (docker exec, Railway shell, etc.)
RUN printf '#!/bin/bash\n\
if [ -z "$OPENCLAW_GATEWAY_TOKEN" ] && [ -f "${OPENCLAW_STATE_DIR:-/data/.openclaw}/gateway.token" ]; then\n\
  export OPENCLAW_GATEWAY_TOKEN=$(cat "${OPENCLAW_STATE_DIR:-/data/.openclaw}/gateway.token")\n\
fi\n\
exec node /openclaw/dist/entry.js "$@"\n' > /usr/local/bin/openclaw && \
    chmod +x /usr/local/bin/openclaw

# Install Playwright Chromium matching the playwright-core version
# that OpenClaw depends on (avoids browser-revision mismatch).
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN PW_VER=$(node -e "try{console.log(require('/openclaw/node_modules/playwright-core/package.json').version)}catch(e){console.log('latest')}" 2>/dev/null) && \
    echo "Installing playwright@${PW_VER} chromium..." && \
    npx -y playwright@${PW_VER} install --with-deps chromium && \
    chmod -R o+rx /ms-playwright

WORKDIR /app

# Copy wrapper server from builder
COPY --from=wrapper-builder /app/node_modules ./node_modules
COPY --from=wrapper-builder /app/src ./src
COPY --from=wrapper-builder /app/package.json ./package.json

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy pre-bundled skills (Railway-optimized)
COPY skills/ /bundled-skills/

# Create data directory with proper permissions
RUN mkdir -p /data/.openclaw /data/workspace && \
    chmod 700 /data/.openclaw /data/workspace && \
    chown -R openclaw:openclaw /data /app /openclaw

# Note: No VOLUME directive — Railway manages volumes externally
# Note: Running as root because Railway volumes mount as root.
# The entrypoint handles dropping privileges after fixing permissions.

# Default port (Railway overrides via PORT env var)
EXPOSE 8080

# Environment defaults
# NPM_CONFIG_PREFIX on the persistent volume so in-app upgrades survive restarts.
# PATH puts the npm-global bin before /usr/local/bin so upgraded openclaw takes precedence.
ENV NODE_ENV=production \
    HOME=/home/openclaw \
    OPENCLAW_STATE_DIR=/data/.openclaw \
    OPENCLAW_WORKSPACE_DIR=/data/workspace \
    INTERNAL_GATEWAY_PORT=18789 \
    NPM_CONFIG_PREFIX=/data/.npm-global \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PATH=/data/.npm-global/bin:$PATH

# Health check - checks wrapper server health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
