/**
 * backend/tests/feedRoutes.test.js
 * 
 * Route order & precedence tests for Member 3 feedRoutes.
 * Verifies that static route '/mine' precedes dynamic route '/:id'.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createFeedRouter } from '../src/routes/feedRoutes.js';

describe('Member 3: feedRoutes Precedence & Configuration', () => {
  test('creates router with correct route order (static /mine before dynamic /:id)', () => {
    const router = createFeedRouter();

    // Extract registered route paths from Express router stack
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    assert.ok(routes.length >= 3, 'Router should have at least 3 routes registered');

    // 1. Verify route paths
    const paths = routes.map((r) => r.path);
    assert.ok(paths.includes('/mine'), 'Must register /mine');
    assert.ok(paths.includes('/'), 'Must register /');
    assert.ok(paths.includes('/:id'), 'Must register /:id');

    // 2. CRITICAL PRECEDENCE CHECK:
    // /mine MUST appear at an index strictly LOWER than /:id
    const mineIndex = paths.indexOf('/mine');
    const idIndex = paths.indexOf('/:id');
    assert.ok(
      mineIndex < idIndex,
      `Route precedence violation: /mine (index ${mineIndex}) must precede /:id (index ${idIndex})`
    );
  });

  test('attaches authMiddleware to /mine when provided', () => {
    let authCalled = false;
    const mockAuthMiddleware = (req, res, next) => {
      authCalled = true;
      next();
    };

    const router = createFeedRouter({ authMiddleware: mockAuthMiddleware });

    const mineLayer = router.stack.find(
      (layer) => layer.route && layer.route.path === '/mine'
    );

    assert.ok(mineLayer, 'Should find /mine route layer');
    // Layer should have 2 handlers (authMiddleware + controller handler)
    assert.equal(
      mineLayer.route.stack.length,
      2,
      '/mine should have 2 handlers when authMiddleware is supplied'
    );
  });
});
