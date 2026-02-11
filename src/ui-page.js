/**
 * Management panel HTML generator for OpenClaw
 *
 * Generates the /ui management panel with dual-mode UI:
 * - Simple Mode (default): Dashboard with status, channels, logs, config editor
 * - Advanced Mode: xterm.js terminal with quick command buttons
 */

/**
 * Generate the management panel HTML
 * @param {Object} options - Page options
 * @param {boolean} options.isConfigured - Whether OpenClaw is configured
 * @param {Object} options.gatewayInfo - Gateway process info
 * @param {string} options.password - Auth password for WebSocket
 * @param {string} options.stateDir - State directory path
 * @param {string} options.gatewayToken - Gateway auth token
 * @param {number|null} options.uptime - Gateway uptime in seconds
 * @returns {string} HTML content
 */
export function getUIPageHTML({ isConfigured, gatewayInfo, password, stateDir, gatewayToken, uptime }) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw Management</title>
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
    h1 .subtitle {
      color: var(--teal-bright);
      font-size: 0.6em;
      font-weight: 500;
      margin-left: 5px;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .nav-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-link:hover { color: var(--teal-bright); }
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
    .card + .card { margin-top: 20px; }

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

    /* Status items */
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
    .status-label { color: var(--muted); font-size: 13px; }
    .status-value {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-value.running { background: var(--teal-bright); color: var(--bg); }
    .status-value.stopped { background: var(--accent); color: #fff; }
    .status-text {
      color: var(--text);
      font-size: 13px;
      font-weight: 500;
    }

    /* Buttons */
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
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Channel list */
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
    .channel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: bold;
    }
    .badge.enabled { background: var(--teal); color: #fff; }
    .badge.disabled { background: var(--bg-elevated); color: var(--muted-strong); border: 1px solid var(--border); }
    .toggle-btn {
      padding: 3px 8px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--muted);
      transition: all 0.2s;
    }
    .toggle-btn:hover {
      border-color: var(--teal);
      color: var(--text);
    }

    /* Pairing section */
    .pairing-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--border);
    }
    .pairing-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .pairing-form .form-group {
      flex: 1;
      margin: 0;
    }

    /* Form elements */
    .form-group {
      margin-bottom: 12px;
    }
    .form-label {
      display: block;
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 500;
    }
    .form-input {
      width: 100%;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--font-body);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }

    /* Logs */
    .log-container {
      background: var(--bg);
      border-radius: 6px;
      border: 1px solid var(--border);
      height: 400px;
      display: flex;
      flex-direction: column;
    }
    .log-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      border-radius: 6px 6px 0 0;
    }
    .log-toolbar label {
      color: var(--muted);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }
    .log-toolbar input[type="checkbox"] {
      accent-color: var(--teal);
    }
    .log-output {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-family: var(--mono);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .log-line { display: block; }
    .log-line .ts {
      color: var(--muted-strong);
      margin-right: 8px;
    }
    .log-line.stdout { color: var(--teal-bright); }
    .log-line.stderr { color: var(--accent); }

    /* Config editor */
    .config-editor {
      width: 100%;
      min-height: 300px;
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
    .config-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .config-msg {
      font-size: 13px;
      margin-top: 8px;
      padding: 8px 10px;
      border-radius: 5px;
    }
    .config-msg.success {
      color: var(--teal-bright);
      background: rgba(20, 184, 166, 0.1);
      border: 1px solid rgba(20, 184, 166, 0.2);
    }
    .config-msg.error {
      color: var(--accent);
      background: rgba(153, 27, 27, 0.2);
      border: 1px solid var(--border-strong);
    }

    /* Token box */
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
    .no-config {
      color: var(--muted-strong);
      font-size: 13px;
      text-align: center;
      padding: 20px;
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
    #ui-terminal {
      height: 600px;
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

    /* Quick commands */
    .quick-commands {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .quick-cmd-btn {
      padding: 8px 14px;
      font-size: 12px;
      font-family: var(--mono);
      background: var(--bg-elevated);
      color: var(--muted);
      border: 1px solid var(--border);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quick-cmd-btn:hover {
      color: var(--teal-bright);
      border-color: var(--teal);
      background: rgba(20, 184, 166, 0.05);
    }

    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        <svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg> OpenClaw
        <span class="subtitle">Management</span>
      </h1>
      <div class="header-right">
        <a href="/setup?password=${encodeURIComponent(password)}" class="nav-link">&larr; Setup</a>
        <div class="mode-toggle">
          <button id="mode-simple" class="active" onclick="setMode('simple')">Simple</button>
          <button id="mode-advanced" onclick="setMode('advanced')">Advanced</button>
        </div>
      </div>
    </div>

    <!-- ===== SIMPLE MODE (default) ===== -->
    <div id="simple-panel">
      <div class="grid">
        <div>
          <!-- Status Overview -->
          <div class="card">
            <h2>Status Overview</h2>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Gateway</span>
                <span class="status-value ${gatewayInfo.running ? 'running' : 'stopped'}" id="gw-status-badge">
                  ${gatewayInfo.running ? 'Running' : 'Stopped'}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">Uptime</span>
                <span class="status-text" id="gw-uptime">${uptime != null ? formatUptime(uptime) : 'N/A'}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Model</span>
                <span class="status-text" id="gw-model">Loading...</span>
              </div>
              <div class="status-item">
                <span class="status-label">PID</span>
                <span class="status-text" id="gw-pid">${gatewayInfo.pid || 'N/A'}</span>
              </div>
              <div class="status-item">
                <span class="status-label">Port</span>
                <span class="status-text">${gatewayInfo.port}</span>
              </div>
            </div>
          </div>

          <!-- Channel Dashboard -->
          <div class="card">
            <h2>Channel Dashboard</h2>
            <div id="channel-dashboard">
              <div class="no-config">Loading...</div>
            </div>

            <div class="pairing-section">
              <h2 style="font-size: 14px; margin-bottom: 10px;">Pairing Approval</h2>
              <div class="pairing-form">
                <div class="form-group">
                  <label class="form-label">Channel</label>
                  <input id="pairing-channel" type="text" class="form-input" placeholder="e.g. telegram"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Code</label>
                  <input id="pairing-code" type="text" class="form-input" placeholder="e.g. 123456"/>
                </div>
                <button class="btn-success btn-sm" onclick="approvePairing()" style="margin-bottom: 0; white-space: nowrap;">Approve</button>
              </div>
              <div id="pairing-msg" class="config-msg hidden" style="margin-top: 8px;"></div>
            </div>
          </div>

          <!-- Gateway Logs -->
          <div class="card">
            <h2>Gateway Logs</h2>
            <div class="log-container">
              <div class="log-toolbar">
                <label>
                  <input type="checkbox" id="auto-scroll" checked/> Auto-scroll
                </label>
                <button class="btn-sm btn-secondary" onclick="clearLogs()">Clear</button>
              </div>
              <div class="log-output" id="log-output"></div>
            </div>
          </div>

          <!-- Configuration Editor -->
          <div class="card">
            <h2>Configuration Editor</h2>
            <textarea id="config-editor" class="config-editor" spellcheck="false">Loading...</textarea>
            <div class="config-actions">
              <button class="btn-success" onclick="saveConfig(false)">Save</button>
              <button class="btn-primary" onclick="saveConfig(true)">Save &amp; Restart</button>
              <button class="btn-secondary" onclick="revertConfig()">Revert</button>
            </div>
            <div id="config-msg" class="config-msg hidden"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Quick Actions -->
          <div class="card">
            <h2>Quick Actions</h2>
            <div class="btn-group" style="flex-direction: column;">
              <button id="btn-start" class="btn-success" onclick="gatewayStart()" ${gatewayInfo.running ? 'disabled' : ''}>
                Start Gateway
              </button>
              <button id="btn-stop" class="btn-danger" onclick="gatewayStop()" ${gatewayInfo.running ? '' : 'disabled'}>
                Stop Gateway
              </button>
              <button id="btn-restart" class="btn-primary" onclick="gatewayRestart()" ${gatewayInfo.running ? '' : 'disabled'}>
                Restart Gateway
              </button>
              <a href="/setup?password=${encodeURIComponent(password)}" class="btn btn-secondary">
                Setup Wizard
              </a>
              <a href="/setup/export?password=${encodeURIComponent(password)}" class="btn btn-secondary">
                Export Backup
              </a>
            </div>
          </div>

          <!-- Gateway Token -->
          <div class="card">
            <h2>Gateway Token</h2>
            <div class="token-box">
              <span id="token-value">${gatewayToken}</span>
              <button class="copy-btn" onclick="copyToken()">Copy</button>
            </div>
          </div>

          <!-- System Info -->
          <div class="card">
            <h2>System Info</h2>
            <p class="info-text" style="margin: 0;">
              State: <code>${stateDir}</code><br>
              Gateway port: <code>${gatewayInfo.port}</code>
            </p>
          </div>
        </div>
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
            <div class="terminal-title">bash</div>
          </div>
          <div id="ui-terminal"></div>
          <div class="terminal-status">
            <span id="term-connection-status">Not connected</span>
            <span id="term-size"></span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Quick Commands</h2>
        <div class="quick-commands">
          <button class="quick-cmd-btn" onclick="sendQuickCmd('openclaw config list\\n')">openclaw config list</button>
          <button class="quick-cmd-btn" onclick="sendQuickCmd('openclaw pairing list\\n')">openclaw pairing list</button>
          <button class="quick-cmd-btn" onclick="sendQuickCmd('openclaw help\\n')">openclaw help</button>
          <button class="quick-cmd-btn" onclick="sendQuickCmd('openclaw version\\n')">openclaw version</button>
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
      var ws = null;
      var term = null;
      var fitAddon = null;
      var terminalInitialized = false;
      var lastLogId = 0;
      var savedConfig = null;
      var statusPollTimer = null;
      var logsPollTimer = null;

      // ----- Helpers -----
      function authParam() {
        return 'password=' + encodeURIComponent(password);
      }

      function formatUptime(seconds) {
        if (seconds == null) return 'N/A';
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
        if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
        if (m > 0) return m + 'm ' + s + 's';
        return s + 's';
      }

      function formatTime(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString();
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
          startPolling();
        } else {
          simplePanel.classList.add('hidden');
          advancedPanel.classList.remove('hidden');
          btnSimple.classList.remove('active');
          btnAdvanced.classList.add('active');
          stopPolling();
          if (!terminalInitialized) {
            terminalInitialized = true;
            initTerminal();
            connectTerminal();
          }
        }
      };

      // ----- Status polling -----
      function pollStatus() {
        fetch('/ui/api/status?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            // Update gateway status badge
            var badge = document.getElementById('gw-status-badge');
            badge.textContent = data.gatewayRunning ? 'Running' : 'Stopped';
            badge.className = 'status-value ' + (data.gatewayRunning ? 'running' : 'stopped');

            // Update uptime
            document.getElementById('gw-uptime').textContent = formatUptime(data.uptime);

            // Update model
            if (data.model) {
              document.getElementById('gw-model').textContent = data.model;
            } else {
              document.getElementById('gw-model').textContent = 'N/A';
            }

            // Update PID
            document.getElementById('gw-pid').textContent = data.gatewayInfo ? (data.gatewayInfo.pid || 'N/A') : 'N/A';

            // Update button states
            document.getElementById('btn-start').disabled = data.gatewayRunning;
            document.getElementById('btn-stop').disabled = !data.gatewayRunning;
            document.getElementById('btn-restart').disabled = !data.gatewayRunning;

            // Update channels
            displayChannels(data.channels);
          })
          .catch(function() {});
      }

      function pollLogs() {
        fetch('/ui/api/logs?' + authParam() + '&since=' + lastLogId)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.entries && data.entries.length > 0) {
              var container = document.getElementById('log-output');
              data.entries.forEach(function(entry) {
                var line = document.createElement('span');
                line.className = 'log-line ' + entry.stream;
                var ts = document.createElement('span');
                ts.className = 'ts';
                ts.textContent = formatTime(entry.timestamp);
                line.appendChild(ts);
                line.appendChild(document.createTextNode(entry.text));
                container.appendChild(line);
                container.appendChild(document.createTextNode('\\n'));
              });
              lastLogId = data.lastId;

              if (document.getElementById('auto-scroll').checked) {
                container.scrollTop = container.scrollHeight;
              }
            }
          })
          .catch(function() {});
      }

      function startPolling() {
        stopPolling();
        pollStatus();
        pollLogs();
        statusPollTimer = setInterval(pollStatus, 5000);
        logsPollTimer = setInterval(pollLogs, 2000);
      }

      function stopPolling() {
        if (statusPollTimer) { clearInterval(statusPollTimer); statusPollTimer = null; }
        if (logsPollTimer) { clearInterval(logsPollTimer); logsPollTimer = null; }
      }

      // ----- Logs -----
      window.clearLogs = function() {
        document.getElementById('log-output').textContent = '';
      };

      // ----- Gateway controls -----
      function gatewayAction(action, btn) {
        btn.disabled = true;
        var origText = btn.textContent;
        btn.textContent = 'Working...';

        fetch('/ui/api/gateway/' + action + '?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (!data.success && data.error) {
              console.error('Gateway ' + action + ' failed:', data.error);
            }
            // Poll immediately to update UI
            setTimeout(pollStatus, 500);
          })
          .catch(function(err) {
            console.error('Gateway ' + action + ' error:', err);
          })
          .finally(function() {
            btn.textContent = origText;
            btn.disabled = false;
          });
      }

      window.gatewayStart = function() { gatewayAction('start', document.getElementById('btn-start')); };
      window.gatewayStop = function() { gatewayAction('stop', document.getElementById('btn-stop')); };
      window.gatewayRestart = function() { gatewayAction('restart', document.getElementById('btn-restart')); };

      // ----- Channels -----
      var channelIcons = {
        whatsapp: '💬', telegram: '✈️', discord: '🎮', slack: '💼',
        signal: '🔒', imessage: '📱', teams: '👥', matrix: '🔗'
      };

      function displayChannels(channels) {
        var container = document.getElementById('channel-dashboard');
        container.textContent = '';

        if (!channels || Object.keys(channels).length === 0) {
          var noConf = document.createElement('div');
          noConf.className = 'no-config';
          noConf.textContent = 'No channels configured';
          container.appendChild(noConf);
          return;
        }

        var listDiv = document.createElement('div');
        listDiv.className = 'channel-list';

        Object.keys(channels).forEach(function(name) {
          var ch = channels[name];
          var enabled = ch.enabled !== false;
          var icon = channelIcons[name.toLowerCase()] || '📡';
          var displayName = name.charAt(0).toUpperCase() + name.slice(1);

          var item = document.createElement('div');
          item.className = 'channel-item';

          var nameSpan = document.createElement('span');
          nameSpan.className = 'channel-name';
          var iconSpan = document.createElement('span');
          iconSpan.className = 'channel-icon';
          iconSpan.textContent = icon;
          nameSpan.appendChild(iconSpan);
          nameSpan.appendChild(document.createTextNode(displayName));
          item.appendChild(nameSpan);

          var actionsSpan = document.createElement('span');
          actionsSpan.className = 'channel-actions';

          var badge = document.createElement('span');
          badge.className = 'badge ' + (enabled ? 'enabled' : 'disabled');
          badge.textContent = enabled ? 'Enabled' : 'Disabled';
          actionsSpan.appendChild(badge);

          var toggleBtn = document.createElement('button');
          toggleBtn.className = 'toggle-btn';
          toggleBtn.textContent = enabled ? 'Disable' : 'Enable';
          toggleBtn.onclick = (function(chName, isEnabled) {
            return function() { toggleChannel(chName, !isEnabled); };
          })(name, enabled);
          actionsSpan.appendChild(toggleBtn);

          item.appendChild(actionsSpan);
          listDiv.appendChild(item);
        });

        container.appendChild(listDiv);
      }

      function toggleChannel(channelName, enable) {
        // Load current config, flip the enabled flag, save
        fetch('/ui/api/config?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(config) {
            if (config && config.channels && config.channels[channelName]) {
              config.channels[channelName].enabled = enable;
              return fetch('/ui/api/config?' + authParam(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
              });
            }
          })
          .then(function() {
            pollStatus();
            loadConfig();
          })
          .catch(function(err) {
            console.error('Toggle channel error:', err);
          });
      }

      // ----- Pairing approval -----
      window.approvePairing = function() {
        var channel = document.getElementById('pairing-channel').value.trim();
        var code = document.getElementById('pairing-code').value.trim();
        var msgEl = document.getElementById('pairing-msg');

        if (!channel || !code) {
          msgEl.className = 'config-msg error';
          msgEl.textContent = 'Please enter both channel and code.';
          msgEl.classList.remove('hidden');
          return;
        }

        fetch('/ui/api/pairing/approve?' + authParam(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: channel, code: code })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          msgEl.className = data.success ? 'config-msg success' : 'config-msg error';
          msgEl.textContent = data.message || data.error || (data.success ? 'Approved!' : 'Failed');
          msgEl.classList.remove('hidden');
          if (data.success) {
            document.getElementById('pairing-channel').value = '';
            document.getElementById('pairing-code').value = '';
          }
          setTimeout(function() { msgEl.classList.add('hidden'); }, 5000);
        })
        .catch(function(err) {
          msgEl.className = 'config-msg error';
          msgEl.textContent = 'Error: ' + err.message;
          msgEl.classList.remove('hidden');
        });
      };

      // ----- Configuration editor -----
      function loadConfig() {
        fetch('/ui/api/config?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(config) {
            savedConfig = config;
            var editor = document.getElementById('config-editor');
            editor.value = config ? JSON.stringify(config, null, 2) : '{}';

            // Update model display
            if (config && config.agent && config.agent.model) {
              document.getElementById('gw-model').textContent = config.agent.model;
            }
          })
          .catch(function() {
            document.getElementById('config-editor').value = '// Failed to load config';
          });
      }

      window.saveConfig = function(restart) {
        var editor = document.getElementById('config-editor');
        var msgEl = document.getElementById('config-msg');
        var newConfig;

        try {
          newConfig = JSON.parse(editor.value);
        } catch (e) {
          msgEl.className = 'config-msg error';
          msgEl.textContent = 'Invalid JSON: ' + e.message;
          msgEl.classList.remove('hidden');
          return;
        }

        fetch('/ui/api/config?' + authParam(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            savedConfig = newConfig;
            msgEl.className = 'config-msg success';
            msgEl.textContent = 'Configuration saved.' + (restart ? ' Restarting gateway...' : '');
            msgEl.classList.remove('hidden');

            if (restart) {
              fetch('/ui/api/gateway/restart?' + authParam(), { method: 'POST' })
                .then(function() { setTimeout(pollStatus, 2000); });
            }
          } else {
            msgEl.className = 'config-msg error';
            msgEl.textContent = data.error || 'Failed to save';
            msgEl.classList.remove('hidden');
          }
          setTimeout(function() { msgEl.classList.add('hidden'); }, 5000);
        })
        .catch(function(err) {
          msgEl.className = 'config-msg error';
          msgEl.textContent = 'Error: ' + err.message;
          msgEl.classList.remove('hidden');
        });
      };

      window.revertConfig = function() {
        if (savedConfig) {
          document.getElementById('config-editor').value = JSON.stringify(savedConfig, null, 2);
          var msgEl = document.getElementById('config-msg');
          msgEl.className = 'config-msg success';
          msgEl.textContent = 'Reverted to last saved configuration.';
          msgEl.classList.remove('hidden');
          setTimeout(function() { msgEl.classList.add('hidden'); }, 3000);
        }
      };

      // ----- Token copy -----
      window.copyToken = function() {
        var token = document.getElementById('token-value').textContent;
        navigator.clipboard.writeText(token).then(function() {
          var btn = document.querySelector('.copy-btn');
          btn.textContent = 'Copied!';
          setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
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
        term.open(document.getElementById('ui-terminal'));
        fitAddon.fit();

        updateTermSize();

        window.addEventListener('resize', function() {
          if (!fitAddon) return;
          fitAddon.fit();
          updateTermSize();
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
          }
        });

        term.onData(function(data) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data: data }));
          }
        });
      }

      function updateTermSize() {
        if (term) {
          document.getElementById('term-size').textContent = term.cols + 'x' + term.rows;
        }
      }

      function updateTermStatus(status, color) {
        var el = document.getElementById('term-connection-status');
        el.textContent = status;
        el.style.color = color || '#888';
      }

      function connectTerminal() {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }

        updateTermStatus('Connecting...', '#f59e0b');

        var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(protocol + '//' + location.host + '/ui/ws?' + authParam());

        ws.onopen = function() {
          term.clear();
          updateTermStatus('Connected', '#10b981');
          if (fitAddon) {
            ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
          }
        };

        ws.onmessage = function(event) {
          try {
            var msg = JSON.parse(event.data);
            if (msg.type === 'output') {
              term.write(msg.data);
            } else if (msg.type === 'exit') {
              term.writeln('');
              term.writeln('\\x1b[90mSession ended (code: ' + msg.code + ')\\x1b[0m');
              updateTermStatus('Disconnected', '#ef4444');
            }
          } catch (e) {
            term.write(event.data);
          }
        };

        ws.onclose = function() {
          updateTermStatus('Disconnected', '#ef4444');
        };

        ws.onerror = function() {
          term.writeln('\\x1b[1;31mConnection error.\\x1b[0m');
          updateTermStatus('Error', '#ef4444');
        };
      }

      // ----- Quick commands -----
      window.sendQuickCmd = function(cmd) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: cmd }));
        } else {
          connectTerminal();
          // Wait for connection then send
          setTimeout(function() {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'input', data: cmd }));
            }
          }, 1000);
        }
      };

      // ----- Initialize -----
      document.addEventListener('DOMContentLoaded', function() {
        loadConfig();
        startPolling();
      });
    })();
  </script>
</body>
</html>`;
}

/**
 * Format uptime seconds into human-readable string (server-side for initial render)
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  if (seconds == null) return 'N/A';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
