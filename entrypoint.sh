#!/bin/bash
set -e

# ==============================================================================
# MoltBot Railway Template - Entrypoint Script
# Handles Railway PORT binding and graceful startup
# ==============================================================================

# Railway provides PORT environment variable
if [ -n "$PORT" ]; then
    echo "Railway environment detected"
    echo "Binding wrapper server to port $PORT"

    # Show available access points if private networking is available
    if [ -n "$RAILWAY_PRIVATE_DOMAIN" ]; then
        echo ""
        echo "Service accessible at:"
        echo "  - Public: via your Railway public domain"
        echo "  - Private: http://$RAILWAY_PRIVATE_DOMAIN:$PORT"
        echo ""
        echo "IMPORTANT: Always include :$PORT when connecting via private networking!"
        echo ""
    fi
else
    # Fallback for local development
    export PORT=8080
    echo "Local development mode"
    echo "Using default port $PORT"
fi

# Ensure data directories exist with correct permissions
mkdir -p "$MOLTBOT_STATE_DIR" "$MOLTBOT_WORKSPACE_DIR"

# Log startup info
echo ""
echo "MoltBot Railway Template"
echo "========================"
echo "State directory: $MOLTBOT_STATE_DIR"
echo "Workspace directory: $MOLTBOT_WORKSPACE_DIR"
echo "Internal gateway port: $INTERNAL_GATEWAY_PORT"
echo "External port: $PORT"
echo ""

# Start the wrapper server
exec node /app/src/server.js
