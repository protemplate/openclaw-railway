/**
 * Setup page HTML generator for OpenClaw
 *
 * Generates the setup wizard page with dual-mode UI:
 * - Simple Mode (default): Form-based wizard with dropdowns and inputs
 * - Advanced Mode: xterm.js terminal for interactive onboarding
 */

/**
 * Generate the setup page HTML
 * @param {Object} options - Page options
 * @param {boolean} options.isConfigured - Whether OpenClaw is configured
 * @param {Object} options.gatewayInfo - Gateway process info
 * @param {string} options.password - Auth password for WebSocket
 * @param {string} options.stateDir - State directory path
 * @param {string} options.gatewayToken - Gateway auth token
 * @param {Array} options.authGroups - Auth provider groups for form
 * @returns {string} HTML content
 */
export function getSetupPageHTML({ isConfigured, gatewayInfo, password, stateDir, gatewayToken, authGroups }) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw Setup</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/css/xterm.min.css"/>
  <style>
    :root {
      --bg: #12141a;
      --bg-accent: #14161d;
      --bg-elevated: #1a1d25;
      --bg-hover: #262a35;
      --card: #181b22;
      --card-foreground: #f4f4f5;
      --accent: #ff5c5c;
      --accent-hover: #ff7070;
      --accent-dark: #991b1b;
      --accent-subtle: rgba(255, 92, 92, 0.15);
      --accent-glow: rgba(255, 92, 92, 0.25);
      --teal: #14b8a6;
      --teal-bright: #00e5cc;
      --teal-glow: rgba(20, 184, 166, 0.4);
      --ok: #22c55e;
      --danger: #ef4444;
      --warn: #f59e0b;
      --text: #e4e4e7;
      --text-strong: #fafafa;
      --muted: #71717a;
      --muted-strong: #52525b;
      --border: #27272a;
      --border-strong: #3f3f46;
      --font-body: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.03);
      --duration-fast: 120ms;
      --duration-normal: 200ms;
    }
    ::selection {
      background: var(--accent-subtle);
      color: var(--text-strong);
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-body);
      margin: 0;
      padding: 20px;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      letter-spacing: -0.02em;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    h1 {
      font-family: var(--font-display);
      color: var(--text);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    h1 .logo { width: 28px; height: 28px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 20px;
    }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--card);
      padding: 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      border-color: var(--border-strong);
      box-shadow: 0 0 20px rgba(255, 92, 92, 0.06);
    }
    .card h2 {
      margin: 0 0 15px 0;
      font-family: var(--font-display);
      font-size: 16px;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .status-grid {
      display: grid;
      gap: 10px;
    }
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: var(--bg-elevated);
      border-radius: 5px;
      border: 1px solid var(--border);
    }
    .status-label { color: var(--muted); }
    .status-value {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-value.running { background: var(--teal-bright); color: var(--bg); }
    .status-value.stopped { background: var(--accent); color: #fff; }
    .status-value.configured { background: var(--teal); color: #fff; }
    .status-value.not-configured { background: var(--accent); color: #fff; }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      background: var(--bg-elevated);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .mode-toggle button {
      padding: 8px 20px;
      border: none;
      background: transparent;
      color: var(--muted-strong);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 0;
    }
    .mode-toggle button.active {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #fff;
    }
    .mode-toggle button:not(.active):hover {
      color: var(--text);
      background: var(--bg-hover);
    }

    /* Form elements */
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .form-select, .form-input {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: 14px;
      font-family: var(--font-body);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-select:focus, .form-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }
    .form-select option {
      background: var(--bg-elevated);
      color: var(--text);
    }
    .form-hint {
      color: var(--muted-strong);
      font-size: 12px;
      margin-top: 4px;
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #fff;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .step-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    /* Log output */
    .log-output {
      background: var(--bg);
      color: var(--teal-bright);
      font-family: var(--mono);
      font-size: 12px;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 12px;
      display: none;
    }

    /* Terminal (Advanced mode) */
    .terminal-container {
      background: var(--bg);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 0 30px rgba(20, 184, 166, 0.05);
    }
    .terminal-header {
      background: var(--card);
      padding: 8px 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .terminal-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .terminal-dot.red { background: var(--accent); }
    .terminal-dot.yellow { background: #ffbd2e; }
    .terminal-dot.green { background: var(--teal-bright); }
    .terminal-title {
      flex: 1;
      text-align: center;
      color: var(--muted-strong);
      font-family: var(--mono);
      font-size: 13px;
    }
    #terminal {
      height: 500px;
      padding: 10px;
    }
    .terminal-status {
      background: var(--card);
      padding: 8px 15px;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted-strong);
      display: flex;
      justify-content: space-between;
    }
    .btn-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    button, .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--accent-glow);
    }
    .btn-secondary {
      background: var(--bg-elevated);
      color: var(--muted);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover:not(:disabled) {
      color: var(--text);
      border-color: var(--muted-strong);
    }
    .btn-danger {
      background: var(--accent-dark);
      color: white;
    }
    .btn-danger:hover:not(:disabled) {
      background: var(--accent);
    }
    .btn-success {
      background: var(--teal);
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px var(--teal-glow);
    }
    .token-box {
      background: var(--bg-elevated);
      padding: 10px;
      border-radius: 5px;
      font-family: var(--mono);
      font-size: 12px;
      word-break: break-all;
      position: relative;
      border: 1px solid var(--border);
      color: var(--muted);
    }
    .copy-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      padding: 5px 10px;
      font-size: 11px;
      background: var(--teal);
      color: #fff;
    }
    .info-text {
      color: var(--muted-strong);
      font-size: 13px;
      margin: 10px 0 0 0;
    }
    .info-text code {
      font-family: var(--mono);
      color: var(--muted);
      background: var(--bg-elevated);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
    }
    .hidden { display: none !important; }
    .channel-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .channel-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border-radius: 5px;
      font-size: 13px;
      border: 1px solid var(--border);
    }
    .channel-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .channel-icon { font-size: 16px; }
    .badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: bold;
    }
    .badge.enabled { background: var(--teal); color: #fff; }
    .badge.disabled { background: var(--bg-elevated); color: var(--muted-strong); border: 1px solid var(--border); }
    .provider-info {
      background: var(--bg-elevated);
      padding: 12px;
      border-radius: 5px;
      border: 1px solid var(--border);
    }
    .provider-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .provider-row:last-child { margin-bottom: 0; }
    .provider-label { color: var(--muted-strong); font-size: 12px; }
    .provider-value { color: var(--text); font-size: 13px; font-weight: 500; }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(18, 20, 26, 0.85);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: var(--card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-strong);
      box-shadow: var(--shadow-md);
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 {
      margin: 0;
      font-family: var(--font-display);
      color: var(--accent);
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }
    .modal-close {
      background: none;
      border: none;
      color: var(--muted-strong);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .modal-close:hover { color: var(--text); }
    .modal-body {
      padding: 20px;
      flex: 1;
      overflow: auto;
    }
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .config-editor {
      width: 100%;
      min-height: 400px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--text);
      font-family: var(--mono);
      font-size: 13px;
      padding: 15px;
      resize: vertical;
    }
    .config-editor:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }
    .error-message {
      background: rgba(153, 27, 27, 0.2);
      color: var(--accent);
      padding: 10px;
      border-radius: 5px;
      border: 1px solid var(--border-strong);
      font-size: 13px;
      margin-bottom: 15px;
    }
    .no-config {
      color: var(--muted-strong);
      font-size: 13px;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg> OpenClaw Setup</h1>
      <div style="display: flex; align-items: center; gap: 15px;">
        ${isConfigured ? `<a href="/ui?password=${encodeURIComponent(password)}" style="color: var(--teal-bright); text-decoration: none; font-family: var(--font-body); font-size: 14px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Management Panel &rarr;</a>` : ''}
      <div class="mode-toggle">
        <button id="mode-simple" class="active" onclick="setMode('simple')">Simple Mode</button>
        <button id="mode-advanced" onclick="setMode('advanced')">Advanced Mode</button>
      </div>
      </div>
    </div>

    <div class="grid">
      <div>
        <!-- ===== SIMPLE MODE (default) ===== -->
        <div id="simple-panel">
          <!-- Step 1: AI Provider -->
          <div class="card">
            <div class="step-header">
              <span class="step-number">1</span>
              <span class="step-title">AI Provider</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="provider-select">Provider</label>
              <select id="provider-select" class="form-select" onchange="updateAuthOptions()">
                <option value="">Select a provider...</option>
              </select>
            </div>

            <div class="form-group" id="auth-group">
              <label class="form-label" for="auth-select">Authentication Method</label>
              <select id="auth-select" class="form-select" onchange="updateSecretField()">
                <option value="">Select auth method...</option>
              </select>
            </div>

            <div class="form-group" id="secret-group">
              <label class="form-label" for="secret-input">API Key / Token</label>
              <input id="secret-input" type="password" class="form-input" placeholder="Enter your key or token..."/>
              <p class="form-hint">Your key is sent directly to OpenClaw and never stored by this UI.</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="flow-select">Flow (Agent Persona)</label>
              <select id="flow-select" class="form-select">
                <option value="">Default</option>
                <option value="assistant">Assistant</option>
                <option value="coder">Coder</option>
                <option value="creative">Creative</option>
              </select>
              <p class="form-hint">Optional. Choose a predefined agent persona.</p>
            </div>
          </div>

          <!-- Step 2: Channels -->
          <div class="card" style="margin-top: 20px;">
            <div class="step-header">
              <span class="step-number">2</span>
              <span class="step-title">Channels (Optional)</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="telegram-input">Telegram Bot Token</label>
              <input id="telegram-input" type="password" class="form-input" placeholder="123456:ABC-DEF..."/>
            </div>

            <div class="form-group">
              <label class="form-label" for="discord-input">Discord Bot Token</label>
              <input id="discord-input" type="password" class="form-input" placeholder="MTIz..."/>
            </div>

            <div class="form-group">
              <label class="form-label" for="slack-bot-input">Slack Bot Token</label>
              <input id="slack-bot-input" type="password" class="form-input" placeholder="xoxb-..."/>
            </div>

            <div class="form-group">
              <label class="form-label" for="slack-app-input">Slack App Token</label>
              <input id="slack-app-input" type="password" class="form-input" placeholder="xapp-..."/>
              <p class="form-hint">Required if using Slack Socket Mode.</p>
            </div>
          </div>

          <!-- Step 3: Actions -->
          <div class="card" style="margin-top: 20px;">
            <div class="step-header">
              <span class="step-number">3</span>
              <span class="step-title">Actions</span>
            </div>
            <div class="btn-group">
              <button id="run-setup-btn" class="btn-primary" onclick="runSetup()">
                <span>▶</span> Run Setup
              </button>
              <button id="reset-btn" class="btn-danger" onclick="resetConfig()">
                <span>🗑</span> Reset Configuration
              </button>
            </div>
            <pre id="log-output" class="log-output"></pre>
          </div>
        </div>

        <!-- ===== ADVANCED MODE (hidden) ===== -->
        <div id="advanced-panel" class="hidden">
          <div class="card" style="padding: 0; overflow: hidden;">
            <div class="terminal-container">
              <div class="terminal-header">
                <div class="terminal-dot red"></div>
                <div class="terminal-dot yellow"></div>
                <div class="terminal-dot green"></div>
                <div class="terminal-title">openclaw onboard</div>
              </div>
              <div id="terminal"></div>
              <div class="terminal-status">
                <span id="connection-status">Not connected</span>
                <span id="terminal-size"></span>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top: 20px;">
            <h2>Terminal Controls</h2>
            <div class="btn-group">
              <button id="start-onboard" class="btn-primary">
                <span>▶</span> Start Onboarding
              </button>
              <button id="start-gateway" class="btn-success" ${isConfigured ? '' : 'disabled'}>
                <span>🚀</span> Start Gateway
              </button>
              <button id="stop-gateway" class="btn-danger" ${gatewayInfo.running ? '' : 'disabled'}>
                <span>⏹</span> Stop Gateway
              </button>
            </div>
            <p class="info-text">
              Complete the onboarding wizard to configure OpenClaw, then start the gateway.
            </p>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT SIDEBAR (shared) ===== -->
      <div class="sidebar">
        <div class="card">
          <h2>Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">Gateway</span>
              <span class="status-value ${gatewayInfo.running ? 'running' : 'stopped'}" id="gateway-status">
                ${gatewayInfo.running ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Configuration</span>
              <span class="status-value ${isConfigured ? 'configured' : 'not-configured'}" id="config-status">
                ${isConfigured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2>AI Provider</h2>
          <div id="ai-provider-container">
            <div class="no-config">Loading...</div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2>Channels</h2>
          <div id="channels-container">
            <div class="no-config">Loading...</div>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2>Gateway Token</h2>
          <div class="token-box">
            <span id="token-value">${gatewayToken}</span>
            <button class="copy-btn" id="copy-token-btn">Copy</button>
          </div>
          <p class="info-text">Use this token to authenticate API requests.</p>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2>Actions</h2>
          <div class="btn-group" style="flex-direction: column;">
            <button id="edit-config-btn" class="btn btn-primary" ${isConfigured ? '' : 'disabled'}>
              <span>✏️</span> Edit Config
            </button>
            <a href="/setup/export?password=${encodeURIComponent(password)}" class="btn btn-secondary">
              <span>📦</span> Export Backup
            </a>
          </div>
        </div>

        <div class="card" style="margin-top: 20px;">
          <h2>Configuration</h2>
          <p class="info-text" style="margin: 0;">
            State: <code>${stateDir}</code><br>
            Port: <code>${gatewayInfo.port}</code>
          </p>
        </div>
      </div>
    </div>

    <!-- Config Editor Modal -->
    <div id="config-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Configuration</h3>
          <button class="modal-close" id="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div id="config-error" class="error-message hidden"></div>
          <textarea id="config-editor" class="config-editor" spellcheck="false"></textarea>
        </div>
        <div class="modal-footer">
          <button id="config-cancel" class="btn btn-secondary">Cancel</button>
          <button id="config-save" class="btn btn-success">Save Changes</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/lib/xterm.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0/lib/addon-fit.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@xterm/addon-web-links@0/lib/addon-web-links.min.js"></script>
  <script>
    (function() {
      var password = ${JSON.stringify(password)};
      var authGroups = ${JSON.stringify(authGroups || [])};
      var ws = null;
      var term = null;
      var fitAddon = null;
      var terminalInitialized = false;

      // Helper to safely set button content (icon span + text)
      function setButtonContent(btn, icon, text) {
        btn.textContent = '';
        var span = document.createElement('span');
        span.textContent = icon;
        btn.appendChild(span);
        btn.appendChild(document.createTextNode(' ' + text));
      }

      // ----- Mode toggle -----
      window.setMode = function(mode) {
        var simplePanel = document.getElementById('simple-panel');
        var advancedPanel = document.getElementById('advanced-panel');
        var btnSimple = document.getElementById('mode-simple');
        var btnAdvanced = document.getElementById('mode-advanced');

        if (mode === 'simple') {
          simplePanel.classList.remove('hidden');
          advancedPanel.classList.add('hidden');
          btnSimple.classList.add('active');
          btnAdvanced.classList.remove('active');
        } else {
          simplePanel.classList.add('hidden');
          advancedPanel.classList.remove('hidden');
          btnSimple.classList.remove('active');
          btnAdvanced.classList.add('active');

          // Lazy-init terminal on first switch
          if (!terminalInitialized) {
            terminalInitialized = true;
            initTerminal();
          }
        }
      };

      // ----- Provider/auth cascading dropdowns -----
      function populateProviders() {
        var sel = document.getElementById('provider-select');
        authGroups.forEach(function(g, idx) {
          var opt = document.createElement('option');
          opt.value = idx;
          opt.textContent = g.provider;
          sel.appendChild(opt);
        });
      }

      window.updateAuthOptions = function() {
        var provIdx = document.getElementById('provider-select').value;
        var authSel = document.getElementById('auth-select');
        var secretGroup = document.getElementById('secret-group');

        // Clear existing options safely
        while (authSel.options.length > 0) authSel.remove(0);
        var defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = 'Select auth method...';
        authSel.appendChild(defaultOpt);

        if (provIdx === '') {
          secretGroup.classList.remove('hidden');
          return;
        }

        var group = authGroups[parseInt(provIdx)];
        group.options.forEach(function(o) {
          var opt = document.createElement('option');
          opt.value = o.value;
          opt.textContent = o.label;
          authSel.appendChild(opt);
        });

        // Auto-select if only one option
        if (group.options.length === 1) {
          authSel.value = group.options[0].value;
        }

        updateSecretField();
      };

      window.updateSecretField = function() {
        var authVal = document.getElementById('auth-select').value;
        var secretGroup = document.getElementById('secret-group');

        // Hide secret field for Ollama (no key needed)
        if (authVal === 'ollama') {
          secretGroup.classList.add('hidden');
        } else {
          secretGroup.classList.remove('hidden');
        }
      };

      // ----- Simple mode: Run Setup -----
      window.runSetup = function() {
        var btn = document.getElementById('run-setup-btn');
        var logEl = document.getElementById('log-output');
        var provIdx = document.getElementById('provider-select').value;
        var authChoice = document.getElementById('auth-select').value;
        var authSecret = document.getElementById('secret-input').value;
        var flow = document.getElementById('flow-select').value;
        var telegram = document.getElementById('telegram-input').value;
        var discord = document.getElementById('discord-input').value;
        var slackBot = document.getElementById('slack-bot-input').value;
        var slackApp = document.getElementById('slack-app-input').value;

        if (provIdx === '' || authChoice === '') {
          logEl.style.display = 'block';
          logEl.textContent = 'Error: Please select a provider and auth method.';
          return;
        }

        if (authChoice !== 'ollama' && !authSecret) {
          logEl.style.display = 'block';
          logEl.textContent = 'Error: Please enter your API key or token.';
          return;
        }

        btn.disabled = true;
        setButtonContent(btn, '⏳', 'Running...');
        logEl.style.display = 'block';
        logEl.textContent = 'Starting setup...\\n';

        fetch('/setup/api/run?password=' + encodeURIComponent(password), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authChoice: authChoice, authSecret: authSecret, flow: flow, telegram: telegram, discord: discord, slackBot: slackBot, slackApp: slackApp })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.logs) {
            logEl.textContent = data.logs.join('\\n');
          }
          if (data.success) {
            logEl.textContent += '\\n\\n✓ Setup complete! Reloading...';
            setTimeout(function() { location.reload(); }, 1500);
          } else {
            logEl.textContent += '\\n\\n✗ Setup failed. Check the logs above.';
            btn.disabled = false;
            setButtonContent(btn, '▶', 'Run Setup');
          }
        })
        .catch(function(err) {
          logEl.textContent += '\\nError: ' + err.message;
          btn.disabled = false;
          setButtonContent(btn, '▶', 'Run Setup');
        });
      };

      // ----- Simple mode: Reset Config -----
      window.resetConfig = function() {
        if (!confirm('This will delete the current configuration and stop the gateway. Continue?')) return;

        var logEl = document.getElementById('log-output');
        logEl.style.display = 'block';
        logEl.textContent = 'Resetting configuration...\\n';

        fetch('/setup/api/reset?password=' + encodeURIComponent(password), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            logEl.textContent += 'Configuration reset. Reloading...';
            setTimeout(function() { location.reload(); }, 1000);
          } else {
            logEl.textContent += 'Reset failed: ' + (data.error || 'Unknown error');
          }
        })
        .catch(function(err) {
          logEl.textContent += 'Error: ' + err.message;
        });
      };

      // ----- Terminal (Advanced mode) -----
      function initTerminal() {
        term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          theme: {
            background: '#12141a',
            foreground: '#e4e4e7',
            cursor: '#14b8a6',
            cursorAccent: '#12141a',
            selection: 'rgba(255, 92, 92, 0.15)',
            black: '#181b22',
            red: '#ff5c5c',
            green: '#14b8a6',
            yellow: '#f59e0b',
            blue: '#71717a',
            magenta: '#ff5c5c',
            cyan: '#14b8a6',
            white: '#e4e4e7',
            brightBlack: '#52525b',
            brightRed: '#ff7070',
            brightGreen: '#00e5cc',
            brightYellow: '#f59e0b',
            brightBlue: '#71717a',
            brightMagenta: '#ff7070',
            brightCyan: '#00e5cc',
            brightWhite: '#fafafa'
          }
        });

        fitAddon = new FitAddon.FitAddon();
        var webLinksAddon = new WebLinksAddon.WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.open(document.getElementById('terminal'));
        fitAddon.fit();

        updateTerminalSize();

        window.addEventListener('resize', function() {
          if (!fitAddon) return;
          fitAddon.fit();
          updateTerminalSize();
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'resize',
              cols: term.cols,
              rows: term.rows
            }));
          }
        });

        term.onData(function(data) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data: data }));
          }
        });

        term.writeln('\\x1b[1;36mOpenClaw Setup Terminal\\x1b[0m');
        term.writeln('\\x1b[90mClick "Start Onboarding" to begin the setup wizard.\\x1b[0m');
        term.writeln('');
      }

      function updateTerminalSize() {
        if (term) {
          document.getElementById('terminal-size').textContent = term.cols + 'x' + term.rows;
        }
      }

      function updateConnectionStatus(status, color) {
        var el = document.getElementById('connection-status');
        el.textContent = status;
        el.style.color = color || '#888';
      }

      function startOnboarding() {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }

        term.clear();
        term.writeln('\\x1b[1;33mConnecting to onboarding wizard...\\x1b[0m');
        updateConnectionStatus('Connecting...', '#f59e0b');

        var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(protocol + '//' + location.host + '/setup/ws?password=' + encodeURIComponent(password));

        ws.onopen = function() {
          term.clear();
          updateConnectionStatus('Connected', '#10b981');
        };

        ws.onmessage = function(event) {
          try {
            var msg = JSON.parse(event.data);
            if (msg.type === 'output') {
              term.write(msg.data);
            } else if (msg.type === 'exit') {
              term.writeln('');
              if (msg.code === 0) {
                term.writeln('\\x1b[1;32m✓ Onboarding complete\\x1b[0m');
                updateConnectionStatus('Completed', '#10b981');
                term.writeln('\\x1b[90mYou can now start the gateway using the button above.\\x1b[0m');
                setTimeout(function() { location.reload(); }, 1000);
              } else {
                term.writeln('\\x1b[1;31m✗ Onboarding failed (exit code: ' + msg.code + ')\\x1b[0m');
                updateConnectionStatus('Failed', '#ef4444');
                term.writeln('\\x1b[90mCheck the output above for errors, then try again.\\x1b[0m');
              }
            }
          } catch (e) {
            term.write(event.data);
          }
        };

        ws.onclose = function() {
          updateConnectionStatus('Disconnected', '#ef4444');
        };

        ws.onerror = function() {
          term.writeln('\\x1b[1;31mConnection error. Please try again.\\x1b[0m');
          updateConnectionStatus('Error', '#ef4444');
        };
      }

      // ----- Gateway controls (Advanced mode) -----
      function startGateway() {
        var btn = document.getElementById('start-gateway');
        btn.disabled = true;
        setButtonContent(btn, '⏳', 'Starting...');

        fetch('/setup/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password })
        })
        .then(function(response) {
          if (response.ok) {
            location.reload();
          } else {
            return response.json().then(function(data) {
              throw new Error(data.error || 'Unknown error');
            });
          }
        })
        .catch(function(e) {
          alert('Failed to start gateway: ' + e.message);
          btn.disabled = false;
          setButtonContent(btn, '🚀', 'Start Gateway');
        });
      }

      function stopGateway() {
        var btn = document.getElementById('stop-gateway');
        btn.disabled = true;
        setButtonContent(btn, '⏳', 'Stopping...');

        fetch('/setup/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password })
        })
        .then(function(response) {
          if (response.ok) {
            location.reload();
          } else {
            return response.json().then(function(data) {
              throw new Error(data.error || 'Unknown error');
            });
          }
        })
        .catch(function(e) {
          alert('Failed to stop gateway: ' + e.message);
          btn.disabled = false;
          setButtonContent(btn, '⏹', 'Stop Gateway');
        });
      }

      // ----- Shared utilities -----
      function copyToken() {
        var token = document.getElementById('token-value').textContent;
        navigator.clipboard.writeText(token).then(function() {
          var btn = document.getElementById('copy-token-btn');
          btn.textContent = 'Copied!';
          setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
        });
      }

      var channelIcons = {
        whatsapp: '💬',
        telegram: '✈️',
        discord: '🎮',
        slack: '💼',
        signal: '🔒',
        imessage: '📱',
        teams: '👥',
        matrix: '🔗'
      };

      var currentConfig = null;

      function createElement(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent) el.textContent = textContent;
        return el;
      }

      function loadConfig() {
        fetch('/setup/config?password=' + encodeURIComponent(password))
          .then(function(res) { return res.json(); })
          .then(function(config) {
            currentConfig = config;
            displayAIProvider(config);
            displayChannels(config);
          })
          .catch(function() {
            var aiContainer = document.getElementById('ai-provider-container');
            var channelsContainer = document.getElementById('channels-container');
            aiContainer.textContent = '';
            channelsContainer.textContent = '';
            aiContainer.appendChild(createElement('div', 'no-config', 'Failed to load config'));
            channelsContainer.appendChild(createElement('div', 'no-config', 'Failed to load config'));
          });
      }

      function displayAIProvider(config) {
        var container = document.getElementById('ai-provider-container');
        container.textContent = '';

        if (!config || !config.agent || !config.agent.model) {
          container.appendChild(createElement('div', 'no-config', 'Not configured yet'));
          return;
        }

        var model = config.agent.model;
        var parts = model.split('/');
        var provider = parts[0] || 'Unknown';
        var modelName = parts[1] || model;

        provider = provider.charAt(0).toUpperCase() + provider.slice(1);

        var infoDiv = createElement('div', 'provider-info');

        var providerRow = createElement('div', 'provider-row');
        providerRow.appendChild(createElement('span', 'provider-label', 'Provider'));
        providerRow.appendChild(createElement('span', 'provider-value', provider));
        infoDiv.appendChild(providerRow);

        var modelRow = createElement('div', 'provider-row');
        modelRow.appendChild(createElement('span', 'provider-label', 'Model'));
        modelRow.appendChild(createElement('span', 'provider-value', modelName));
        infoDiv.appendChild(modelRow);

        container.appendChild(infoDiv);
      }

      function displayChannels(config) {
        var container = document.getElementById('channels-container');
        container.textContent = '';

        if (!config || !config.channels) {
          container.appendChild(createElement('div', 'no-config', 'No channels configured'));
          return;
        }

        var channels = config.channels;
        var channelNames = Object.keys(channels);

        if (channelNames.length === 0) {
          container.appendChild(createElement('div', 'no-config', 'No channels configured'));
          return;
        }

        var listDiv = createElement('div', 'channel-list');

        channelNames.forEach(function(name) {
          var channel = channels[name];
          var enabled = channel.enabled !== false;
          var icon = channelIcons[name.toLowerCase()] || '📡';
          var displayName = name.charAt(0).toUpperCase() + name.slice(1);

          var itemDiv = createElement('div', 'channel-item');

          var nameSpan = createElement('span', 'channel-name');
          nameSpan.appendChild(createElement('span', 'channel-icon', icon));
          nameSpan.appendChild(createElement('span', null, displayName));
          itemDiv.appendChild(nameSpan);

          var badgeClass = 'badge ' + (enabled ? 'enabled' : 'disabled');
          itemDiv.appendChild(createElement('span', badgeClass, enabled ? 'Enabled' : 'Disabled'));

          listDiv.appendChild(itemDiv);
        });

        container.appendChild(listDiv);
      }

      // ----- Config editor modal -----
      function openConfigEditor() {
        if (!currentConfig) return;

        var modal = document.getElementById('config-modal');
        var editor = document.getElementById('config-editor');
        var errorEl = document.getElementById('config-error');

        editor.value = JSON.stringify(currentConfig, null, 2);
        errorEl.classList.add('hidden');
        modal.classList.remove('hidden');
      }

      function closeConfigEditor() {
        document.getElementById('config-modal').classList.add('hidden');
      }

      function saveConfig() {
        var editor = document.getElementById('config-editor');
        var errorEl = document.getElementById('config-error');
        var saveBtn = document.getElementById('config-save');

        var newConfig;
        try {
          newConfig = JSON.parse(editor.value);
        } catch (e) {
          errorEl.textContent = 'Invalid JSON: ' + e.message;
          errorEl.classList.remove('hidden');
          return;
        }

        if (!newConfig.agent || !newConfig.agent.model) {
          errorEl.textContent = 'Configuration must include agent.model';
          errorEl.classList.remove('hidden');
          return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        fetch('/setup/config?password=' + encodeURIComponent(password), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        })
        .then(function(res) {
          if (!res.ok) {
            return res.json().then(function(data) {
              throw new Error(data.error || 'Failed to save');
            });
          }
          return res.json();
        })
        .then(function() {
          currentConfig = newConfig;
          displayAIProvider(newConfig);
          displayChannels(newConfig);
          closeConfigEditor();
        })
        .catch(function(e) {
          errorEl.textContent = e.message;
          errorEl.classList.remove('hidden');
        })
        .finally(function() {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Changes';
        });
      }

      // ----- Initialize -----
      document.addEventListener('DOMContentLoaded', function() {
        // Populate provider dropdown
        populateProviders();

        // Advanced mode buttons
        document.getElementById('start-onboard').addEventListener('click', startOnboarding);
        document.getElementById('start-gateway').addEventListener('click', startGateway);
        document.getElementById('stop-gateway').addEventListener('click', stopGateway);

        // Shared
        document.getElementById('copy-token-btn').addEventListener('click', copyToken);

        // Config editor events
        document.getElementById('edit-config-btn').addEventListener('click', openConfigEditor);
        document.getElementById('modal-close').addEventListener('click', closeConfigEditor);
        document.getElementById('config-cancel').addEventListener('click', closeConfigEditor);
        document.getElementById('config-save').addEventListener('click', saveConfig);

        document.getElementById('config-modal').addEventListener('click', function(e) {
          if (e.target === this) closeConfigEditor();
        });

        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') closeConfigEditor();
        });

        // Load config on page load
        loadConfig();
      });
    })();
  </script>
</body>
</html>`;
}
