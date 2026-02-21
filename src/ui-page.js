/**
 * Lite Management Panel HTML generator for OpenClaw
 *
 * Generates the /lite management panel with dual-mode UI:
 * - Simple Mode (default): Dashboard with status hero, quick stats, integrations,
 *   activity feed, memory, settings, and sidebar controls
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
 * @param {Array} options.channelGroups - Channel groups with icon data
 * @returns {string} HTML content
 */
export function getUIPageHTML({ isConfigured, gatewayInfo, password, stateDir, gatewayToken, uptime, channelGroups, authGroups }) {
  // Build channel icons map for client-side use
  const channelIconsJSON = JSON.stringify(
    (channelGroups || []).reduce((acc, ch) => {
      acc[ch.name] = { svg: ch.icon?.svg || null, color: ch.icon?.color || '#6B7280', displayName: ch.displayName, description: ch.description || null };
      return acc;
    }, {})
  );

  // Build provider icons map for client-side use
  const providerIconsJSON = JSON.stringify(
    (authGroups || []).reduce((acc, g) => {
      acc[g.provider] = {
        svg: g.icon?.svg || null,
        color: g.icon?.color || '#6B7280',
        description: g.description,
        category: g.category
      };
      return acc;
    }, {})
  );

  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw Lite Management</title>
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

    /* === Status Hero === */
    .status-hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 4px solid var(--ok);
      border-radius: var(--radius-lg);
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      transition: border-color 0.3s;
    }
    .status-hero.stopped {
      border-left-color: var(--danger);
    }
    .status-hero-main {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-strong);
      white-space: nowrap;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--ok);
      flex-shrink: 0;
    }
    .status-dot.running {
      animation: pulse 2s ease-in-out infinite;
    }
    .status-dot.stopped {
      background: var(--danger);
      animation: none;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
    }
    .status-hero-details {
      display: flex;
      align-items: center;
      gap: 20px;
      color: var(--muted);
      font-size: 13px;
      flex: 1;
    }
    .status-hero-detail {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .status-hero-detail span:first-child {
      color: var(--muted-strong);
      font-size: 12px;
    }
    .status-hero-detail span:last-child {
      color: var(--text);
      font-weight: 500;
    }
    .status-hero-refresh {
      background: none;
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .status-hero-refresh:hover {
      color: var(--teal-bright);
      border-color: var(--teal);
    }
    @media (max-width: 700px) {
      .status-hero {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .status-hero-details {
        flex-wrap: wrap;
        gap: 10px;
      }
    }

    /* === Quick Stats === */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      text-align: center;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      border-color: var(--border-strong);
    }
    .stat-card-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-strong);
      font-family: var(--font-display);
      line-height: 1.1;
    }
    .stat-card-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 6px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card-icon {
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .quick-stats {
        grid-template-columns: 1fr;
      }
    }

    /* === Card Header === */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .card-header h2 {
      margin: 0;
    }
    .card-subtitle {
      color: var(--muted-strong);
      font-size: 12px;
      margin-top: 2px;
    }

    /* === Integration Items === */
    .integration-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
    }
    .integration-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      transition: border-color 0.2s;
      position: relative;
    }
    .integration-item:hover {
      border-color: var(--border-strong);
    }
    .integration-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .integration-icon svg {
      width: 20px;
      height: 20px;
    }
    .integration-name-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .integration-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      flex: 1;
    }
    .integration-model {
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
    }
    .integration-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .integration-status.active-model { background: var(--ok); }
    .integration-status.active { background: #3B82F6; }
    .integration-status.connected { background: #3B82F6; }
    .integration-status.inactive { background: var(--muted-strong); }

    /* === Hover Popover === */
    .integration-popover {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      min-width: 200px;
      max-width: 280px;
      z-index: 100;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      pointer-events: none;
    }
    .integration-popover::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: var(--border-strong);
    }
    .integration-item:hover .integration-popover {
      display: block;
    }
    .popover-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }
    .popover-desc {
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .popover-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 3px 0;
    }
    .popover-label {
      color: var(--muted);
    }
    .popover-value {
      color: var(--text);
      font-weight: 500;
    }
    .popover-badge {
      font-size: 11px;
      padding: 1px 8px;
      border-radius: 9999px;
      font-weight: 500;
    }
    .popover-badge.active   { background: rgba(34,197,94,0.15); color: #4ade80; }
    .popover-badge.connected { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .popover-badge.inactive { background: rgba(113,113,122,0.15); color: #a1a1aa; }

    /* === Empty State === */
    .empty-state {
      text-align: center;
      padding: 30px 20px;
      color: var(--muted);
    }
    .empty-state-icon {
      font-size: 32px;
      margin-bottom: 10px;
      opacity: 0.5;
    }
    .empty-state-text {
      font-size: 13px;
      margin-bottom: 12px;
    }
    .empty-state a {
      color: var(--teal-bright);
      text-decoration: none;
      font-weight: 500;
    }
    .empty-state a:hover {
      text-decoration: underline;
    }

    /* === Activity Feed === */
    .activity-feed {
      max-height: 200px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
    }
    .activity-item:last-child { border-bottom: none; }
    .activity-ts {
      color: var(--muted-strong);
      font-family: var(--mono);
      font-size: 11px;
      white-space: nowrap;
      flex-shrink: 0;
      padding-top: 1px;
    }
    .activity-icon {
      flex-shrink: 0;
      font-size: 14px;
      padding-top: 1px;
    }
    .activity-text {
      color: var(--text);
      flex: 1;
    }
    .activity-text.error { color: var(--accent); }

    /* Raw logs (collapsible) */
    .log-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 8px 0;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
      cursor: pointer;
      user-select: none;
      transition: color 0.2s;
    }
    .log-toggle:hover { color: var(--text); }
    .log-toggle-arrow {
      transition: transform 0.2s;
      font-size: 10px;
    }
    .log-toggle-arrow.open { transform: rotate(90deg); }
    .log-raw-container {
      background: var(--bg);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      height: 250px;
      display: flex;
      flex-direction: column;
      margin-top: 8px;
    }
    .log-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
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

    /* === Memory section === */
    .memory-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;
    }
    .memory-stat {
      font-size: 12px;
    }
    .memory-stat-label {
      color: var(--muted-strong);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10px;
    }
    .memory-stat-value {
      color: var(--text);
      font-weight: 500;
      margin-top: 2px;
    }
    .memory-search-input {
      width: 100%;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 5px;
      color: var(--text);
      font-size: 13px;
      font-family: var(--font-body);
      margin-bottom: 10px;
    }
    .memory-search-input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }
    .memory-results {
      max-height: 200px;
      overflow-y: auto;
    }
    .memory-result-item {
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      margin-bottom: 6px;
      font-size: 13px;
      color: var(--text);
      line-height: 1.5;
    }
    .section-notice {
      padding: 12px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }

    /* === Token Usage Chart === */
    .usage-toggle {
      display: flex;
      background: var(--bg-elevated);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .usage-toggle button {
      padding: 4px 14px;
      border: none;
      background: transparent;
      color: var(--muted);
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 0;
    }
    .usage-toggle button.active {
      background: var(--accent);
      color: #fff;
    }
    .usage-toggle button:not(.active):hover {
      color: var(--text);
      background: var(--bg-hover);
    }
    .usage-chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 160px;
      padding: 10px 0;
    }
    .usage-bar-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
      position: relative;
    }
    .usage-bar-track {
      width: 100%;
      max-width: 40px;
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .usage-bar {
      width: 100%;
      background: var(--accent);
      border-radius: 4px 4px 0 0;
      min-height: 3%;
      transition: height 0.3s ease;
      cursor: pointer;
      position: relative;
    }
    .usage-bar:hover {
      opacity: 0.85;
    }
    .usage-bar-label {
      font-size: 10px;
      color: var(--muted);
      margin-top: 6px;
      white-space: nowrap;
    }
    .usage-bar-value {
      font-size: 10px;
      color: var(--text);
      font-weight: 500;
      margin-bottom: 4px;
      white-space: nowrap;
    }
    .usage-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 50;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
    }
    .usage-bar:hover .usage-tooltip {
      display: block;
    }
    .usage-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 1px 0;
    }
    .usage-tooltip-label {
      color: var(--muted);
    }
    .usage-tooltip-value {
      color: var(--text);
      font-weight: 500;
    }
    .usage-by-type {
      display: none;
    }
    .usage-by-type.active {
      display: block;
    }
    .usage-stacked-bar {
      height: 32px;
      display: flex;
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .usage-stacked-segment {
      height: 100%;
      transition: width 0.3s ease;
    }
    .usage-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }
    .usage-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .usage-legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .usage-legend-count {
      color: var(--text);
      font-weight: 500;
      font-family: var(--mono);
      font-size: 11px;
    }
    .usage-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 13px;
    }
    .usage-total-label {
      color: var(--muted);
    }
    .usage-total-value {
      color: var(--text-strong);
      font-weight: 600;
      font-family: var(--mono);
    }

    /* === Settings links === */
    .settings-links {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .settings-link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 0.15s;
      text-decoration: none;
      color: var(--text);
    }
    .settings-link-item:hover {
      background: var(--bg-hover);
    }
    .settings-link-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }
    .settings-link-text h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }
    .settings-link-text p {
      margin: 2px 0 0 0;
      font-size: 11px;
      color: var(--muted);
    }

    /* === Quick Actions (sidebar) === */
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-action {
      width: 100%;
      justify-content: center;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius-md);
    }

    /* === Token (sidebar) === */
    .token-description {
      color: var(--muted);
      font-size: 12px;
      margin-bottom: 10px;
    }
    .token-masked {
      font-family: var(--mono);
      font-size: 13px;
      color: var(--text);
      word-break: break-all;
    }
    .token-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .token-btn {
      padding: 5px 12px;
      font-size: 11px;
      border: 1px solid var(--border);
      background: var(--bg-elevated);
      color: var(--muted);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .token-btn:hover {
      color: var(--text);
      border-color: var(--teal);
    }

    /* === System Info (sidebar) === */
    .system-info-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .system-info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .system-info-item .label {
      color: var(--muted);
    }
    .system-info-item .value {
      color: var(--text);
      font-family: var(--mono);
      font-size: 12px;
    }
    .system-info-status {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .system-info-status .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .system-info-status .dot.running { background: var(--ok); }
    .system-info-status .dot.stopped { background: var(--danger); }

    /* === Security Audit === */
    .audit-results {
      max-height: 300px;
      overflow-y: auto;
      margin-top: 12px;
    }
    .audit-summary {
      display: flex;
      gap: 12px;
      font-size: 12px;
      margin-bottom: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .audit-summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .audit-summary-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .audit-summary-dot.pass { background: var(--ok); }
    .audit-summary-dot.warn { background: #F59E0B; }
    .audit-summary-dot.fail { background: var(--danger); }
    .audit-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 0;
      font-size: 12px;
      border-bottom: 1px solid var(--border);
    }
    .audit-item:last-child { border-bottom: none; }
    .audit-item-icon {
      flex-shrink: 0;
      width: 16px;
      text-align: center;
    }
    .audit-item-text {
      color: var(--text);
      line-height: 1.4;
    }
    .audit-raw {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--muted);
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 250px;
      overflow-y: auto;
      margin-top: 8px;
    }

    /* === Maintenance === */
    .maintenance-version {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 12px;
      padding: 8px 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }
    .maintenance-version .version-current {
      color: var(--text);
      font-weight: 500;
    }
    .maintenance-version .version-update {
      color: var(--teal-bright);
      font-size: 11px;
    }
    .maintenance-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .maintenance-btn {
      width: 100%;
      justify-content: center;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: var(--radius-md);
    }
    .maintenance-upload {
      display: none;
    }
    .maintenance-status {
      display: none;
      margin-top: 12px;
      padding: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      max-height: 200px;
      overflow-y: auto;
      line-height: 1.8;
    }
    .maintenance-status.visible {
      display: block;
    }
    .maintenance-status .step {
      display: block;
    }
    .maintenance-status .step.ok { color: var(--ok); }
    .maintenance-status .step.err { color: var(--accent); }
    .maintenance-confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .maintenance-confirm-dialog {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      max-width: 400px;
      width: 90%;
    }
    .maintenance-confirm-dialog h3 {
      margin: 0 0 10px 0;
      color: var(--text-strong);
      font-size: 16px;
    }
    .maintenance-confirm-dialog p {
      color: var(--muted);
      font-size: 13px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    .maintenance-confirm-dialog .dialog-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    /* === Toast === */
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      z-index: 1000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
    }
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .toast.success {
      background: rgba(20, 184, 166, 0.15);
      border: 1px solid rgba(20, 184, 166, 0.3);
      color: var(--teal-bright);
    }
    .toast.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--accent);
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
    #advanced-panel {
      max-width: none;
      margin-left: -20px;
      margin-right: -20px;
      padding-left: 20px;
      padding-right: 20px;
    }
    #ui-terminal {
      height: 600px;
      padding: 5px;
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

    /* Command palette */
    .cmd-categories {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .cmd-cat-pill {
      padding: 4px 12px;
      font-size: 11px;
      font-family: var(--mono);
      background: var(--bg-elevated);
      color: var(--muted);
      border: 1px solid var(--border);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .cmd-cat-pill:hover {
      color: var(--teal-bright);
      border-color: var(--teal);
    }
    .cmd-cat-pill.active {
      background: var(--teal);
      color: var(--bg);
      border-color: var(--teal);
    }
    .cmd-list {
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }
    .cmd-section-label {
      font-size: 10px;
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      padding: 10px 0 4px;
    }
    .cmd-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .cmd-item:hover {
      background: rgba(20, 184, 166, 0.08);
    }
    .cmd-name {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--teal-bright);
      white-space: nowrap;
    }
    .cmd-desc {
      font-size: 11px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>
        <svg class="logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg> OpenClaw
        <span class="subtitle">Lite</span>
      </h1>
      <div class="header-right">
        <a href="/onboard?password=${encodeURIComponent(password)}" class="nav-link">&larr; Onboarding Wizard</a>
        <div class="mode-toggle">
          <button id="mode-simple" class="active" onclick="setMode('simple')">Simple</button>
          <button id="mode-advanced" onclick="setMode('advanced')">Advanced</button>
        </div>
      </div>
    </div>

    <!-- ===== SIMPLE MODE (default) ===== -->
    <div id="simple-panel">

      <!-- Gateway Status Hero -->
      <div class="status-hero ${gatewayInfo.running ? '' : 'stopped'}" id="status-hero">
        <div class="status-hero-main">
          <div class="status-dot ${gatewayInfo.running ? 'running' : 'stopped'}" id="hero-dot"></div>
          <span id="hero-status-text">${gatewayInfo.running ? 'Gateway Running' : 'Gateway Stopped'}</span>
        </div>
        <div class="status-hero-details">
          <div class="status-hero-detail">
            <span>Uptime</span>
            <span id="hero-uptime">${uptime != null ? formatUptime(uptime) : '--'}</span>
          </div>
        </div>
        <button class="status-hero-refresh" onclick="pollStatus()" title="Refresh status">&#x21bb;</button>
      </div>

      <!-- Quick Stats Row -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-card-value" id="stat-channels">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x1F4E1;</span> Channels</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" id="stat-skills">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x26A1;</span> Skills</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" id="stat-sessions">--</div>
          <div class="stat-card-label"><span class="stat-card-icon">&#x1F4AC;</span> Sessions</div>
        </div>
      </div>

      <div class="grid">
        <div>
          <!-- Model Providers Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2>Model Providers</h2>
                <div class="card-subtitle">Connected AI providers</div>
              </div>
            </div>
            <div id="providers-grid" class="integration-grid">
              <div class="empty-state">
                <div class="empty-state-text">Loading...</div>
              </div>
            </div>
          </div>

          <!-- Channels Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2>Channels</h2>
                <div class="card-subtitle">Connected messaging channels</div>
              </div>
            </div>
            <div id="integrations-grid" class="integration-grid">
              <div class="empty-state">
                <div class="empty-state-text">Loading...</div>
              </div>
            </div>

          </div>

          <!-- Daily Token Usage Card -->
          <div class="card" id="usage-card">
            <div class="card-header">
              <div>
                <h2>Daily Token Usage</h2>
                <div class="card-subtitle">Last 7 days</div>
              </div>
              <div class="usage-toggle">
                <button class="active" id="usage-tab-total" onclick="setUsageView('total')">Total</button>
                <button id="usage-tab-bytype" onclick="setUsageView('bytype')">By Type</button>
              </div>
            </div>
            <div id="usage-total-view">
              <div class="usage-chart" id="usage-chart">
                <div class="section-notice" style="width:100%">Loading usage data...</div>
              </div>
            </div>
            <div id="usage-bytype-view" class="usage-by-type">
              <div class="usage-stacked-bar" id="usage-stacked"></div>
              <div class="usage-legend" id="usage-legend"></div>
              <div class="usage-total-row">
                <span class="usage-total-label">Total tokens</span>
                <span class="usage-total-value" id="usage-grand-total">--</span>
              </div>
            </div>
          </div>

          <!-- Activity & Logs Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h2>Activity</h2>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <label style="color: var(--muted); font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                  <input type="checkbox" id="auto-scroll" checked style="accent-color: var(--teal);"/> Auto-scroll
                </label>
                <button class="btn-sm btn-secondary" onclick="clearActivity()">Clear</button>
              </div>
            </div>
            <div class="activity-feed" id="activity-feed"></div>
            <div class="log-toggle" onclick="toggleRawLogs()">
              <span class="log-toggle-arrow" id="log-toggle-arrow">&#x25B6;</span>
              Raw Logs
            </div>
            <div id="raw-logs-section" class="hidden">
              <div class="log-raw-container">
                <div class="log-toolbar">
                  <span style="color: var(--muted); font-size: 12px;">Gateway output</span>
                  <button class="btn-sm btn-secondary" onclick="clearLogs()">Clear</button>
                </div>
                <div class="log-output" id="log-output"></div>
              </div>
            </div>
          </div>

          <!-- Memory & Knowledge Card -->
          <div class="card" id="memory-card">
            <div class="card-header">
              <div>
                <h2>Memory &amp; Knowledge</h2>
                <div class="card-subtitle">What your agent remembers</div>
              </div>
            </div>
            <div id="memory-content">
              <div class="section-notice">Loading memory status...</div>
            </div>
          </div>

          <!-- Security Audit -->
          <div class="card" id="security-audit-card">
            <div class="card-header">
              <div>
                <h2>Security Audit</h2>
                <div class="card-subtitle">Check config for security issues</div>
              </div>
              <div class="quick-actions" style="gap: 6px;">
                <button class="btn-action btn-secondary" id="btn-audit" onclick="runSecurityAudit(false)" style="font-size: 12px; padding: 5px 12px;">Run Audit</button>
                <button class="btn-action btn-secondary" id="btn-audit-deep" onclick="runSecurityAudit(true)" style="font-size: 12px; padding: 5px 12px;">Deep Audit</button>
              </div>
            </div>
            <div id="security-audit-results" class="hidden"></div>
          </div>

          <!-- Settings & Help Card -->
          <div class="card">
            <h2>Settings &amp; Help</h2>
            <div class="settings-links">
              <a href="/onboard?password=${encodeURIComponent(password)}" class="settings-link-item">
                <span class="settings-link-icon">&#x2699;&#xFE0F;</span>
                <div class="settings-link-text">
                  <h4>Setup Wizard</h4>
                  <p>Reconfigure providers, channels, and skills</p>
                </div>
              </a>
              <a href="#" class="settings-link-item" onclick="event.preventDefault(); setMode('advanced');">
                <span class="settings-link-icon">&#x1F4BB;</span>
                <div class="settings-link-text">
                  <h4>Advanced Terminal</h4>
                  <p>Full CLI access and command palette</p>
                </div>
              </a>
              <a href="https://docs.openclaw.ai" target="_blank" rel="noopener" class="settings-link-item">
                <span class="settings-link-icon">&#x1F4D6;</span>
                <div class="settings-link-text">
                  <h4>Documentation</h4>
                  <p>Guides, API reference, and tutorials</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Quick Actions -->
          <div class="card">
            <h2>Quick Actions</h2>
            <div class="quick-actions">
              <button id="btn-toggle-agent" class="btn-action ${gatewayInfo.running ? 'btn-danger' : 'btn-success'}" onclick="toggleGateway()">
                ${gatewayInfo.running ? 'Stop Gateway' : 'Start Gateway'}
              </button>
              <button id="btn-restart" class="btn-action btn-primary" onclick="gatewayRestart()" ${gatewayInfo.running ? '' : 'disabled'}>
                Restart Gateway
              </button>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="card">
            <h2>Maintenance</h2>
            <div id="version-info" class="maintenance-version">
              <span>Version: <span class="version-current" id="version-current">...</span></span>
              <span class="version-update" id="version-update" style="display:none"></span>
            </div>
            <div class="maintenance-actions">
              <button class="maintenance-btn btn-secondary" onclick="downloadBackup()">Download Backup</button>
              <input type="file" id="restore-file" class="maintenance-upload" accept=".tar.gz,.tgz,.gz,.zip,application/gzip,application/x-gzip,application/zip" onchange="handleRestoreFile(this)"/>
              <button class="maintenance-btn btn-secondary" id="btn-restore" onclick="document.getElementById('restore-file').click()">Restore from Backup</button>
              <button class="maintenance-btn btn-primary" id="btn-upgrade" onclick="confirmUpgrade()" style="display:none">Upgrade Available</button>
            </div>
            <div class="maintenance-status" id="maintenance-status"></div>
          </div>

          <!-- Gateway Token -->
          <div class="card">
            <h2>Gateway Token</h2>
            <div class="token-description">Use this token to connect clients to your agent.</div>
            <div class="token-box">
              <span id="token-display" class="token-masked">${maskToken(gatewayToken)}</span>
              <input type="hidden" id="token-full" value="${gatewayToken}"/>
            </div>
            <div class="token-actions">
              <button class="token-btn" id="btn-token-toggle" onclick="toggleTokenVisibility()">Show</button>
              <button class="token-btn" onclick="copyToken()">Copy</button>
            </div>
          </div>

          <!-- System Info -->
          <div class="card">
            <h2>System Info</h2>
            <div class="system-info-list">
              <div class="system-info-item">
                <span class="label">Status</span>
                <div class="system-info-status">
                  <span class="dot ${gatewayInfo.running ? 'running' : 'stopped'}" id="sysinfo-dot"></span>
                  <span class="value" id="sysinfo-status">${gatewayInfo.running ? 'Running' : 'Stopped'}</span>
                </div>
              </div>
              <div class="system-info-item">
                <span class="label">State directory</span>
                <span class="value">${stateDir}</span>
              </div>
              <div class="system-info-item">
                <span class="label">Internal port</span>
                <span class="value">${gatewayInfo.port}</span>
              </div>
              <div class="system-info-item">
                <span class="label">PID</span>
                <span class="value" id="sysinfo-pid">${gatewayInfo.pid || '--'}</span>
              </div>
            </div>
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

      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 15px 20px; border-bottom: 1px solid var(--border);">
          <h2 style="margin-bottom: 12px;">Command Palette</h2>
          <input type="text" id="cmd-search" class="form-input" placeholder="Search commands..."
                 oninput="filterCommands()" style="margin-bottom: 10px;" />
          <div class="cmd-categories" id="cmd-categories"></div>
        </div>
        <div class="cmd-list" id="cmd-list" style="max-height: 350px; overflow-y: auto; padding: 10px 20px;"></div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast-msg"></div>

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
      var statusPollTimer = null;
      var logsPollTimer = null;
      var statsPollTimer = null;
      var usagePollTimer = null;
      var cachedStatus = null;
      var tokenVisible = false;
      var rawLogsOpen = false;
      var memorySearchDebounce = null;
      var activityItems = [];

      // Channel icons embedded from server
      var CHANNEL_ICONS = ${channelIconsJSON};

      // Provider icons embedded from server
      var PROVIDER_ICONS = ${providerIconsJSON};

      // Activity patterns for parsing log entries
      var ACTIVITY_PATTERNS = [
        { regex: /gateway.*started|listening on/i, icon: '\\u{1F7E2}', label: 'Gateway started' },
        { regex: /gateway.*stopped|shutdown/i, icon: '\\u{1F534}', label: 'Gateway stopped' },
        { regex: /message.*received|incoming.*message|msg.*from/i, icon: '\\u{1F4E8}', label: 'Message received' },
        { regex: /message.*sent|reply.*sent|response.*sent/i, icon: '\\u{1F4E4}', label: 'Message sent' },
        { regex: /connected.*to|channel.*connected|joined/i, icon: '\\u{1F517}', label: 'Channel connected' },
        { regex: /disconnected|channel.*disconnected|left/i, icon: '\\u{26D4}', label: 'Channel disconnected' },
        { regex: /error|failed|exception|crash/i, icon: '\\u{26A0}\\u{FE0F}', label: 'Error detected' },
        { regex: /pairing|pair.*approved|device.*linked/i, icon: '\\u{1F4F1}', label: 'Device paired' },
        { regex: /skill.*loaded|plugin.*loaded/i, icon: '\\u{26A1}', label: 'Skill loaded' },
        { regex: /session.*created|new.*session/i, icon: '\\u{1F4AC}', label: 'Session created' },
        { regex: /cron|scheduled|job.*ran/i, icon: '\\u{23F0}', label: 'Scheduled task ran' },
        { regex: /memory.*indexed|memory.*updated/i, icon: '\\u{1F9E0}', label: 'Memory updated' }
      ];

      // ----- Helpers -----
      function authParam() {
        return 'password=' + encodeURIComponent(password);
      }

      function formatUptime(seconds) {
        if (seconds == null) return '--';
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

      function stripProvider(model) {
        if (!model) return '--';
        var slashIdx = model.indexOf('/');
        return slashIdx >= 0 ? model.substring(slashIdx + 1) : model;
      }

      function showToast(message, type) {
        var el = document.getElementById('toast-msg');
        el.textContent = message;
        el.className = 'toast ' + (type || 'success');
        el.classList.add('show');
        setTimeout(function() { el.classList.remove('show'); }, 3000);
      }

      // Helper: create SVG element from path data (safe DOM construction, no innerHTML)
      function createChannelSVG(svgPath, color) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', color || '#6B7280');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', svgPath);
        svg.appendChild(path);
        return svg;
      }

      function createFallbackSVG() {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', '#6B7280');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        var circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        svg.appendChild(circle);
        return svg;
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
          requestAnimationFrame(function() {
            if (fitAddon) {
              fitAddon.fit();
              updateTermSize();
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
              }
            }
          });
        }
      };

      // ----- Status Hero update -----
      function updateHero(data) {
        var hero = document.getElementById('status-hero');
        var dot = document.getElementById('hero-dot');
        var text = document.getElementById('hero-status-text');
        var uptimeEl = document.getElementById('hero-uptime');

        if (data.gatewayRunning) {
          hero.classList.remove('stopped');
          dot.className = 'status-dot running';
          text.textContent = 'Gateway Running';
        } else {
          hero.classList.add('stopped');
          dot.className = 'status-dot stopped';
          text.textContent = 'Gateway Stopped';
        }

        uptimeEl.textContent = formatUptime(data.uptime);
      }

      // ----- Quick Stats update -----
      function updateQuickStats(channels, stats) {
        var channelCount = channels ? Object.keys(channels).length : 0;
        document.getElementById('stat-channels').textContent = channelCount;
        if (stats) {
          document.getElementById('stat-skills').textContent = stats.skills != null ? stats.skills : '--';
        }
      }

      // ----- Token Usage -----
      function formatTokenCount(n) {
        if (n == null) return '--';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n);
      }

      function estimateCost(tokens) {
        return (tokens / 1000000 * 3.50).toFixed(2);
      }

      function formatDateShort(dateStr) {
        var d = new Date(dateStr + 'T00:00:00');
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return d.getDate() + ' ' + months[d.getMonth()];
      }

      window.setUsageView = function(view) {
        var totalTab = document.getElementById('usage-tab-total');
        var bytypeTab = document.getElementById('usage-tab-bytype');
        var totalView = document.getElementById('usage-total-view');
        var bytypeView = document.getElementById('usage-bytype-view');

        if (view === 'total') {
          totalTab.classList.add('active');
          bytypeTab.classList.remove('active');
          totalView.style.display = '';
          bytypeView.classList.remove('active');
        } else {
          totalTab.classList.remove('active');
          bytypeTab.classList.add('active');
          totalView.style.display = 'none';
          bytypeView.classList.add('active');
        }
      };

      function renderUsageChart(days) {
        var container = document.getElementById('usage-chart');
        container.textContent = '';

        if (!days || days.length === 0) {
          var notice = document.createElement('div');
          notice.className = 'section-notice';
          notice.style.width = '100%';
          notice.textContent = 'No usage data available';
          container.appendChild(notice);
          return;
        }

        var maxTotal = 0;
        days.forEach(function(d) { if (d.total > maxTotal) maxTotal = d.total; });
        if (maxTotal === 0) maxTotal = 1;

        days.forEach(function(d) {
          var group = document.createElement('div');
          group.className = 'usage-bar-group';

          var valueLabel = document.createElement('div');
          valueLabel.className = 'usage-bar-value';
          valueLabel.textContent = formatTokenCount(d.total);
          group.appendChild(valueLabel);

          var track = document.createElement('div');
          track.className = 'usage-bar-track';

          var bar = document.createElement('div');
          bar.className = 'usage-bar';
          var pct = Math.max(3, (d.total / maxTotal) * 100);
          bar.style.height = pct + '%';

          // Tooltip
          var tooltip = document.createElement('div');
          tooltip.className = 'usage-tooltip';

          var dateRow = document.createElement('div');
          dateRow.className = 'usage-tooltip-row';
          var dateLabel = document.createElement('span');
          dateLabel.className = 'usage-tooltip-label';
          dateLabel.textContent = 'Date';
          dateRow.appendChild(dateLabel);
          var dateValue = document.createElement('span');
          dateValue.className = 'usage-tooltip-value';
          dateValue.textContent = formatDateShort(d.date);
          dateRow.appendChild(dateValue);
          tooltip.appendChild(dateRow);

          var totalRow = document.createElement('div');
          totalRow.className = 'usage-tooltip-row';
          var totalLabel = document.createElement('span');
          totalLabel.className = 'usage-tooltip-label';
          totalLabel.textContent = 'Tokens';
          totalRow.appendChild(totalLabel);
          var totalValue = document.createElement('span');
          totalValue.className = 'usage-tooltip-value';
          totalValue.textContent = formatTokenCount(d.total);
          totalRow.appendChild(totalValue);
          tooltip.appendChild(totalRow);

          var costRow = document.createElement('div');
          costRow.className = 'usage-tooltip-row';
          var costLabel = document.createElement('span');
          costLabel.className = 'usage-tooltip-label';
          costLabel.textContent = 'Est. cost';
          costRow.appendChild(costLabel);
          var costValue = document.createElement('span');
          costValue.className = 'usage-tooltip-value';
          costValue.textContent = '$' + (d.cost != null && d.cost > 0 ? d.cost.toFixed(2) : estimateCost(d.total));
          costRow.appendChild(costValue);
          tooltip.appendChild(costRow);

          bar.appendChild(tooltip);
          track.appendChild(bar);
          group.appendChild(track);

          var dateLabel2 = document.createElement('div');
          dateLabel2.className = 'usage-bar-label';
          dateLabel2.textContent = formatDateShort(d.date);
          group.appendChild(dateLabel2);

          container.appendChild(group);
        });
      }

      function renderUsageByType(days, serverTotals) {
        var stackedEl = document.getElementById('usage-stacked');
        var legendEl = document.getElementById('usage-legend');
        var grandTotalEl = document.getElementById('usage-grand-total');
        stackedEl.textContent = '';
        legendEl.textContent = '';

        if (!days || days.length === 0) {
          grandTotalEl.textContent = '--';
          return;
        }

        var totals = { output: 0, input: 0, cacheWrite: 0, cacheRead: 0 };
        days.forEach(function(d) {
          totals.output += d.output || 0;
          totals.input += d.input || 0;
          totals.cacheWrite += d.cacheWrite || 0;
          totals.cacheRead += d.cacheRead || 0;
        });
        var grandTotal = totals.output + totals.input + totals.cacheWrite + totals.cacheRead;
        var costStr = '';
        if (serverTotals && serverTotals.totalCost != null && serverTotals.totalCost > 0) {
          costStr = ' ($' + serverTotals.totalCost.toFixed(2) + ')';
        }
        grandTotalEl.textContent = formatTokenCount(grandTotal) + costStr;

        var types = [
          { key: 'output', label: 'Output', color: 'var(--accent)' },
          { key: 'input', label: 'Input', color: 'var(--warn)' },
          { key: 'cacheWrite', label: 'Cache Write', color: 'var(--teal)' },
          { key: 'cacheRead', label: 'Cache Read', color: '#38bdf8' }
        ];

        types.forEach(function(t) {
          var pct = grandTotal > 0 ? (totals[t.key] / grandTotal * 100) : 0;
          var seg = document.createElement('div');
          seg.className = 'usage-stacked-segment';
          seg.style.width = pct + '%';
          seg.style.background = t.color;
          seg.title = t.label + ': ' + formatTokenCount(totals[t.key]);
          stackedEl.appendChild(seg);

          var legendItem = document.createElement('div');
          legendItem.className = 'usage-legend-item';
          var dot = document.createElement('span');
          dot.className = 'usage-legend-dot';
          dot.style.background = t.color;
          legendItem.appendChild(dot);
          legendItem.appendChild(document.createTextNode(t.label + ' '));
          var count = document.createElement('span');
          count.className = 'usage-legend-count';
          count.textContent = formatTokenCount(totals[t.key]);
          legendItem.appendChild(count);
          legendEl.appendChild(legendItem);
        });
      }

      function pollUsage() {
        fetch('/lite/api/usage?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.available && data.days) {
              renderUsageChart(data.days);
              renderUsageByType(data.days, data.totals);
            } else {
              var container = document.getElementById('usage-chart');
              container.textContent = '';
              var notice = document.createElement('div');
              notice.className = 'section-notice';
              notice.style.width = '100%';
              notice.textContent = 'Usage data not available';
              container.appendChild(notice);
            }
          })
          .catch(function() {});
      }

      // ----- Integrations update -----
      function updateIntegrations(channels) {
        var container = document.getElementById('integrations-grid');
        container.textContent = '';

        if (!channels || Object.keys(channels).length === 0) {
          var empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.style.gridColumn = '1 / -1';

          var iconDiv = document.createElement('div');
          iconDiv.className = 'empty-state-icon';
          iconDiv.textContent = '\\u{1F4E1}';
          empty.appendChild(iconDiv);

          var textDiv = document.createElement('div');
          textDiv.className = 'empty-state-text';
          textDiv.textContent = 'No channels connected yet';
          empty.appendChild(textDiv);

          var link = document.createElement('a');
          link.href = '/onboard?password=' + encodeURIComponent(password);
          link.textContent = 'Set up in the onboarding wizard';
          empty.appendChild(link);

          container.appendChild(empty);
          return;
        }

        Object.keys(channels).forEach(function(name) {
          var ch = channels[name];
          var enabled = ch.enabled === true;
          var iconData = CHANNEL_ICONS[name];
          var displayName = iconData ? iconData.displayName : (name.charAt(0).toUpperCase() + name.slice(1));

          var item = document.createElement('div');
          item.className = 'integration-item';

          var iconWrap = document.createElement('div');
          iconWrap.className = 'integration-icon';
          if (iconData && iconData.svg) {
            iconWrap.appendChild(createChannelSVG(iconData.svg, iconData.color));
          } else {
            iconWrap.appendChild(createFallbackSVG());
          }
          item.appendChild(iconWrap);

          var nameSpan = document.createElement('span');
          nameSpan.className = 'integration-name';
          nameSpan.textContent = displayName;
          item.appendChild(nameSpan);

          var statusDot = document.createElement('span');
          statusDot.className = 'integration-status ' + (enabled ? 'connected' : 'inactive');
          item.appendChild(statusDot);

          // Popover
          var popover = document.createElement('div');
          popover.className = 'integration-popover';
          var pTitle = document.createElement('div');
          pTitle.className = 'popover-title';
          pTitle.textContent = displayName;
          popover.appendChild(pTitle);
          if (iconData && iconData.description) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = iconData.description;
            popover.appendChild(pDesc);
          }
          var configRow = document.createElement('div');
          configRow.className = 'popover-row';
          var configLabel = document.createElement('span');
          configLabel.className = 'popover-label';
          configLabel.textContent = 'Configured';
          configRow.appendChild(configLabel);
          var configBadge = document.createElement('span');
          configBadge.className = 'popover-badge connected';
          configBadge.textContent = 'Yes';
          configRow.appendChild(configBadge);
          popover.appendChild(configRow);

          var connRow = document.createElement('div');
          connRow.className = 'popover-row';
          var connLabel = document.createElement('span');
          connLabel.className = 'popover-label';
          connLabel.textContent = 'Connected';
          connRow.appendChild(connLabel);
          var connBadge = document.createElement('span');
          connBadge.className = 'popover-badge ' + (enabled ? 'connected' : 'inactive');
          connBadge.textContent = enabled ? 'Yes' : 'No';
          connRow.appendChild(connBadge);
          popover.appendChild(connRow);

          item.appendChild(popover);

          container.appendChild(item);
        });
      }

      // ----- Model Providers update -----
      function updateProviders(auth, model) {
        var container = document.getElementById('providers-grid');
        container.textContent = '';

        var connectedSet = new Set();
        var activeProvider = '';
        var modelName = '';

        // 1. Model prefix -> active provider
        if (model && typeof model === 'string' && model.indexOf('/') >= 0) {
          activeProvider = model.split('/')[0].toLowerCase();
          modelName = model.split('/').slice(1).join('/');
          connectedSet.add(activeProvider);
        }

        // 2. Auth config -> connected providers (dig into profiles/nested objects)
        if (auth && typeof auth === 'object') {
          // Direct keys (may be provider names)
          Object.keys(auth).forEach(function(key) {
            if (key !== 'profiles' && key !== 'default') {
              connectedSet.add(key.toLowerCase());
            }
          });
          // Nested profiles (each has a .provider field)
          if (auth.profiles && typeof auth.profiles === 'object') {
            Object.values(auth.profiles).forEach(function(profile) {
              if (profile && profile.provider) {
                connectedSet.add(profile.provider.toLowerCase());
              }
            });
          }
        }

        var providers = Object.keys(PROVIDER_ICONS);
        if (providers.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.style.gridColumn = '1 / -1';
          var textDiv = document.createElement('div');
          textDiv.className = 'empty-state-text';
          textDiv.textContent = 'No provider data available';
          empty.appendChild(textDiv);
          container.appendChild(empty);
          return;
        }

        function isConnected(providerName) {
          var lower = providerName.toLowerCase();
          var found = false;
          connectedSet.forEach(function(key) {
            if (lower.indexOf(key) >= 0 || key.indexOf(lower.split(' ')[0].toLowerCase()) >= 0) {
              found = true;
            }
          });
          return found;
        }

        function isActiveProvider(providerName) {
          if (!activeProvider) return false;
          var lower = providerName.toLowerCase();
          return lower.indexOf(activeProvider) >= 0 || activeProvider.indexOf(lower.split(' ')[0].toLowerCase()) >= 0;
        }

        var hasItems = false;
        providers.forEach(function(name) {
          var info = PROVIDER_ICONS[name];
          var connected = isConnected(name);
          var isActive = isActiveProvider(name);
          // Only show connected or active providers
          if (!connected && !isActive) return;
          hasItems = true;

          var item = document.createElement('div');
          item.className = 'integration-item';

          var iconWrap = document.createElement('div');
          iconWrap.className = 'integration-icon';
          if (info.svg) {
            iconWrap.appendChild(createChannelSVG(info.svg, info.color));
          } else {
            iconWrap.appendChild(createFallbackSVG());
          }
          item.appendChild(iconWrap);

          var nameWrap = document.createElement('div');
          nameWrap.className = 'integration-name-wrap';
          var nameSpan = document.createElement('span');
          nameSpan.className = 'integration-name';
          nameSpan.textContent = name;
          nameWrap.appendChild(nameSpan);

          // Show model name for active provider
          if (isActive && modelName) {
            var modelSpan = document.createElement('span');
            modelSpan.className = 'integration-model';
            modelSpan.textContent = modelName;
            nameWrap.appendChild(modelSpan);
          }
          item.appendChild(nameWrap);

          var statusDot = document.createElement('span');
          statusDot.className = 'integration-status ' + (isActive ? 'active-model' : connected ? 'connected' : 'inactive');
          item.appendChild(statusDot);

          // Popover
          var popover = document.createElement('div');
          popover.className = 'integration-popover';
          var pTitle = document.createElement('div');
          pTitle.className = 'popover-title';
          pTitle.textContent = name;
          popover.appendChild(pTitle);
          if (isActive && modelName) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = modelName;
            popover.appendChild(pDesc);
          } else if (info.description) {
            var pDesc = document.createElement('div');
            pDesc.className = 'popover-desc';
            pDesc.textContent = info.description;
            popover.appendChild(pDesc);
          }
          var statusRow = document.createElement('div');
          statusRow.className = 'popover-row';
          var statusLabel = document.createElement('span');
          statusLabel.className = 'popover-label';
          statusLabel.textContent = 'Status';
          statusRow.appendChild(statusLabel);
          var badge = document.createElement('span');
          badge.className = 'popover-badge ' + (isActive ? 'active' : connected ? 'connected' : 'inactive');
          badge.textContent = isActive ? 'Active' : connected ? 'Connected' : 'Not connected';
          statusRow.appendChild(badge);
          popover.appendChild(statusRow);
          if (isActive && modelName) {
            var modelRow = document.createElement('div');
            modelRow.className = 'popover-row';
            var modelLabel = document.createElement('span');
            modelLabel.className = 'popover-label';
            modelLabel.textContent = 'Model';
            modelRow.appendChild(modelLabel);
            var modelValue = document.createElement('span');
            modelValue.className = 'popover-value';
            modelValue.textContent = modelName;
            modelRow.appendChild(modelValue);
            popover.appendChild(modelRow);
          }
          item.appendChild(popover);

          container.appendChild(item);
        });

        if (!hasItems) {
          var emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-state';
          emptyDiv.style.gridColumn = '1 / -1';
          var emptyText = document.createElement('div');
          emptyText.className = 'empty-state-text';
          emptyText.textContent = 'No providers configured';
          emptyDiv.appendChild(emptyText);
          container.appendChild(emptyDiv);
        }
      }

      // ----- Quick Actions update -----
      function updateQuickActions(running) {
        var toggleBtn = document.getElementById('btn-toggle-agent');
        var restartBtn = document.getElementById('btn-restart');

        if (running) {
          toggleBtn.textContent = 'Stop Gateway';
          toggleBtn.className = 'btn-action btn-danger';
        } else {
          toggleBtn.textContent = 'Start Gateway';
          toggleBtn.className = 'btn-action btn-success';
        }
        restartBtn.disabled = !running;
      }

      // ----- System Info update -----
      function updateSystemInfo(data) {
        var dot = document.getElementById('sysinfo-dot');
        var statusEl = document.getElementById('sysinfo-status');
        var pidEl = document.getElementById('sysinfo-pid');

        dot.className = 'dot ' + (data.gatewayRunning ? 'running' : 'stopped');
        statusEl.textContent = data.gatewayRunning ? 'Running' : 'Stopped';
        pidEl.textContent = data.gatewayInfo ? (data.gatewayInfo.pid || '--') : '--';
      }

      // ----- Activity Feed -----
      function parseLogToActivity(entry) {
        var text = entry.text || '';
        for (var i = 0; i < ACTIVITY_PATTERNS.length; i++) {
          var p = ACTIVITY_PATTERNS[i];
          if (p.regex.test(text)) {
            return { ts: entry.timestamp, icon: p.icon, text: p.label, isError: /error|failed/i.test(text) };
          }
        }
        return null;
      }

      function appendActivityItems(entries) {
        var feed = document.getElementById('activity-feed');
        entries.forEach(function(entry) {
          var parsed = parseLogToActivity(entry);
          if (!parsed) return;

          activityItems.push(parsed);
          if (activityItems.length > 50) {
            activityItems.shift();
            if (feed.firstChild) feed.removeChild(feed.firstChild);
          }

          var item = document.createElement('div');
          item.className = 'activity-item';

          var ts = document.createElement('span');
          ts.className = 'activity-ts';
          ts.textContent = formatTime(parsed.ts);
          item.appendChild(ts);

          var icon = document.createElement('span');
          icon.className = 'activity-icon';
          icon.textContent = parsed.icon;
          item.appendChild(icon);

          var text = document.createElement('span');
          text.className = 'activity-text' + (parsed.isError ? ' error' : '');
          text.textContent = parsed.text;
          item.appendChild(text);

          feed.appendChild(item);
        });

        if (document.getElementById('auto-scroll').checked) {
          feed.scrollTop = feed.scrollHeight;
        }
      }

      function appendRawLogs(entries) {
        var container = document.getElementById('log-output');
        entries.forEach(function(entry) {
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

        if (rawLogsOpen && document.getElementById('auto-scroll').checked) {
          container.scrollTop = container.scrollHeight;
        }
      }

      window.toggleRawLogs = function() {
        rawLogsOpen = !rawLogsOpen;
        document.getElementById('raw-logs-section').classList.toggle('hidden', !rawLogsOpen);
        document.getElementById('log-toggle-arrow').classList.toggle('open', rawLogsOpen);
      };

      window.clearActivity = function() {
        document.getElementById('activity-feed').textContent = '';
        activityItems = [];
      };

      window.clearLogs = function() {
        document.getElementById('log-output').textContent = '';
      };

      // ----- Memory -----
      function loadMemory() {
        fetch('/lite/api/memory?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var container = document.getElementById('memory-content');
            container.textContent = '';

            if (!data.available) {
              var notice = document.createElement('div');
              notice.className = 'section-notice';
              notice.textContent = 'Memory features not available';
              container.appendChild(notice);
              return;
            }

            // Stats row
            var stats = document.createElement('div');
            stats.className = 'memory-stats';

            var statItems = [
              { label: 'Status', value: data.status || 'Active' },
              { label: 'Entries', value: data.entries != null ? String(data.entries) : '--' },
              { label: 'Backend', value: data.backend || '--' }
            ];
            statItems.forEach(function(s) {
              var stat = document.createElement('div');
              stat.className = 'memory-stat';

              var labelDiv = document.createElement('div');
              labelDiv.className = 'memory-stat-label';
              labelDiv.textContent = s.label;
              stat.appendChild(labelDiv);

              var valueDiv = document.createElement('div');
              valueDiv.className = 'memory-stat-value';
              valueDiv.textContent = s.value;
              stat.appendChild(valueDiv);

              stats.appendChild(stat);
            });
            container.appendChild(stats);

            // Search input
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'memory-search-input';
            searchInput.placeholder = 'Search memory...';

            // Results container
            var resultsDiv = document.createElement('div');
            resultsDiv.className = 'memory-results';

            searchInput.addEventListener('input', function() {
              clearTimeout(memorySearchDebounce);
              var q = searchInput.value.trim();
              if (q.length < 2) {
                resultsDiv.textContent = '';
                return;
              }
              memorySearchDebounce = setTimeout(function() {
                searchMemory(q, resultsDiv);
              }, 500);
            });
            container.appendChild(searchInput);
            container.appendChild(resultsDiv);
          })
          .catch(function() {
            var container = document.getElementById('memory-content');
            container.textContent = '';
            var notice = document.createElement('div');
            notice.className = 'section-notice';
            notice.textContent = 'Memory features not available';
            container.appendChild(notice);
          });
      }

      function searchMemory(query, resultsDiv) {
        resultsDiv.textContent = '';
        var loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'color: var(--muted); font-size: 12px;';
        loadingMsg.textContent = 'Searching...';
        resultsDiv.appendChild(loadingMsg);

        fetch('/lite/api/memory/search?q=' + encodeURIComponent(query) + '&' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            resultsDiv.textContent = '';
            if (!data.results || data.results.length === 0) {
              var noResults = document.createElement('div');
              noResults.style.cssText = 'color: var(--muted); font-size: 12px; padding: 10px 0;';
              noResults.textContent = 'No results found';
              resultsDiv.appendChild(noResults);
              return;
            }
            data.results.forEach(function(r) {
              var item = document.createElement('div');
              item.className = 'memory-result-item';
              item.textContent = r.text || r.content || JSON.stringify(r);
              resultsDiv.appendChild(item);
            });
          })
          .catch(function() {
            resultsDiv.textContent = '';
            var errMsg = document.createElement('div');
            errMsg.style.cssText = 'color: var(--muted); font-size: 12px;';
            errMsg.textContent = 'Search failed';
            resultsDiv.appendChild(errMsg);
          });
      }

      // ----- Token -----
      window.toggleTokenVisibility = function() {
        tokenVisible = !tokenVisible;
        var display = document.getElementById('token-display');
        var full = document.getElementById('token-full').value;
        var btn = document.getElementById('btn-token-toggle');

        if (tokenVisible) {
          display.textContent = full;
          btn.textContent = 'Hide';
        } else {
          display.textContent = maskTokenJS(full);
          btn.textContent = 'Show';
        }
      };

      function maskTokenJS(token) {
        if (!token || token.length < 8) return token || '--';
        return token.substring(0, 4) + '...' + token.substring(token.length - 4);
      }

      window.copyToken = function() {
        var token = document.getElementById('token-full').value;
        navigator.clipboard.writeText(token).then(function() {
          showToast('Token copied to clipboard', 'success');
        });
      };

      // ----- Status polling -----
      window.pollStatus = function() {
        fetch('/lite/api/status?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            cachedStatus = data;
            updateHero(data);
            updateProviders(data.auth, data.model);
            updateIntegrations(data.channels);
            updateQuickActions(data.gatewayRunning);
            updateSystemInfo(data);

            var channelCount = data.channels ? Object.keys(data.channels).length : 0;
            document.getElementById('stat-channels').textContent = channelCount;
          })
          .catch(function() {});
      };

      function pollStats() {
        fetch('/lite/api/stats?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            document.getElementById('stat-skills').textContent = data.skills != null ? data.skills : '--';
            document.getElementById('stat-sessions').textContent = data.sessions != null ? data.sessions : '--';
          })
          .catch(function() {});
      }

      function pollLogs() {
        fetch('/lite/api/logs?' + authParam() + '&since=' + lastLogId)
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.entries && data.entries.length > 0) {
              appendActivityItems(data.entries);
              appendRawLogs(data.entries);
              lastLogId = data.lastId;
            }
          })
          .catch(function() {});
      }

      function startPolling() {
        stopPolling();
        pollStatus();
        pollLogs();
        pollStats();
        pollUsage();
        loadMemory();
        checkVersion();
        statusPollTimer = setInterval(pollStatus, 5000);
        logsPollTimer = setInterval(pollLogs, 2000);
        statsPollTimer = setInterval(pollStats, 30000);
        usagePollTimer = setInterval(pollUsage, 60000);
      }

      function stopPolling() {
        if (statusPollTimer) { clearInterval(statusPollTimer); statusPollTimer = null; }
        if (logsPollTimer) { clearInterval(logsPollTimer); logsPollTimer = null; }
        if (statsPollTimer) { clearInterval(statsPollTimer); statsPollTimer = null; }
        if (usagePollTimer) { clearInterval(usagePollTimer); usagePollTimer = null; }
      }

      // ----- Gateway controls -----
      window.toggleGateway = function() {
        var running = cachedStatus && cachedStatus.gatewayRunning;
        var action = running ? 'stop' : 'start';
        var btn = document.getElementById('btn-toggle-agent');
        btn.disabled = true;
        btn.textContent = 'Working...';

        fetch('/lite/api/gateway/' + action + '?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (!data.success && data.error) {
              showToast('Error: ' + data.error, 'error');
            }
            setTimeout(pollStatus, 500);
          })
          .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
          })
          .finally(function() {
            btn.disabled = false;
          });
      };

      window.gatewayRestart = function() {
        var btn = document.getElementById('btn-restart');
        btn.disabled = true;
        btn.textContent = 'Working...';

        fetch('/lite/api/gateway/restart?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (!data.success && data.error) {
              showToast('Error: ' + data.error, 'error');
            }
            setTimeout(pollStatus, 1000);
          })
          .catch(function(err) {
            showToast('Error: ' + err.message, 'error');
          })
          .finally(function() {
            btn.textContent = 'Restart Gateway';
            btn.disabled = false;
          });
      };

      // ----- Maintenance -----
      function checkVersion() {
        fetch('/lite/api/version?' + authParam())
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var currentEl = document.getElementById('version-current');
            var updateEl = document.getElementById('version-update');
            var upgradeBtn = document.getElementById('btn-upgrade');

            currentEl.textContent = data.current || 'unknown';

            if (data.upgradeAvailable && data.upgradeMethod === 'npm') {
              updateEl.textContent = data.latest + ' available';
              updateEl.style.display = '';
              upgradeBtn.style.display = '';
              upgradeBtn.textContent = 'Upgrade to ' + data.latest;
            } else if (data.upgradeMethod === 'redeploy') {
              updateEl.textContent = 'redeploy to update';
              updateEl.style.display = '';
              upgradeBtn.style.display = 'none';
            } else {
              updateEl.style.display = 'none';
              upgradeBtn.style.display = 'none';
            }
          })
          .catch(function() {
            document.getElementById('version-current').textContent = '?';
          });
      }

      window.downloadBackup = function() {
        window.location.href = '/onboard/export?' + authParam();
      };

      window.handleRestoreFile = function(input) {
        var file = input.files && input.files[0];
        if (!file) return;
        var name = file.name.toLowerCase();
        if (!name.endsWith('.tar.gz') && !name.endsWith('.tgz') && !name.endsWith('.zip')) {
          showToast('Please select a .tar.gz, .tgz, or .zip file', 'error');
          input.value = '';
          return;
        }
        showConfirmDialog(
          'Restore from Backup',
          'This will replace your current configuration with the backup file "' + file.name + '". An auto-backup will be created first. The gateway will be restarted.',
          function() { performRestore(file); }
        );
        input.value = '';
      };

      function performRestore(file) {
        var btn = document.getElementById('btn-restore');
        var statusEl = document.getElementById('maintenance-status');
        btn.disabled = true;
        btn.textContent = 'Restoring...';
        statusEl.className = 'maintenance-status visible';
        statusEl.textContent = '';

        var reader = new FileReader();
        reader.onload = function() {
          fetch('/lite/api/restore?' + authParam(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': file.name },
            body: reader.result
          })
            .then(function(res) { return res.json(); })
            .then(function(data) {
              statusEl.textContent = '';
              (data.steps || []).forEach(function(step) {
                var span = document.createElement('span');
                span.className = 'step ' + (data.success ? 'ok' : 'err');
                span.textContent = step;
                statusEl.appendChild(span);
              });
              if (data.success) {
                showToast('Restore completed successfully', 'success');
                setTimeout(pollStatus, 1000);
              } else {
                showToast('Restore failed: ' + (data.error || 'unknown'), 'error');
              }
            })
            .catch(function(err) {
              showToast('Restore error: ' + err.message, 'error');
            })
            .finally(function() {
              btn.disabled = false;
              btn.textContent = 'Restore from Backup';
            });
        };
        reader.readAsArrayBuffer(file);
      }

      window.confirmUpgrade = function() {
        showConfirmDialog(
          'Upgrade OpenClaw',
          'This will install the latest version of OpenClaw via npm. An auto-backup will be created first. The gateway will be restarted.',
          function() { performUpgrade(); }
        );
      };

      function performUpgrade() {
        var btn = document.getElementById('btn-upgrade');
        var statusEl = document.getElementById('maintenance-status');
        btn.disabled = true;
        btn.textContent = 'Upgrading...';
        statusEl.className = 'maintenance-status visible';
        statusEl.textContent = '';

        fetch('/lite/api/upgrade?' + authParam(), { method: 'POST' })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            statusEl.textContent = '';
            (data.steps || []).forEach(function(step) {
              var span = document.createElement('span');
              span.className = 'step ' + (data.success ? 'ok' : 'err');
              span.textContent = step;
              statusEl.appendChild(span);
            });
            if (data.success) {
              showToast('Upgrade completed successfully', 'success');
              checkVersion();
              setTimeout(pollStatus, 1000);
            } else {
              showToast('Upgrade failed: ' + (data.error || 'unknown'), 'error');
            }
          })
          .catch(function(err) {
            showToast('Upgrade error: ' + err.message, 'error');
          })
          .finally(function() {
            btn.disabled = false;
            btn.textContent = 'Upgrade Available';
          });
      }

      function showConfirmDialog(title, message, onConfirm) {
        var overlay = document.createElement('div');
        overlay.className = 'maintenance-confirm-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'maintenance-confirm-dialog';

        var h3 = document.createElement('h3');
        h3.textContent = title;
        dialog.appendChild(h3);

        var p = document.createElement('p');
        p.textContent = message;
        dialog.appendChild(p);

        var buttons = document.createElement('div');
        buttons.className = 'dialog-buttons';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function() { document.body.removeChild(overlay); });
        buttons.appendChild(cancelBtn);

        var confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-primary';
        confirmBtn.textContent = 'Continue';
        confirmBtn.addEventListener('click', function() {
          document.body.removeChild(overlay);
          onConfirm();
        });
        buttons.appendChild(confirmBtn);

        dialog.appendChild(buttons);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
      }

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
        ws = new WebSocket(protocol + '//' + location.host + '/lite/ws?' + authParam());

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

      // ----- Command palette -----
      var COMMANDS = [
        { cmd: 'openclaw status', desc: 'Session health & recent recipients', cat: 'status', fav: true },
        { cmd: 'openclaw health', desc: 'Fetch health from running gateway', cat: 'status', fav: true },
        { cmd: 'openclaw channels list', desc: 'Show configured channels', cat: 'channels', fav: true },
        { cmd: 'openclaw logs --follow', desc: 'Tail gateway logs', cat: 'gateway', fav: true },
        { cmd: 'openclaw --version', desc: 'Print version', cat: 'info', fav: true },

        { cmd: 'openclaw gateway status', desc: 'Probe gateway RPC and show status', cat: 'gateway' },
        { cmd: 'openclaw gateway health', desc: 'Fetch gateway health', cat: 'gateway' },
        { cmd: 'openclaw logs', desc: 'Tail gateway file logs', cat: 'gateway' },

        { cmd: 'openclaw config get .', desc: 'Print full config', cat: 'config' },
        { cmd: 'openclaw doctor', desc: 'Run health checks and quick fixes', cat: 'config' },
        { cmd: 'openclaw doctor --deep', desc: 'Deep health check', cat: 'config' },

        { cmd: 'openclaw models list', desc: 'List available models', cat: 'models' },
        { cmd: 'openclaw models status', desc: 'Auth overview and status', cat: 'models' },
        { cmd: 'openclaw models scan', desc: 'Scan for available models', cat: 'models' },

        { cmd: 'openclaw channels status', desc: 'Check channel health', cat: 'channels' },
        { cmd: 'openclaw channels logs', desc: 'Show recent channel logs', cat: 'channels' },
        { cmd: 'openclaw pairing list', desc: 'List pairing requests', cat: 'channels' },

        { cmd: 'openclaw skills list', desc: 'List available skills', cat: 'skills' },
        { cmd: 'openclaw skills check', desc: 'Summary of ready vs missing', cat: 'skills' },
        { cmd: 'openclaw plugins list', desc: 'Discover installed plugins', cat: 'skills' },
        { cmd: 'openclaw plugins doctor', desc: 'Report plugin load errors', cat: 'skills' },

        { cmd: 'openclaw memory status', desc: 'Show memory index stats', cat: 'memory' },
        { cmd: 'openclaw memory index', desc: 'Reindex memory files', cat: 'memory' },

        { cmd: 'openclaw cron list', desc: 'List scheduled jobs', cat: 'cron' },
        { cmd: 'openclaw cron status', desc: 'Show cron status', cat: 'cron' },

        { cmd: 'openclaw sessions', desc: 'List conversation sessions', cat: 'sessions' },
        { cmd: 'openclaw status --all', desc: 'Full status with all details', cat: 'status' },

        { cmd: 'openclaw agents list', desc: 'List configured agents', cat: 'agents' },

        { cmd: 'openclaw nodes status', desc: 'List nodes from gateway', cat: 'nodes' },
        { cmd: 'openclaw nodes list', desc: 'List all nodes', cat: 'nodes' },
        { cmd: 'openclaw nodes pending', desc: 'Show pending node approvals', cat: 'nodes' },
        { cmd: 'openclaw devices', desc: 'List paired devices', cat: 'nodes' },

        { cmd: 'openclaw security audit', desc: 'Audit config for common issues', cat: 'security' },
        { cmd: 'openclaw security audit --deep', desc: 'Live gateway probe audit', cat: 'security' },

        { cmd: 'openclaw browser status', desc: 'Show browser status', cat: 'browser' },
        { cmd: 'openclaw browser tabs', desc: 'List open browser tabs', cat: 'browser' },

        { cmd: 'openclaw hooks list', desc: 'List hooks', cat: 'system' },
        { cmd: 'openclaw sandbox list', desc: 'List sandboxes', cat: 'system' },
        { cmd: 'openclaw docs', desc: 'Search the live docs index', cat: 'system' },
        { cmd: 'openclaw help', desc: 'Show help', cat: 'info' },
      ];

      var activeCat = 'all';

      window.sendQuickCmd = function(cmd) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data: cmd }));
        } else {
          connectTerminal();
          setTimeout(function() {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'input', data: cmd }));
            }
          }, 1000);
        }
      };

      function getCategories() {
        var seen = {};
        COMMANDS.forEach(function(c) { seen[c.cat] = true; });
        return Object.keys(seen).sort();
      }

      function makeCmdItem(c) {
        var div = document.createElement('div');
        div.className = 'cmd-item';
        div.addEventListener('click', function() { sendQuickCmd(c.cmd + '\\n'); });
        var nameSpan = document.createElement('span');
        nameSpan.className = 'cmd-name';
        nameSpan.textContent = c.cmd;
        var descSpan = document.createElement('span');
        descSpan.className = 'cmd-desc';
        descSpan.textContent = c.desc;
        div.appendChild(nameSpan);
        div.appendChild(descSpan);
        return div;
      }

      function makeSectionLabel(text) {
        var div = document.createElement('div');
        div.className = 'cmd-section-label';
        div.textContent = text;
        return div;
      }

      function renderCategoryPills() {
        var el = document.getElementById('cmd-categories');
        if (!el) return;
        el.textContent = '';
        var cats = ['all'].concat(getCategories());
        cats.forEach(function(c) {
          var pill = document.createElement('span');
          pill.className = 'cmd-cat-pill' + (activeCat === c ? ' active' : '');
          pill.textContent = c;
          pill.addEventListener('click', function() { setCategory(c); });
          el.appendChild(pill);
        });
      }

      window.setCategory = function(cat) {
        activeCat = cat;
        renderCategoryPills();
        filterCommands();
      };

      window.filterCommands = function() {
        var searchEl = document.getElementById('cmd-search');
        var search = searchEl ? searchEl.value.toLowerCase() : '';
        var filtered = COMMANDS.filter(function(c) {
          var matchCat = activeCat === 'all' || c.cat === activeCat;
          var matchSearch = !search || c.cmd.toLowerCase().indexOf(search) !== -1 || c.desc.toLowerCase().indexOf(search) !== -1 || c.cat.toLowerCase().indexOf(search) !== -1;
          return matchCat && matchSearch;
        });

        var listEl = document.getElementById('cmd-list');
        if (!listEl) return;
        listEl.textContent = '';

        if (activeCat === 'all' && !search) {
          var favs = filtered.filter(function(c) { return c.fav; });
          if (favs.length) {
            listEl.appendChild(makeSectionLabel('favorites'));
            favs.forEach(function(c) { listEl.appendChild(makeCmdItem(c)); });
          }
        }

        var grouped = {};
        filtered.forEach(function(c) {
          if (!grouped[c.cat]) grouped[c.cat] = [];
          grouped[c.cat].push(c);
        });

        getCategories().forEach(function(cat) {
          if (!grouped[cat]) return;
          listEl.appendChild(makeSectionLabel(cat));
          grouped[cat].forEach(function(c) { listEl.appendChild(makeCmdItem(c)); });
        });

        if (!listEl.children.length) {
          var empty = document.createElement('div');
          empty.style.cssText = 'padding: 20px; text-align: center; color: var(--muted);';
          empty.textContent = 'No commands match your search.';
          listEl.appendChild(empty);
        }
      };

      // ----- Security Audit -----
      function runSecurityAudit(deep) {
        var btnBasic = document.getElementById('btn-audit');
        var btnDeep = document.getElementById('btn-audit-deep');
        var container = document.getElementById('security-audit-results');
        btnBasic.disabled = true;
        btnDeep.disabled = true;
        container.className = '';
        container.textContent = '';
        var loadNotice = document.createElement('div');
        loadNotice.className = 'section-notice';
        loadNotice.textContent = deep ? 'Running deep audit...' : 'Running audit...';
        container.appendChild(loadNotice);

        fetch('/lite/api/security-audit?' + authParam(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deep: deep })
        })
          .then(function(res) { return res.json(); })
          .then(function(data) { renderSecurityAudit(data, container); })
          .catch(function(err) {
            container.textContent = '';
            var errNotice = document.createElement('div');
            errNotice.className = 'section-notice';
            errNotice.textContent = 'Error: ' + err.message;
            container.appendChild(errNotice);
          })
          .finally(function() {
            btnBasic.disabled = false;
            btnDeep.disabled = false;
          });
      }
      window.runSecurityAudit = runSecurityAudit;

      function renderSecurityAudit(data, container) {
        container.textContent = '';

        if (!data || !data.available) {
          var notice = document.createElement('div');
          notice.className = 'section-notice';
          notice.textContent = data && data.error ? data.error : 'Audit not available';
          container.appendChild(notice);
          return;
        }

        if (data.findings && data.findings.length > 0) {
          var pass = 0, warn = 0, fail = 0;
          data.findings.forEach(function(f) {
            var s = f.severity || f.status || 'fail';
            if (s === 'pass') pass++;
            else if (s === 'warn' || s === 'warning') warn++;
            else fail++;
          });

          // Summary
          var summary = document.createElement('div');
          summary.className = 'audit-summary';
          function addSummaryItem(cls, count, label) {
            if (count === 0 && cls !== 'pass') return;
            var item = document.createElement('div');
            item.className = 'audit-summary-item';
            var dot = document.createElement('span');
            dot.className = 'audit-summary-dot ' + cls;
            item.appendChild(dot);
            item.appendChild(document.createTextNode(' ' + count + ' ' + label));
            summary.appendChild(item);
          }
          addSummaryItem('pass', pass, 'passed');
          addSummaryItem('warn', warn, 'warnings');
          addSummaryItem('fail', fail, 'failed');
          container.appendChild(summary);

          // Findings list
          var results = document.createElement('div');
          results.className = 'audit-results';
          data.findings.forEach(function(f) {
            var sev = f.severity || f.status || 'fail';
            var iconChar = sev === 'pass' ? '\u2713' : (sev === 'warn' || sev === 'warning') ? '\u26A0' : '\u2717';
            var color = sev === 'pass' ? 'var(--ok)' : (sev === 'warn' || sev === 'warning') ? '#F59E0B' : 'var(--danger)';

            var row = document.createElement('div');
            row.className = 'audit-item';
            var icon = document.createElement('span');
            icon.className = 'audit-item-icon';
            icon.style.color = color;
            icon.textContent = iconChar;
            row.appendChild(icon);
            var text = document.createElement('span');
            text.className = 'audit-item-text';
            text.textContent = f.message || f.description || f.check || JSON.stringify(f);
            row.appendChild(text);
            results.appendChild(row);
          });
          container.appendChild(results);
        } else if (data.raw) {
          var pre = document.createElement('pre');
          pre.className = 'audit-raw';
          pre.textContent = data.raw;
          container.appendChild(pre);
        } else {
          var emptyNotice = document.createElement('div');
          emptyNotice.className = 'section-notice';
          emptyNotice.textContent = 'No findings';
          container.appendChild(emptyNotice);
        }
      }

      // ----- Initialize -----
      document.addEventListener('DOMContentLoaded', function() {
        startPolling();
        renderCategoryPills();
        filterCommands();
      });
    })();
  </script>
</body>
</html>`;
}

/**
 * Mask a token for display: show first 4 and last 4 chars
 * @param {string} token
 * @returns {string}
 */
function maskToken(token) {
  if (!token || token.length < 8) return token || '--';
  return token.substring(0, 4) + '...' + token.substring(token.length - 4);
}

/**
 * Format uptime seconds into human-readable string (server-side for initial render)
 * @param {number} seconds
 * @returns {string}
 */
function formatUptime(seconds) {
  if (seconds == null) return '--';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
