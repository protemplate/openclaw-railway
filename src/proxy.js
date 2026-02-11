/**
 * Reverse proxy configuration for OpenClaw gateway
 *
 * Proxies HTTP and WebSocket traffic to the internal OpenClaw gateway
 */

import httpProxy from 'http-proxy';

/**
 * Create a reverse proxy to the OpenClaw gateway
 * @returns {Object} Proxy instance and middleware
 */
export function createProxy(getToken) {
  const gatewayPort = process.env.INTERNAL_GATEWAY_PORT || '18789';
  const target = `http://127.0.0.1:${gatewayPort}`;

  const proxy = httpProxy.createProxyServer({
    target,
    ws: true,
    changeOrigin: true,
    xfwd: false
  });

  // Handle proxy errors
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err.message);

    if (res.writeHead) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bad Gateway',
        message: 'OpenClaw gateway is not available',
        details: err.message
      }));
    }
  });

  // Inject gateway auth header and log proxied requests
  proxy.on('proxyReq', (proxyReq, req) => {
    if (getToken) {
      const token = getToken();
      if (token) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
      }
    }
    console.log(`[proxy] ${req.method} ${req.url} -> ${target}${req.url}`);
  });

  /**
   * Express middleware for proxying requests
   */
  const middleware = (req, res) => {
    proxy.web(req, res);
  };

  /**
   * WebSocket upgrade handler
   */
  const upgradeHandler = (req, socket, head) => {
    if (getToken) {
      const token = getToken();
      if (token) {
        req.headers['authorization'] = `Bearer ${token}`;
      }
    }
    console.log(`[proxy] WebSocket upgrade: ${req.url}`);
    proxy.ws(req, socket, head);
  };

  return {
    proxy,
    middleware,
    upgradeHandler,
    target
  };
}
