/**
 * Reverse proxy configuration for MoltBot gateway
 *
 * Proxies HTTP and WebSocket traffic to the internal MoltBot gateway
 */

import httpProxy from 'http-proxy';

/**
 * Create a reverse proxy to the MoltBot gateway
 * @returns {Object} Proxy instance and middleware
 */
export function createProxy() {
  const gatewayPort = process.env.INTERNAL_GATEWAY_PORT || '18789';
  const target = `http://127.0.0.1:${gatewayPort}`;

  const proxy = httpProxy.createProxyServer({
    target,
    ws: true,
    changeOrigin: true,
    xfwd: true
  });

  // Handle proxy errors
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err.message);

    if (res.writeHead) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bad Gateway',
        message: 'MoltBot gateway is not available',
        details: err.message
      }));
    }
  });

  // Log proxied requests
  proxy.on('proxyReq', (proxyReq, req) => {
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
