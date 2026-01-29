/**
 * Authentication middleware for MoltBot setup wizard
 *
 * Protects /setup endpoint with password authentication
 */

/**
 * Create password authentication middleware
 * @param {string} password - The setup password from SETUP_PASSWORD env var
 * @returns {Function} Express middleware
 */
export function createAuthMiddleware(password) {
  if (!password) {
    console.error('ERROR: SETUP_PASSWORD environment variable is required');
    console.error('Generate one with: openssl rand -base64 32');
    process.exit(1);
  }

  return (req, res, next) => {
    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token === password) {
        return next();
      }
    }

    // Check query parameter (for browser access)
    if (req.query.password === password) {
      return next();
    }

    // Check cookie (for subsequent requests after login)
    if (req.cookies && req.cookies.moltbot_auth === password) {
      return next();
    }

    // If POST request with password in body
    if (req.body && req.body.password === password) {
      // Set cookie for subsequent requests
      res.cookie('moltbot_auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      return next();
    }

    // Return 401 with login form
    res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MoltBot Setup - Authentication Required</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .login-box {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
          }
          h1 {
            margin: 0 0 10px 0;
            color: #333;
          }
          p {
            color: #666;
            margin-bottom: 30px;
          }
          input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
          }
          input[type="password"]:focus {
            border-color: #667eea;
            outline: none;
          }
          button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="login-box">
          <h1>MoltBot Setup</h1>
          <p>Enter your setup password to continue</p>
          <form method="POST" action="${req.originalUrl}">
            <input type="password" name="password" placeholder="Setup Password" autofocus required>
            <button type="submit">Continue to Setup</button>
          </form>
        </div>
      </body>
      </html>
    `);
  };
}
