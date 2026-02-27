#!/bin/bash
set -e

# ==============================================================================
# OpenClaw Railway Template - Entrypoint Script
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

# Fix volume ownership (Railway mounts volumes as root)
# Only fix /data (the volume mount). /app and openclaw npm install are baked
# into the image with correct ownership — no need to chown them at runtime.
# Skip node_modules trees (thousands of files) to keep startup fast (<5s).
if [ "$(id -u)" = "0" ]; then
    find /data -not -path "*/node_modules/*" -exec chown openclaw:openclaw {} + 2>/dev/null || true
fi

# Ensure Playwright browser is accessible by openclaw user
if [ -d "/ms-playwright" ]; then
    chmod -R o+rx /ms-playwright 2>/dev/null || true
fi

# Ensure data directories exist with correct permissions
mkdir -p "$OPENCLAW_STATE_DIR" "$OPENCLAW_WORKSPACE_DIR" "$OPENCLAW_WORKSPACE_DIR/memory" "$OPENCLAW_STATE_DIR/workspace/memory"
chmod 700 "$OPENCLAW_STATE_DIR" "$OPENCLAW_WORKSPACE_DIR" 2>/dev/null || true

# Ensure npm global prefix directory exists for in-app upgrades
mkdir -p "${NPM_CONFIG_PREFIX:-/data/.npm-global}"

# Fix ownership of newly created directories
if [ "$(id -u)" = "0" ]; then
    find /data -maxdepth 2 -not -path "*/node_modules/*" -exec chown openclaw:openclaw {} + 2>/dev/null || true
fi

# Create symlinks from openclaw home into the persistent volume
# so $HOME/.openclaw resolves to /data/.openclaw and tool data persists
ln -sfn "$OPENCLAW_STATE_DIR" /home/openclaw/.openclaw
mkdir -p /data/.local /data/.npm
ln -sfn /data/.local /home/openclaw/.local
ln -sfn /data/.npm /home/openclaw/.npm
chown -h openclaw:openclaw /home/openclaw/.openclaw /home/openclaw/.local /home/openclaw/.npm
chown openclaw:openclaw /data/.local /data/.npm

# Sync pre-bundled skills into the skills directory
# Always overwrites bundled skill files to ensure Railway-aware instructions are current
# (e.g. replaces upstream SKILL.md that references localhost with our $SEARXNG_URL version)
SKILLS_DIR="$OPENCLAW_STATE_DIR/skills"
if [ -d "/bundled-skills" ]; then
    mkdir -p "$SKILLS_DIR"
    for skill_dir in /bundled-skills/*/; do
        skill_name=$(basename "$skill_dir")
        cp -r "$skill_dir" "$SKILLS_DIR/$skill_name"
        echo "Synced bundled skill: $skill_name"
    done
fi

# Auto-configure Plano LLM proxy if PLANO_URL is set
# When deployed alongside Plano, this adds a custom "plano" model provider
# that routes LLM requests through Plano's intelligent routing layer.
# Set PLANO_URL via Railway reference variable: http://${{Plano.RAILWAY_PRIVATE_DOMAIN}}:${{Plano.PORT}}/v1
if [ -n "$PLANO_URL" ]; then
    CONFIG_FILE="$OPENCLAW_STATE_DIR/openclaw.json"
    if [ -f "$CONFIG_FILE" ]; then
        echo "Plano integration detected: $PLANO_URL"
        # Inject plano provider into existing config using Python (available in base image)
        python3 -c "
import json, sys, os

config_path = '$CONFIG_FILE'
plano_url = os.environ.get('PLANO_URL', '')
plano_api_key = os.environ.get('PLANO_API_KEY', os.environ.get('OPENAI_API_KEY', 'none'))
plano_model = os.environ.get('PLANO_MODEL', 'gpt-4o')
plano_model_name = os.environ.get('PLANO_MODEL_NAME', 'GPT 4o')

with open(config_path) as f:
    cfg = json.load(f)

# Add plano provider under models.providers
if 'models' not in cfg:
    cfg['models'] = {}
if 'providers' not in cfg['models']:
    cfg['models']['providers'] = {}

cfg['models']['providers']['plano'] = {
    'baseUrl': plano_url,
    'apiKey': plano_api_key,
    'api': 'openai-completions',
    'models': [
        {'id': plano_model, 'name': plano_model_name, 'contextWindow': 128000, 'maxTokens': 16384}
    ]
}

# Set primary model to plano/<model> if not already set to a plano model
model_key = 'plano/' + plano_model
if 'agents' not in cfg:
    cfg['agents'] = {}
if 'defaults' not in cfg['agents']:
    cfg['agents']['defaults'] = {}
if 'model' not in cfg['agents']['defaults']:
    cfg['agents']['defaults']['model'] = {}

current_primary = cfg['agents']['defaults']['model'].get('primary', '')
if not current_primary.startswith('plano/'):
    cfg['agents']['defaults']['model']['primary'] = model_key
    cfg['agents']['defaults']['models'] = {model_key: {'alias': plano_model_name}}
    print(f'  Primary model set to: {model_key}')
else:
    print(f'  Primary model already set to: {current_primary}')

with open(config_path, 'w') as f:
    json.dump(cfg, f, indent=2)

print('  Plano provider configured successfully')
" 2>&1 || echo "Warning: Failed to auto-configure Plano provider"
    else
        echo "Plano URL set but config not found yet — provider will be configured after onboard"
    fi
fi

# Log startup info
echo ""
echo "OpenClaw Railway Template"
echo "========================"
echo "State directory: $OPENCLAW_STATE_DIR"
echo "Workspace directory: $OPENCLAW_WORKSPACE_DIR"
echo "Internal gateway port: $INTERNAL_GATEWAY_PORT"
echo "External port: $PORT"
if [ -d "/ms-playwright" ] && [ -n "$(ls /ms-playwright 2>/dev/null)" ]; then
    echo "Browser: Chromium (Playwright) available"
else
    echo "Browser: Not available"
fi
if [ -n "$PLANO_URL" ]; then
    echo "Plano LLM Proxy: $PLANO_URL"
fi
echo ""

# Start the wrapper server (drop to openclaw user if running as root)
if [ "$(id -u)" = "0" ]; then
    exec su -s /bin/bash openclaw -c "exec node /app/src/server.js"
else
    exec node /app/src/server.js
fi
