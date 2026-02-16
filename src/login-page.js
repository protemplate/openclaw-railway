/**
 * Login page HTML generator for OpenClaw
 *
 * Standalone login form that POSTs to /login with a hidden redirect field.
 * Used by the centralized auth flow instead of inline 401 forms.
 */

/**
 * Generate the login page HTML
 * @param {Object} options - Page options
 * @param {string} options.redirect - URL to redirect to after successful login
 * @param {string} [options.error] - Error message to display
 * @returns {string} HTML content
 */
export function getLoginPageHTML({ redirect, error }) {
  const redirectValue = redirect || '/onboard';
  const errorHTML = error
    ? `<div class="error-message">${error}</div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <title>OpenClaw - Authentication Required</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"/>
  <style>
    * { box-sizing: border-box; }
    ::selection {
      background: rgba(255, 92, 92, 0.15);
      color: #fafafa;
    }
    body {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #12141a;
      letter-spacing: -0.02em;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .login-box {
      background: #181b22;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #27272a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.03);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .logo-svg {
      width: 28px;
      height: 28px;
      vertical-align: middle;
      margin-right: 8px;
    }
    h1 {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0 0 10px 0;
      color: #fafafa;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    p {
      color: #71717a;
      margin-bottom: 30px;
    }
    .error-message {
      background: rgba(153, 27, 27, 0.2);
      color: #ff5c5c;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 92, 92, 0.3);
      font-size: 14px;
      margin-bottom: 20px;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px;
      background: #1a1d25;
      color: #e4e4e7;
      border: 1px solid #27272a;
      border-radius: 6px;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      margin-bottom: 20px;
    }
    input[type="password"]::placeholder {
      color: #52525b;
    }
    input[type="password"]:focus {
      border-color: #ff5c5c;
      box-shadow: 0 0 0 2px #12141a, 0 0 0 4px #ff5c5c;
      outline: none;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #ff5c5c;
      color: white;
      border: none;
      border-radius: 8px;
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    }
    button:hover {
      background: #ff7070;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 92, 92, 0.25);
    }
  </style>
</head>
<body>
  <div class="login-box">
    <h1><svg class="logo-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff4d4d"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs><path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="url(#lobster-gradient)"/><path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="url(#lobster-gradient)"/><path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="url(#lobster-gradient)"/><path d="M45 15 Q35 5 30 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><path d="M75 15 Q85 5 90 8" stroke="#ff4d4d" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="35" r="6" fill="#050810"/><circle cx="75" cy="35" r="6" fill="#050810"/><circle cx="46" cy="34" r="2.5" fill="#00e5cc"/><circle cx="76" cy="34" r="2.5" fill="#00e5cc"/></svg> OpenClaw Setup</h1>
    <p>Enter your setup password to continue</p>
    ${errorHTML}
    <form method="POST" action="/login">
      <input type="hidden" name="redirect" value="${redirectValue}">
      <input type="password" name="password" placeholder="Setup Password" autofocus required>
      <button type="submit">Continue to Setup</button>
    </form>
  </div>
</body>
</html>`;
}
