/**
 * Authentication middleware for OpenClaw Onboarding Wizard
 *
 * Protects /onboard endpoint with password authentication
 */

/**
 * Create password authentication middleware
 * @param {string} password - The setup password from SETUP_PASSWORD env var
 * @returns {Function} Express middleware
 */
export function createAuthMiddleware(password) {
  if (!password) {
    console.error('ERROR: SETUP_PASSWORD environment variable is required');
    console.error('Generate one with: openssl rand -hex 24');
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
      // Set cookie so subsequent requests don't need the query param
      res.cookie('openclaw_auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      return next();
    }

    // Check cookie (for subsequent requests after login)
    if (req.cookies && req.cookies.openclaw_auth === password) {
      return next();
    }

    // For browser requests: redirect to /login
    // For API/XHR requests: return JSON 401
    const acceptsHtml = (req.headers.accept || '').includes('text/html');
    if (acceptsHtml) {
      const redirectTo = encodeURIComponent(req.originalUrl);
      return res.redirect(`/login?redirect=${redirectTo}`);
    }

    res.status(401).json({ error: 'Authentication required' });
  };
}
