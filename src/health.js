/**
 * Health check endpoints for OpenClaw wrapper server
 *
 * Provides three levels of health checks:
 * - /health       - Basic liveness check
 * - /health/live  - Kubernetes-style liveness probe
 * - /health/ready - Readiness check (is gateway running?)
 */

import { Router } from 'express';

const router = Router();

// Track gateway status
let gatewayReady = false;
let lastGatewayCheck = null;

/**
 * Update gateway readiness status
 * @param {boolean} ready - Whether gateway is ready
 */
export function setGatewayReady(ready) {
  gatewayReady = ready;
  lastGatewayCheck = new Date().toISOString();
}

/**
 * Get current gateway status
 * @returns {Object} Gateway status info
 */
export function getGatewayStatus() {
  return {
    ready: gatewayReady,
    lastCheck: lastGatewayCheck
  };
}

// Basic health check - always returns 200 if server is running
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'openclaw-railway',
    timestamp: new Date().toISOString()
  });
});

// Liveness probe - is the process alive?
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - is the gateway ready to accept traffic?
router.get('/ready', (req, res) => {
  const status = getGatewayStatus();

  if (status.ready) {
    res.json({
      status: 'ready',
      gateway: 'running',
      lastCheck: status.lastCheck,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      gateway: 'not_started',
      message: 'Complete setup at /setup to start the gateway',
      lastCheck: status.lastCheck,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
