/**
 * backend/tests/server.test.js
 * 
 * HTTP Server integration test.
 * Verifies Express app startup, health check endpoint, 404 handler, and route mounting.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

describe('Server & Route Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  });

  test('GET / returns API welcome information', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.message.includes('CampusFix API Server'));
  });

  test('GET /api/v1/health returns 200 and healthy status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'healthy');
    assert.equal(data.data.service, 'CampusFix API Server');
  });

  test('GET /api/v1/non-existent returns 404 NOT_FOUND via notFound middleware', async () => {
    const res = await fetch(`${baseUrl}/api/v1/non-existent`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'NOT_FOUND');
  });

  test('GET /api/v1/issues returns 503 DEPENDENCY_UNAVAILABLE when Issue model is pending', async () => {
    const res = await fetch(`${baseUrl}/api/v1/issues`);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'DEPENDENCY_UNAVAILABLE');
    assert.ok(data.error.message.includes('Pending Member 2'));
  });
});
