import test from 'node:test';
import assert from 'node:assert/strict';
import { tempAuth, requireAdmin } from '../src/middlewares/tempAuthMiddleware.js';

test('tempAuth defaults role to student when no header is provided', () => {
  const req = { headers: {} };
  let nextCalled = false;
  tempAuth(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.role, 'student');
  assert.ok(req.user._id);
});

test('tempAuth extracts admin role when x-user-role is admin', () => {
  const req = { headers: { 'x-user-role': 'admin' } };
  let nextCalled = false;
  tempAuth(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.role, 'admin');
});

test('requireAdmin returns 403 Forbidden for student users', () => {
  const req = { user: { _id: '123', role: 'student' } };
  let statusCode = null;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return {
        json(data) {
          jsonResponse = data;
        },
      };
    },
  };

  requireAdmin(req, res, () => {
    assert.fail('next() should not be called for non-admin');
  });

  assert.equal(statusCode, 403);
  assert.equal(jsonResponse.success, false);
  assert.equal(jsonResponse.error.code, 'FORBIDDEN');
});

test('requireAdmin allows admin users to proceed', () => {
  const req = { user: { _id: '123', role: 'admin' } };
  let nextCalled = false;

  requireAdmin(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});
