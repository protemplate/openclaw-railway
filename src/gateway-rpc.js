/**
 * WebSocket JSON-RPC client for the OpenClaw gateway
 *
 * Makes short-lived WebSocket connections to the gateway process,
 * authenticates via the connect handshake, sends a single RPC request,
 * and returns the result.
 */

import WebSocket from 'ws';
import { getGatewayToken } from './gateway.js';

/**
 * Make a single JSON-RPC request to the gateway via WebSocket
 * @param {string} method - RPC method name (e.g. 'sessions.list', 'usage.cost')
 * @param {Object} params - Method parameters
 * @param {number} timeoutMs - Timeout in milliseconds (default 10000)
 * @returns {Promise<any>} The result from the gateway
 */
export async function gatewayRPC(method, params = {}, timeoutMs = 10000) {
  const port = process.env.INTERNAL_GATEWAY_PORT || '18789';
  const token = getGatewayToken();
  const wsUrl = `ws://127.0.0.1:${port}`;

  return new Promise((resolve, reject) => {
    let reqId = 0;
    let settled = false;
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => finish(new Error('gateway RPC timeout')), timeoutMs);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      err ? reject(err) : resolve(result);
    }

    ws.on('open', () => { /* wait for challenge event */ });
    ws.on('error', (e) => finish(new Error('ws error: ' + e.message)));
    ws.on('close', () => { if (!settled) finish(new Error('ws closed unexpectedly')); });

    ws.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }

      // Handle connect.challenge -> send connect request
      if (msg.type === 'event' && msg.event === 'connect.challenge') {
        reqId++;
        ws.send(JSON.stringify({
          type: 'req', id: String(reqId), method: 'connect',
          params: {
            minProtocol: 3, maxProtocol: 3,
            client: { id: 'lite-dashboard', version: '1.0', platform: 'node', mode: 'operator' },
            role: 'operator', scopes: ['operator.admin'],
            auth: { token }, caps: []
          }
        }));
        return;
      }

      if (msg.type !== 'res') return;

      // Connect response (id "1")
      if (parseInt(msg.id, 10) === 1) {
        if (msg.ok === false) {
          return finish(new Error('connect failed: ' + (msg.error?.message || 'unknown')));
        }
        // Send the actual RPC request
        reqId++;
        ws.send(JSON.stringify({ type: 'req', id: String(reqId), method, params }));
        return;
      }

      // Data response (id "2")
      if (parseInt(msg.id, 10) === 2) {
        if (msg.ok === false) {
          return finish(new Error(msg.error?.message || 'rpc error'));
        }
        finish(null, msg.result);
      }
    });
  });
}
