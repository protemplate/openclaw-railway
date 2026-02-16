/**
 * Setup page HTML generator for OpenClaw
 *
 * Generates a simplified 5-step onboarding wizard:
 * Step 1: Welcome
 * Step 2: AI Provider
 * Step 3: Channels (optional)
 * Step 4: Skills (optional)
 * Step 5: Review & Deploy
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
export function getSetupPageHTML({ isConfigured, gatewayInfo, password, stateDir, gatewayToken, authGroups, channelGroups }) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw Setup</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>
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
    a { color: var(--teal-bright); }
    a:hover { color: var(--teal); }

    /* Layout */
    .wizard-container {
      max-width: 680px;
      margin: 0 auto;
    }
    .wizard-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .wizard-header h1 {
      font-family: var(--font-display);
      color: var(--text-strong);
      margin: 0;
      font-weight: 600;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .wizard-header .logo { width: 28px; height: 28px; }

    /* Step indicator */
    .wizard-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 32px;
      padding: 0 10px;
    }
    .wizard-step {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .wizard-step.disabled { cursor: default; }
    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 600;
      border: 2px solid var(--border-strong);
      color: var(--muted-strong);
      background: var(--bg);
      transition: all var(--duration-normal);
      flex-shrink: 0;
    }
    .wizard-step.active .step-circle {
      border-color: var(--accent);
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
      color: #fff;
    }
    .wizard-step.completed .step-circle {
      border-color: var(--teal);
      background: var(--teal);
      color: #fff;
    }
    .step-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted-strong);
      transition: color var(--duration-normal);
    }
    .wizard-step.active .step-label { color: var(--text); }
    .wizard-step.completed .step-label { color: var(--teal-bright); }
    .step-connector {
      flex: 1;
      height: 2px;
      background: var(--border);
      margin: 0 8px;
      min-width: 20px;
      transition: background var(--duration-normal);
    }
    .step-connector.completed { background: var(--teal); }

    /* Step panels */
    .step-panel {
      display: none;
      animation: fadeIn 0.25s ease-out;
    }
    .step-panel.active { display: block; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card {
      background: var(--card);
      padding: 28px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }

    /* Navigation */
    .wizard-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    button, .btn {
      padding: 10px 22px;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
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
      transform: translateY(-1px);
      box-shadow: 0 4px 15px var(--accent-glow);
      color: white;
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
    .btn-deploy {
      background: linear-gradient(135deg, var(--teal) 0%, #0d9488 100%);
      color: white;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: var(--radius-md);
      width: 100%;
    }
    .btn-deploy:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--teal-glow);
    }
    .btn-text {
      background: none;
      border: none;
      color: var(--muted);
      padding: 8px 0;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-text:hover { color: var(--accent); }

    /* ===================== Step 1: Welcome ===================== */
    .welcome-logo { width: 80px; height: 80px; margin-bottom: 16px; }
    .welcome-heading {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      color: var(--text-strong);
      margin: 0 0 8px 0;
    }
    .welcome-sub {
      color: var(--muted);
      font-size: 15px;
      margin: 0 0 24px 0;
    }
    .welcome-steps {
      list-style: none;
      padding: 0;
      margin: 0 0 24px 0;
    }
    .welcome-steps li {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text);
      font-size: 14px;
    }
    .welcome-steps li .step-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent-subtle);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .before-section {
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      border: 1px solid var(--border);
    }
    .before-section h3 {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
    }
    .key-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .key-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--teal-bright);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: border-color 0.2s, background 0.2s;
    }
    .key-link:hover {
      border-color: var(--teal);
      background: rgba(20, 184, 166, 0.05);
      color: var(--teal-bright);
    }

    /* ===================== Step 2: AI Provider ===================== */
    .provider-category-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
    }
    .provider-category-label:not(:first-child) {
      margin-top: 20px;
    }
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .provider-card {
      padding: 14px 12px;
      background: var(--bg-elevated);
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: all 0.15s;
    }
    .provider-card:hover {
      border-color: var(--border-strong);
      background: var(--bg-hover);
    }
    .provider-card.selected {
      border-color: var(--accent);
      background: var(--accent-subtle);
    }
    .provider-icon {
      width: 22px;
      height: 22px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }
    .provider-icon svg {
      width: 20px;
      height: 20px;
    }
    .provider-icon .emoji-fallback {
      font-size: 20px;
      line-height: 1;
    }
    .provider-card .provider-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text);
    }
    .provider-card.selected .provider-name { color: var(--text-strong); }
    .provider-desc {
      font-size: 11px;
      color: var(--muted-strong);
      line-height: 1.3;
    }
    .extra-fields-container {
      margin-top: 12px;
    }
    .extra-fields-container .form-group {
      margin-bottom: 12px;
    }
    .extra-fields-container .form-group:last-child {
      margin-bottom: 0;
    }
    .auth-methods {
      margin-bottom: 16px;
    }
    .auth-methods label.auth-methods-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--muted);
      display: block;
      margin-bottom: 8px;
    }
    .radio-group {
      display: flex;
      gap: 12px;
    }
    .radio-option {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 14px;
      color: var(--text);
    }
    .radio-option input[type="radio"] {
      accent-color: var(--accent);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
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
    .form-input, .form-select {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 14px;
      font-family: var(--font-body);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .form-input:focus, .form-select:focus {
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
    .form-hint a { color: var(--teal-bright); text-decoration: none; }
    .form-hint a:hover { text-decoration: underline; }
    .inline-error {
      color: var(--accent);
      font-size: 13px;
      margin-top: 6px;
      display: none;
    }
    .inline-error.show { display: block; }

    /* ===================== Step 3: Channels ===================== */
    .channels-desc {
      color: var(--muted);
      font-size: 14px;
      margin: 0 0 20px 0;
    }
    .channel-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .channel-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .channel-card.enabled { border-color: var(--teal); }
    .channel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
    }
    .channel-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .channel-icon {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .channel-icon svg {
      width: 20px;
      height: 20px;
    }
    .channel-icon .emoji-fallback {
      font-size: 20px;
      line-height: 1;
    }
    .channel-category-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 10px 0;
    }
    .channel-category-label:not(:first-child) {
      margin-top: 20px;
    }
    .plugin-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      color: var(--warn);
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 4px;
      padding: 1px 6px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .channel-note {
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
      margin-top: 4px;
    }
    .channel-name-text {
      font-weight: 600;
      font-size: 14px;
      color: var(--text);
    }
    /* Toggle switch */
    .toggle-switch {
      position: relative;
      width: 42px;
      height: 24px;
      flex-shrink: 0;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--muted-strong);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .toggle-switch input:checked + .toggle-slider {
      background: var(--teal);
    }
    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(18px);
    }
    .channel-body {
      display: none;
      padding: 0 16px 16px;
    }
    .channel-card.enabled .channel-body { display: block; }
    .channel-help {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }
    .channel-help a { color: var(--teal-bright); text-decoration: none; }
    .channel-help a:hover { text-decoration: underline; }

    /* ===================== Step 4: Skills ===================== */
    .skills-desc {
      color: var(--muted);
      font-size: 14px;
      margin: 0 0 20px 0;
    }
    .skill-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .skill-card {
      padding: 16px;
      background: var(--bg-elevated);
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      position: relative;
    }
    .skill-card:hover { border-color: var(--border-strong); background: var(--bg-hover); }
    .skill-card.selected { border-color: var(--teal); background: rgba(20, 184, 166, 0.08); }
    .skill-card.selected::after {
      content: '\\2713';
      position: absolute;
      top: 6px;
      right: 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--teal);
    }
    .skill-emoji { font-size: 28px; margin-bottom: 6px; }
    .skill-name { font-weight: 600; font-size: 13px; color: var(--text); }
    .skill-desc { font-size: 11px; color: var(--muted-strong); margin-top: 2px; }

    /* ===================== Step 5: Review & Deploy ===================== */
    .review-summary {
      margin-bottom: 24px;
    }
    .review-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .review-row:last-child { border-bottom: none; }
    .review-label {
      color: var(--muted);
      font-size: 13px;
    }
    .review-value {
      color: var(--text-strong);
      font-size: 14px;
      font-weight: 500;
    }
    .deploy-area { /* Wrapper for deploy button */ }
    .deploy-progress {
      display: none;
      text-align: center;
    }
    .deploy-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid var(--border);
      border-top-color: var(--teal);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    .deploy-spinner.error {
      border-top-color: var(--accent);
      animation: none;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .deploy-status {
      font-size: 15px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 12px;
    }
    .deploy-log {
      background: var(--bg);
      color: var(--teal-bright);
      font-family: var(--mono);
      font-size: 12px;
      padding: 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      max-height: 220px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      text-align: left;
      margin-bottom: 16px;
    }
    .deploy-success {
      display: none;
      text-align: center;
      padding: 20px 0;
    }
    .success-check {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--teal);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
      color: #fff;
    }
    .success-heading {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: var(--text-strong);
      margin: 0 0 8px 0;
    }
    .success-sub {
      color: var(--muted);
      font-size: 14px;
      margin: 0 0 20px 0;
    }
    .success-links {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .success-links a {
      text-decoration: none;
    }

    /* ===================== Already Configured ===================== */
    .configured-card {
      max-width: 480px;
      margin: 80px auto;
      text-align: center;
      background: var(--card);
      padding: 40px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }
    .configured-check {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--teal);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
      color: #fff;
    }
    .configured-card h2 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: var(--text-strong);
      margin: 0 0 8px 0;
    }
    .configured-status {
      font-size: 14px;
      margin-bottom: 24px;
    }
    .configured-status .running { color: var(--teal-bright); }
    .configured-status .stopped { color: var(--accent); }
    .configured-links {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .configured-links a { text-decoration: none; }

    .hidden { display: none !important; }

    /* ===================== Mobile ===================== */
    @media (max-width: 600px) {
      body { padding: 12px; }
      .wizard-container { max-width: 100%; }
      .step-label { display: none; }
      .wizard-steps { gap: 0; }
      .step-connector { min-width: 16px; margin: 0 4px; }
      .provider-grid { grid-template-columns: repeat(2, 1fr); }
      .skill-grid { grid-template-columns: repeat(2, 1fr); }
      .wizard-nav { gap: 8px; }
      .wizard-nav button { flex: 1; justify-content: center; }
      .card { padding: 20px; }
      .welcome-heading { font-size: 22px; }
      .success-links, .configured-links { flex-direction: column; align-items: center; }
    }
    @media (max-width: 400px) {
      .provider-grid { grid-template-columns: 1fr; }
      .skill-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  ${isConfigured ? `
  <!-- =============== Already Configured =============== -->
  <div id="configured-view" class="configured-card">
    <div class="configured-check">&#10003;</div>
    <h2>OpenClaw is already configured</h2>
    <p class="configured-status">
      Gateway: <span class="${gatewayInfo.running ? 'running' : 'stopped'}">${gatewayInfo.running ? 'Running' : 'Stopped'}</span>
    </p>
    <div class="configured-links">
      <a href="/ui?password=${encodeURIComponent(password)}" class="btn btn-primary">Open Management Panel</a>
      <a href="/openclaw" class="btn btn-secondary">Open OpenClaw UI</a>
    </div>
    <button class="btn-text" onclick="showReconfigureWarning()">Reconfigure from scratch</button>
  </div>
  ` : ''}

  <!-- =============== Wizard =============== -->
  <div id="wizard-view" class="wizard-container ${isConfigured ? 'hidden' : ''}">
    <div class="wizard-header">
      <h1>
        <svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg>
        OpenClaw Setup
      </h1>
    </div>

    <!-- Step indicator -->
    <div class="wizard-steps">
      <div class="wizard-step active" data-step="1" onclick="clickStep(1)">
        <div class="step-circle"><span>1</span></div>
        <span class="step-label">Welcome</span>
      </div>
      <div class="step-connector" data-connector="1"></div>
      <div class="wizard-step disabled" data-step="2" onclick="clickStep(2)">
        <div class="step-circle"><span>2</span></div>
        <span class="step-label">AI Provider</span>
      </div>
      <div class="step-connector" data-connector="2"></div>
      <div class="wizard-step disabled" data-step="3" onclick="clickStep(3)">
        <div class="step-circle"><span>3</span></div>
        <span class="step-label">Channels</span>
      </div>
      <div class="step-connector" data-connector="3"></div>
      <div class="wizard-step disabled" data-step="4" onclick="clickStep(4)">
        <div class="step-circle"><span>4</span></div>
        <span class="step-label">Skills</span>
      </div>
      <div class="step-connector" data-connector="4"></div>
      <div class="wizard-step disabled" data-step="5" onclick="clickStep(5)">
        <div class="step-circle"><span>5</span></div>
        <span class="step-label">Deploy</span>
      </div>
    </div>

    <!-- ===== Step 1: Welcome ===== -->
    <div class="step-panel active" id="step-1">
      <div class="card" style="text-align: center;">
        <svg class="welcome-logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="wlg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#wlg)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#wlg)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#wlg)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg>
        <h2 class="welcome-heading">Welcome to OpenClaw</h2>
        <p class="welcome-sub">Your personal AI assistant for Telegram, Discord, Slack, and more</p>

        <ul class="welcome-steps" style="text-align: left; max-width: 380px; margin: 0 auto 24px;">
          <li><span class="step-icon">1</span> Connect an AI provider</li>
          <li><span class="step-icon">2</span> Add messaging channels</li>
          <li><span class="step-icon">3</span> Pick skills</li>
          <li><span class="step-icon">4</span> Deploy and start chatting</li>
        </ul>

        <div class="before-section" style="text-align: left;">
          <h3>Before you begin</h3>
          <p style="color: var(--muted); font-size: 13px; margin: 0 0 10px 0;">You'll need an API key from at least one provider:</p>
          <div class="key-links">
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" class="key-link">Anthropic</a>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" class="key-link">OpenAI</a>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="key-link">Google Gemini</a>
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" class="key-link">OpenRouter</a>
            <span class="key-link" style="cursor: default; color: var(--muted); border-color: var(--border);">+ 8 more providers</span>
          </div>
        </div>
      </div>
      <div class="wizard-nav">
        <div></div>
        <button class="btn-primary" onclick="goToStep(2)">Get Started &rarr;</button>
      </div>
    </div>

    <!-- ===== Step 2: AI Provider ===== -->
    <div class="step-panel" id="step-2">
      <div class="card">
        <div class="form-group">
          <label class="form-label">Select your AI provider</label>
          <h4 class="provider-category-label">Popular</h4>
          <div class="provider-grid" id="provider-grid-popular"></div>
          <h4 class="provider-category-label">More Providers</h4>
          <div class="provider-grid" id="provider-grid-more"></div>
        </div>

        <div class="form-group" id="auth-methods-group" style="display: none;">
          <div class="auth-methods">
            <label class="auth-methods-label">Authentication Method</label>
            <div class="radio-group" id="auth-radio-group"></div>
          </div>
        </div>

        <div class="form-group" id="secret-group" style="display: none;">
          <label class="form-label" for="secret-input" id="secret-label">API Key</label>
          <input id="secret-input" type="password" class="form-input" placeholder="Enter your key or token..."/>
          <p class="form-hint" id="secret-hint">Your key is sent directly to OpenClaw and never stored by this UI.</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="flow-select">Agent Persona (optional)</label>
          <select id="flow-select" class="form-select">
            <option value="">Default</option>
            <option value="assistant">Assistant</option>
            <option value="coder">Coder</option>
            <option value="creative">Creative</option>
          </select>
        </div>

        <div id="step2-error" class="inline-error"></div>
      </div>
      <div class="wizard-nav">
        <button class="btn-secondary" onclick="goToStep(1)">&larr; Back</button>
        <button class="btn-primary" onclick="validateAndGoToStep(3)">Next: Channels &rarr;</button>
      </div>
    </div>

    <!-- ===== Step 3: Channels ===== -->
    <div class="step-panel" id="step-3">
      <div class="card">
        <p class="channels-desc">Optionally connect messaging platforms. You can add channels later from the Management Panel.</p>

        <div class="channel-cards" id="channel-cards-container"></div>
      </div>
      <div class="wizard-nav">
        <button class="btn-secondary" onclick="goToStep(2)">&larr; Back</button>
        <button class="btn-primary" onclick="goToStep(4)">Next: Skills &rarr;</button>
      </div>
    </div>

    <!-- ===== Step 4: Skills ===== -->
    <div class="step-panel" id="step-4">
      <div class="card">
        <p class="skills-desc">Choose skills to enhance your assistant. You can add more later.</p>
        <div class="skill-grid" id="skill-grid"></div>
      </div>
      <div class="wizard-nav">
        <button class="btn-secondary" onclick="goToStep(3)">&larr; Back</button>
        <button class="btn-primary" onclick="goToStep(5)">Next: Deploy &rarr;</button>
      </div>
    </div>

    <!-- ===== Step 5: Review & Deploy ===== -->
    <div class="step-panel" id="step-5">
      <div class="card">
        <div id="deploy-area">
          <div class="review-summary" id="review-summary"></div>
          <button class="btn-deploy" id="deploy-btn" onclick="deploy()">Deploy OpenClaw</button>
        </div>

        <div class="deploy-progress" id="deploy-progress">
          <div class="deploy-spinner" id="deploy-spinner"></div>
          <div class="deploy-status" id="deploy-status">Deploying...</div>
          <pre class="deploy-log" id="deploy-log"></pre>
          <button class="btn-primary hidden" id="retry-btn" onclick="retryDeploy()">Retry</button>
        </div>

        <div class="deploy-success" id="deploy-success">
          <div class="success-check">&#10003;</div>
          <h2 class="success-heading">OpenClaw is running!</h2>
          <p class="success-sub">Your AI assistant is ready to go.</p>
          <div class="success-links">
            <a href="/ui?password=${encodeURIComponent(password)}" class="btn btn-primary">Open Management Panel</a>
            <a href="/openclaw" class="btn btn-secondary">Open OpenClaw UI</a>
          </div>
        </div>
      </div>
      <div class="wizard-nav" id="step5-nav">
        <button class="btn-secondary" id="step5-back" onclick="goToStep(4)">&larr; Back</button>
        <div></div>
      </div>
    </div>
  </div>

  <script>
    (function() {
      var password = ${JSON.stringify(password)};
      var authGroups = ${JSON.stringify(authGroups || [])};
      var channelGroups = ${JSON.stringify(channelGroups || [])};

      var currentStep = 1;
      var highestStep = 1;
      var wizardLocked = false;
      var selectedProviderIndex = null;
      var selectedAuthChoice = null;
      var enabledChannels = {};
      channelGroups.forEach(function(ch) { enabledChannels[ch.name] = false; });
      var selectedSkills = [];

      var AVAILABLE_SKILLS = [
        { slug: 'weather', emoji: '\\u{1F324}\\uFE0F', name: 'Weather', desc: 'Get weather and forecasts, no API key needed' },
        { slug: 'github', emoji: '\\u{1F419}', name: 'GitHub', desc: 'Interact with GitHub via the gh CLI' },
        { slug: 'summarize', emoji: '\\u{1F9FE}', name: 'Summarize', desc: 'Summarize URLs, PDFs, and videos' },
        { slug: 'coding-agent', emoji: '\\u{1F4BB}', name: 'Coding Agent', desc: 'Run coding agents like Claude Code or Codex' },
        { slug: 'openai-image-gen', emoji: '\\u{1F3A8}', name: 'Image Generation', desc: 'Generate images with OpenAI DALL-E' },
        { slug: 'clawhub', emoji: '\\u{1F3EA}', name: 'ClawHub', desc: 'Discover and install community skills' },
        { slug: 'notion', emoji: '\\u{1F4DD}', name: 'Notion', desc: 'Read and manage Notion pages and databases' },
        { slug: 'obsidian', emoji: '\\u{1F4D3}', name: 'Obsidian', desc: 'Search and manage Obsidian vault notes' },
        { slug: 'trello', emoji: '\\u{1F4CB}', name: 'Trello', desc: 'Manage Trello boards, lists, and cards' },
        { slug: 'spotify-player', emoji: '\\u{1F3B5}', name: 'Spotify', desc: 'Control Spotify playback from chat' },
        { slug: 'session-logs', emoji: '\\u{1F4CA}', name: 'Session Logs', desc: 'View and search conversation logs' },
        { slug: 'model-usage', emoji: '\\u{1F4C8}', name: 'Model Usage', desc: 'Track AI model token usage and costs' }
      ];

      // Luminance check: lighten dark brand colors for visibility on dark background
      function ensureVisibleColor(hex, fallback) {
        if (!hex) return fallback || '#a1a1aa';
        var c = hex.replace('#', '');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var r = parseInt(c.substr(0,2), 16) / 255;
        var g = parseInt(c.substr(2,2), 16) / 255;
        var b = parseInt(c.substr(4,2), 16) / 255;
        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        var L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return L < 0.1 ? (fallback || '#a1a1aa') : hex;
      }

      var providerHelpLinks = {
        'Anthropic': 'https://console.anthropic.com/settings/keys',
        'OpenAI': 'https://platform.openai.com/api-keys',
        'Google / Gemini': 'https://aistudio.google.com/apikey',
        'OpenRouter': 'https://openrouter.ai/keys',
        'Venice AI': 'https://venice.ai/settings/api',
        'Together AI': 'https://api.together.xyz/settings/api-keys',
        'Vercel AI Gateway': 'https://vercel.com/docs/ai-gateway',
        'Moonshot AI': 'https://platform.moonshot.cn/console/api-keys',
        'Kimi Coding': 'https://platform.moonshot.cn/console/api-keys',
        'Z.AI (GLM)': 'https://open.bigmodel.cn/usercenter/apikeys',
        'Cloudflare AI Gateway': 'https://dash.cloudflare.com/',
        'Ollama': null
      };

      // ========== Step Navigation ==========
      function updateStepIndicator() {
        for (var i = 1; i <= 5; i++) {
          var stepEl = document.querySelector('.wizard-step[data-step="' + i + '"]');
          var circleSpan = stepEl.querySelector('.step-circle span');
          stepEl.classList.remove('active', 'completed', 'disabled');
          if (i === currentStep) {
            stepEl.classList.add('active');
            circleSpan.textContent = String(i);
          } else if (i < currentStep) {
            stepEl.classList.add('completed');
            circleSpan.textContent = '\\u2713';
          } else {
            stepEl.classList.add('disabled');
            circleSpan.textContent = String(i);
          }
        }
        for (var j = 1; j <= 4; j++) {
          var conn = document.querySelector('.step-connector[data-connector="' + j + '"]');
          if (j < currentStep) {
            conn.classList.add('completed');
          } else {
            conn.classList.remove('completed');
          }
        }
      }

      window.goToStep = function(n) {
        if (wizardLocked) return;
        if (n < 1 || n > 5) return;

        document.getElementById('step-' + currentStep).classList.remove('active');
        currentStep = n;
        if (n > highestStep) highestStep = n;
        document.getElementById('step-' + currentStep).classList.add('active');
        updateStepIndicator();

        if (n === 5) populateReview();
      };

      window.clickStep = function(n) {
        if (wizardLocked) return;
        if (n <= highestStep) {
          if (n < currentStep) {
            goToStep(n);
          } else if (n > currentStep) {
            if (currentStep === 2 && n > 2) {
              validateAndGoToStep(n);
            } else {
              goToStep(n);
            }
          }
        }
      };

      window.validateAndGoToStep = function(n) {
        if (selectedProviderIndex === null) {
          showStep2Error('Please select an AI provider.');
          return;
        }
        if (selectedAuthChoice === null) {
          showStep2Error('Please select an authentication method.');
          return;
        }
        if (selectedAuthChoice !== 'ollama') {
          var secretVal = document.getElementById('secret-input').value.trim();
          if (!secretVal) {
            showStep2Error('Please enter your API key or token.');
            return;
          }
        }
        // Validate extra fields if present
        var extraInputs = document.querySelectorAll('.extra-field-input');
        for (var k = 0; k < extraInputs.length; k++) {
          if (!extraInputs[k].value.trim()) {
            showStep2Error('Please fill in all required fields.');
            return;
          }
        }
        hideStep2Error();
        goToStep(n);
      };

      function showStep2Error(msg) {
        var el = document.getElementById('step2-error');
        el.textContent = msg;
        el.classList.add('show');
      }
      function hideStep2Error() {
        document.getElementById('step2-error').classList.remove('show');
      }

      // ========== Provider Selection ==========
      function buildProviderGrid() {
        var popularGrid = document.getElementById('provider-grid-popular');
        var moreGrid = document.getElementById('provider-grid-more');
        authGroups.forEach(function(g, idx) {
          var card = document.createElement('div');
          card.className = 'provider-card';
          card.setAttribute('data-idx', idx);
          card.onclick = function() { selectProvider(idx); };

          var iconDiv = document.createElement('div');
          iconDiv.className = 'provider-icon';
          if (g.icon && g.icon.svg) {
            var svgNS = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', ensureVisibleColor(g.icon.color || '#ffffff', '#a1a1aa'));
            var path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', g.icon.svg);
            svg.appendChild(path);
            iconDiv.appendChild(svg);
          } else if (g.emoji) {
            var span = document.createElement('span');
            span.className = 'emoji-fallback';
            span.textContent = g.emoji;
            iconDiv.appendChild(span);
          }
          card.appendChild(iconDiv);

          var name = document.createElement('div');
          name.className = 'provider-name';
          name.textContent = g.provider;
          card.appendChild(name);

          if (g.description) {
            var desc = document.createElement('div');
            desc.className = 'provider-desc';
            desc.textContent = g.description;
            card.appendChild(desc);
          }

          var targetGrid = (g.category === 'popular') ? popularGrid : moreGrid;
          targetGrid.appendChild(card);
        });
      }

      window.selectProvider = function(idx) {
        selectedProviderIndex = idx;
        selectedAuthChoice = null;

        var cards = document.querySelectorAll('.provider-card');
        for (var i = 0; i < cards.length; i++) {
          cards[i].classList.toggle('selected', parseInt(cards[i].getAttribute('data-idx')) === idx);
        }

        var group = authGroups[idx];
        var authGroup = document.getElementById('auth-methods-group');
        var radioGroup = document.getElementById('auth-radio-group');

        radioGroup.textContent = '';

        if (group.options.length === 1) {
          authGroup.style.display = 'none';
          selectedAuthChoice = group.options[0].value;
        } else {
          authGroup.style.display = 'block';
          group.options.forEach(function(opt) {
            var label = document.createElement('label');
            label.className = 'radio-option';
            var radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'auth-method';
            radio.value = opt.value;
            radio.onchange = function() {
              selectedAuthChoice = opt.value;
              updateSecretField();
            };
            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt.label));
            radioGroup.appendChild(label);
          });
        }

        updateSecretField();
        hideStep2Error();
      };

      function updateSecretField() {
        var secretGroup = document.getElementById('secret-group');
        var secretHint = document.getElementById('secret-hint');

        // Remove any previously rendered extra fields
        var oldExtra = document.getElementById('extra-fields-container');
        if (oldExtra) oldExtra.parentNode.removeChild(oldExtra);

        // Find current option object
        var currentOpt = null;
        if (selectedProviderIndex !== null && selectedAuthChoice !== null) {
          var opts = authGroups[selectedProviderIndex].options;
          for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === selectedAuthChoice) {
              currentOpt = opts[i];
              break;
            }
          }
        }

        if (selectedAuthChoice === 'ollama') {
          secretGroup.style.display = 'none';
        } else if (selectedAuthChoice !== null) {
          secretGroup.style.display = 'block';
          var group = authGroups[selectedProviderIndex];
          var link = providerHelpLinks[group.provider];
          // Build hint text safely using DOM methods
          secretHint.textContent = '';
          if (link) {
            secretHint.appendChild(document.createTextNode('Get your key from '));
            var a = document.createElement('a');
            a.href = link;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = link.replace('https://', '').split('/')[0];
            secretHint.appendChild(a);
          } else {
            secretHint.textContent = 'Your key is sent directly to OpenClaw and never stored by this UI.';
          }

          // Render extra fields if the option has them
          if (currentOpt && currentOpt.extraFields) {
            var container = document.createElement('div');
            container.id = 'extra-fields-container';
            container.className = 'extra-fields-container';
            for (var j = 0; j < currentOpt.extraFields.length; j++) {
              var ef = currentOpt.extraFields[j];
              var fg = document.createElement('div');
              fg.className = 'form-group';
              var lbl = document.createElement('label');
              lbl.className = 'form-label';
              lbl.textContent = ef.label;
              fg.appendChild(lbl);
              var inp = document.createElement('input');
              inp.type = 'text';
              inp.className = 'form-input extra-field-input';
              inp.setAttribute('data-field-id', ef.id);
              inp.placeholder = ef.placeholder || '';
              fg.appendChild(inp);
              container.appendChild(fg);
            }
            secretGroup.parentNode.insertBefore(container, secretGroup.nextSibling);
          }
        } else {
          if (selectedProviderIndex !== null) {
            secretGroup.style.display = 'block';
            // Update hint to match selected provider
            var group = authGroups[selectedProviderIndex];
            var link = providerHelpLinks[group.provider];
            secretHint.textContent = '';
            if (link) {
              secretHint.appendChild(document.createTextNode('Get your key from '));
              var a = document.createElement('a');
              a.href = link;
              a.target = '_blank';
              a.rel = 'noopener';
              a.textContent = link.replace('https://', '').split('/')[0];
              secretHint.appendChild(a);
            } else {
              secretHint.textContent = 'Your key is sent directly to OpenClaw and never stored by this UI.';
            }
          } else {
            secretGroup.style.display = 'none';
          }
        }
      }

      // ========== Channels ==========
      var CATEGORY_LABELS = { popular: 'Popular', more: 'More Channels' };
      var CATEGORY_ORDER = ['popular', 'more'];

      function buildChannelCards() {
        var container = document.getElementById('channel-cards-container');

        CATEGORY_ORDER.forEach(function(cat) {
          var channels = channelGroups.filter(function(ch) { return ch.category === cat; });
          if (channels.length === 0) return;

          var label = document.createElement('h4');
          label.className = 'channel-category-label';
          label.textContent = CATEGORY_LABELS[cat] || cat;
          container.appendChild(label);

          channels.forEach(function(ch) {
            var card = document.createElement('div');
            card.className = 'channel-card';
            card.id = 'channel-' + ch.name;

            // Header
            var header = document.createElement('div');
            header.className = 'channel-header';
            header.onclick = function() { toggleChannel(ch.name); };

            var headerLeft = document.createElement('div');
            headerLeft.className = 'channel-header-left';

            // Icon
            var iconDiv = document.createElement('div');
            iconDiv.className = 'channel-icon';
            if (ch.icon && ch.icon.svg) {
              var svgNS = 'http://www.w3.org/2000/svg';
              var svg = document.createElementNS(svgNS, 'svg');
              svg.setAttribute('viewBox', '0 0 24 24');
              svg.setAttribute('fill', ensureVisibleColor(ch.icon.color || '#ffffff', '#a1a1aa'));
              var path = document.createElementNS(svgNS, 'path');
              path.setAttribute('d', ch.icon.svg);
              svg.appendChild(path);
              iconDiv.appendChild(svg);
            } else {
              var emojiSpan = document.createElement('span');
              emojiSpan.className = 'emoji-fallback';
              emojiSpan.textContent = ch.emoji || '';
              iconDiv.appendChild(emojiSpan);
            }
            headerLeft.appendChild(iconDiv);

            var nameSpan = document.createElement('span');
            nameSpan.className = 'channel-name-text';
            nameSpan.textContent = ch.displayName;
            headerLeft.appendChild(nameSpan);

            header.appendChild(headerLeft);

            // Toggle switch
            var toggleLabel = document.createElement('label');
            toggleLabel.className = 'toggle-switch';
            toggleLabel.onclick = function(e) { e.stopPropagation(); };
            var toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.id = 'toggle-' + ch.name;
            toggleInput.onchange = function() { toggleChannel(ch.name, this.checked); };
            var slider = document.createElement('span');
            slider.className = 'toggle-slider';
            toggleLabel.appendChild(toggleInput);
            toggleLabel.appendChild(slider);
            header.appendChild(toggleLabel);

            card.appendChild(header);

            // Body (form fields, note, help links)
            var body = document.createElement('div');
            body.className = 'channel-body';

            if (ch.fields && ch.fields.length > 0) {
              ch.fields.forEach(function(field, fi) {
                var fg = document.createElement('div');
                fg.className = 'form-group';
                if (fi === ch.fields.length - 1 && !ch.helpUrl && !ch.helpText && !ch.note) {
                  fg.style.marginBottom = '0';
                }
                var lbl = document.createElement('label');
                lbl.className = 'form-label';
                lbl.textContent = field.label;
                fg.appendChild(lbl);
                var inp = document.createElement('input');
                inp.id = 'channel-field-' + ch.name + '-' + field.id;
                inp.type = field.type || 'text';
                inp.className = 'form-input';
                inp.placeholder = field.placeholder || '';
                fg.appendChild(inp);
                body.appendChild(fg);
              });
            }

            if (ch.note) {
              var noteDiv = document.createElement('div');
              noteDiv.className = 'channel-note';
              noteDiv.textContent = ch.note;
              body.appendChild(noteDiv);
            }

            if (ch.helpText || ch.helpUrl) {
              var help = document.createElement('p');
              help.className = 'channel-help';
              if (ch.helpText && ch.helpText.text) {
                help.appendChild(document.createTextNode(ch.helpText.text + ' '));
                var htLink = document.createElement('a');
                htLink.href = ch.helpText.linkUrl;
                htLink.target = '_blank';
                htLink.rel = 'noopener';
                htLink.textContent = ch.helpText.linkText;
                help.appendChild(htLink);
              }
              if (ch.helpUrl) {
                if (ch.helpText) help.appendChild(document.createTextNode(' \\u00b7 '));
                var docsLink = document.createElement('a');
                docsLink.href = ch.helpUrl;
                docsLink.target = '_blank';
                docsLink.rel = 'noopener';
                docsLink.textContent = ch.helpText ? 'Full guide' : 'Setup guide';
                help.appendChild(docsLink);
              }
              body.appendChild(help);
            }

            card.appendChild(body);
            container.appendChild(card);
          });
        });
      }

      window.toggleChannel = function(name, forceState) {
        var isEnabled;
        if (typeof forceState === 'boolean') {
          isEnabled = forceState;
        } else {
          isEnabled = !enabledChannels[name];
        }
        enabledChannels[name] = isEnabled;

        var checkbox = document.getElementById('toggle-' + name);
        if (checkbox) checkbox.checked = isEnabled;

        var card = document.getElementById('channel-' + name);
        if (card) {
          if (isEnabled) {
            card.classList.add('enabled');
          } else {
            card.classList.remove('enabled');
          }
        }
      };

      // ========== Skills ==========
      function buildSkillGrid() {
        var grid = document.getElementById('skill-grid');
        AVAILABLE_SKILLS.forEach(function(skill) {
          var card = document.createElement('div');
          card.className = 'skill-card';
          card.setAttribute('data-slug', skill.slug);
          card.onclick = function() { toggleSkill(skill.slug); };

          var emoji = document.createElement('div');
          emoji.className = 'skill-emoji';
          emoji.textContent = skill.emoji;
          card.appendChild(emoji);

          var name = document.createElement('div');
          name.className = 'skill-name';
          name.textContent = skill.name;
          card.appendChild(name);

          var desc = document.createElement('div');
          desc.className = 'skill-desc';
          desc.textContent = skill.desc;
          card.appendChild(desc);

          grid.appendChild(card);
        });
      }

      window.toggleSkill = function(slug) {
        var idx = selectedSkills.indexOf(slug);
        if (idx === -1) {
          selectedSkills.push(slug);
        } else {
          selectedSkills.splice(idx, 1);
        }
        var card = document.querySelector('.skill-card[data-slug="' + slug + '"]');
        if (card) {
          card.classList.toggle('selected', idx === -1);
        }
      };

      // ========== Review ==========
      function populateReview() {
        var container = document.getElementById('review-summary');
        container.textContent = '';

        function addRow(label, value) {
          var row = document.createElement('div');
          row.className = 'review-row';
          var l = document.createElement('span');
          l.className = 'review-label';
          l.textContent = label;
          var v = document.createElement('span');
          v.className = 'review-value';
          v.textContent = value;
          row.appendChild(l);
          row.appendChild(v);
          container.appendChild(row);
        }

        if (selectedProviderIndex !== null) {
          addRow('Provider', authGroups[selectedProviderIndex].provider);
        }
        if (selectedAuthChoice) {
          var authLabel = selectedAuthChoice;
          if (selectedProviderIndex !== null) {
            var opts = authGroups[selectedProviderIndex].options;
            for (var i = 0; i < opts.length; i++) {
              if (opts[i].value === selectedAuthChoice) {
                authLabel = opts[i].label;
                break;
              }
            }
          }
          addRow('Auth Method', authLabel);
        }

        var flow = document.getElementById('flow-select').value;
        addRow('Persona', flow || 'Default');

        var channelNames = [];
        channelGroups.forEach(function(ch) {
          if (enabledChannels[ch.name]) channelNames.push(ch.displayName);
        });
        addRow('Channels', channelNames.length > 0 ? channelNames.join(', ') : 'None');

        if (selectedSkills.length > 0) {
          var skillNames = selectedSkills.map(function(slug) {
            for (var i = 0; i < AVAILABLE_SKILLS.length; i++) {
              if (AVAILABLE_SKILLS[i].slug === slug) return AVAILABLE_SKILLS[i].name;
            }
            return slug;
          });
          addRow('Skills', skillNames.join(', ') + ' (' + selectedSkills.length + ' selected)');
        } else {
          addRow('Skills', 'None');
        }
      }

      // ========== Deploy ==========
      window.deploy = function() {
        wizardLocked = true;

        var deployArea = document.getElementById('deploy-area');
        var progress = document.getElementById('deploy-progress');
        var success = document.getElementById('deploy-success');
        var spinner = document.getElementById('deploy-spinner');
        var statusEl = document.getElementById('deploy-status');
        var logEl = document.getElementById('deploy-log');
        var retryBtn = document.getElementById('retry-btn');
        var backBtn = document.getElementById('step5-back');

        deployArea.style.display = 'none';
        success.style.display = 'none';
        progress.style.display = 'block';
        spinner.classList.remove('error');
        statusEl.textContent = 'Deploying...';
        logEl.textContent = '';
        retryBtn.classList.add('hidden');
        backBtn.disabled = true;

        var extraFieldValues = {};
        var extraInputs = document.querySelectorAll('.extra-field-input');
        for (var k = 0; k < extraInputs.length; k++) {
          extraFieldValues[extraInputs[k].getAttribute('data-field-id')] = extraInputs[k].value.trim();
        }

        // Build channels array from enabled channels
        var channelsPayload = [];
        channelGroups.forEach(function(ch) {
          if (!enabledChannels[ch.name]) return;
          var fields = {};
          if (ch.fields) {
            ch.fields.forEach(function(f) {
              var inp = document.getElementById('channel-field-' + ch.name + '-' + f.id);
              if (inp && inp.value.trim()) fields[f.id] = inp.value.trim();
            });
          }
          channelsPayload.push({ name: ch.name, fields: fields });
        });

        var payload = {
          authChoice: selectedAuthChoice,
          authSecret: selectedAuthChoice !== 'ollama' ? document.getElementById('secret-input').value.trim() : '',
          extraFieldValues: extraFieldValues,
          flow: document.getElementById('flow-select').value,
          channels: channelsPayload,
          skills: selectedSkills
        };

        fetch('/onboard/api/run?password=' + encodeURIComponent(password), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.logs) {
            logEl.textContent = data.logs.join('\\n');
          }
          if (data.success) {
            progress.style.display = 'none';
            success.style.display = 'block';
            document.getElementById('step5-nav').style.display = 'none';
          } else {
            spinner.classList.add('error');
            statusEl.textContent = 'Deployment failed';
            retryBtn.classList.remove('hidden');
            backBtn.disabled = false;
            wizardLocked = false;
          }
        })
        .catch(function(err) {
          logEl.textContent += '\\nError: ' + err.message;
          spinner.classList.add('error');
          statusEl.textContent = 'Deployment failed';
          retryBtn.classList.remove('hidden');
          backBtn.disabled = false;
          wizardLocked = false;
        });
      };

      window.retryDeploy = function() {
        deploy();
      };

      // ========== Already Configured: Reconfigure ==========
      window.showReconfigureWarning = function() {
        if (!confirm('This will delete the current configuration and stop the gateway. Are you sure?')) return;

        fetch('/onboard/api/reset?password=' + encodeURIComponent(password), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            var configured = document.getElementById('configured-view');
            var wizard = document.getElementById('wizard-view');
            if (configured) configured.classList.add('hidden');
            wizard.classList.remove('hidden');
            currentStep = 1;
            highestStep = 1;
            updateStepIndicator();
          } else {
            alert('Reset failed: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(function(err) {
          alert('Error: ' + err.message);
        });
      };

      // ========== Initialize ==========
      document.addEventListener('DOMContentLoaded', function() {
        buildProviderGrid();
        buildChannelCards();
        buildSkillGrid();
        updateStepIndicator();
      });
    })();
  </script>
</body>
</html>`;
}
