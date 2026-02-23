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
    changeOrigin: true
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
    req.headers['host'] = `127.0.0.1:${gatewayPort}`;
    // Strip ALL forwarded/proxy headers so gateway sees a direct local connection.
    // isLocalDirectRequest() requires: loopback remoteAddr + localish Host + no forwarded headers.
    // Any x-forwarded-* header makes the gateway treat this as a proxied (non-local) request,
    // which blocks the scope upgrade from operator.read → operator.admin (requires pairing).
    delete req.headers['x-forwarded-for'];
    delete req.headers['x-forwarded-proto'];
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-real-ip'];
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
