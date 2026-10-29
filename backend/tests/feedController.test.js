/**
 * backend/tests/feedController.test.js
 * 
 * Unit tests for Member 3 feedController.
 * Uses Dependency Injection and Mock Models to test without requiring MongoDB.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFeedController,
  sanitizePublicIssue,
} from '../src/controllers/feedController.js';
import { Issue } from '../src/models/Issue.js';

// Helper to create mock Express req and res
function createMockHttp(reqOverrides = {}) {
  const req = {
    query: {},
    params: {},
    user: null,
    ...reqOverrides,
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return { req, res };
}

// Mock Mongoose Query builder
function createMockQuery(returnValue) {
  const query = {
    _returnValue: returnValue,
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    populate() { return this; },
    exec() { return Promise.resolve(this._returnValue); },
  };
  return query;
}

describe('Member 3: feedController Unit Tests', () => {
  describe('Dependency Safety (When Issue model is not yet connected)', () => {
    test('returns 503 DEPENDENCY_UNAVAILABLE on getFeed when model is missing', async () => {
      const controller = createFeedController({ issueModel: null });
      const { req, res } = createMockHttp();

      await controller.getFeed(req, res);

      assert.equal(res.statusCode, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'DEPENDENCY_UNAVAILABLE');
    });

    test('returns 503 DEPENDENCY_UNAVAILABLE on getIssueById when model is missing', async () => {
      const controller = createFeedController({ issueModel: null });
      const { req, res } = createMockHttp({ params: { id: '507f1f77bcf86cd799439011' } });

      await controller.getIssueById(req, res);

      assert.equal(res.statusCode, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'DEPENDENCY_UNAVAILABLE');
    });
  });

  describe('Privacy Rule §9: sanitizePublicIssue()', () => {
    test('sanitizes createdBy to only expose student role, hiding email and personal data', () => {
      const rawIssue = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Broken chair',
        createdBy: {
          _id: 'user-999',
          name: 'Jane Doe',
          email: 'jane.doe@coep.ac.in',
          role: 'student',
          password: 'hashed-secret',
        },
        __v: 0,
      };

      const sanitized = sanitizePublicIssue(rawIssue);

      assert.deepEqual(sanitized.createdBy, { role: 'student' });
      assert.equal(sanitized.createdBy.name, undefined);
      assert.equal(sanitized.createdBy.email, undefined);
      assert.equal(sanitized.createdBy.password, undefined);
      assert.equal(sanitized.__v, undefined);
    });
  });

  describe('GET /api/v1/issues (getFeed)', () => {
    test('returns 200 with issues list and pagination metadata', async () => {
      const mockIssues = [
        {
          _id: '507f1f77bcf86cd799439011',
          refId: 'CF-2026-0001',
          title: 'Water cooler leaking',
          campus: 'north',
          status: 'Reported',
          priorityScore: 35,
          createdBy: { role: 'student', email: 'secret@coep.ac.in' },
        },
      ];

      const mockModel = {
        find(filter) {
          assert.equal(filter.campus, 'north');
          return createMockQuery(mockIssues);
        },
        countDocuments() {
          return Promise.resolve(1);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ query: { campus: 'north', page: '1', limit: '10' } });

      await controller.getFeed(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].refId, 'CF-2026-0001');
      assert.equal(res.body.data[0].createdBy.email, undefined); // verified sanitized
      assert.deepEqual(res.body.pagination, {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasMore: false,
      });
    });

    test('returns 400 when query validation fails (e.g. invalid campus)', async () => {
      const mockModel = { find() {}, countDocuments() {} };
      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ query: { campus: 'invalid_campus' } });

      await controller.getFeed(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'BAD_REQUEST');
      assert.equal(res.body.error.field, 'campus');
    });
  });

  describe('GET /api/v1/issues/:id (getIssueById)', () => {
    test('returns 200 when finding by ObjectId', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockDoc = { _id: id, refId: 'CF-2026-0010', title: 'Lamp flickering' };

      const mockModel = {
        findOne(criteria) {
          assert.deepEqual(criteria, { _id: id });
          return createMockQuery(mockDoc);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ params: { id } });

      await controller.getIssueById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, 'Lamp flickering');
    });

    test('returns 200 when finding by reference ID (CF-YYYY-XXXX)', async () => {
      const refId = 'CF-2026-0042';
      const mockDoc = { _id: '507f1f77bcf86cd799439011', refId, title: 'Wi-Fi router down' };

      const mockModel = {
        findOne(criteria) {
          assert.deepEqual(criteria, { refId });
          return createMockQuery(mockDoc);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ params: { id: refId } });

      await controller.getIssueById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.refId, refId);
    });

    test('returns 404 when issue is not found', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockModel = {
        findOne() {
          return createMockQuery(null);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ params: { id } });

      await controller.getIssueById(req, res);

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });

    test('returns 400 when identifier is malformed', async () => {
      const mockModel = { findOne() {} };
      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ params: { id: 'malicious/../id' } });

      await controller.getIssueById(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'BAD_REQUEST');
    });
  });

  describe('GET /api/v1/issues/mine (getMyIssues)', () => {
    test('returns 401 UNAUTHORIZED when req.user is missing', async () => {
      const mockModel = { find() {} };
      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({ user: null });

      await controller.getMyIssues(req, res);

      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    test('returns 200 and filters strictly by req.user._id when authenticated', async () => {
      const userId = '507f1f77bcf86cd799439099';
      const userIssues = [
        { _id: '1', title: 'My ticket 1', createdBy: userId },
      ];

      const mockModel = {
        find(filter) {
          assert.equal(filter.createdBy, userId);
          return createMockQuery(userIssues);
        },
        countDocuments(filter) {
          assert.equal(filter.createdBy, userId);
          return Promise.resolve(1);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({
        user: { _id: userId },
        query: { page: '1', limit: '10' },
      });

      await controller.getMyIssues(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].title, 'My ticket 1');
    });
  });

  describe('Subtask 7: Real Mongoose Model Integration', () => {
    test('Mongoose Issue schema paths align with feed query filters and populate paths', () => {
      const paths = Object.keys(Issue.schema.paths);
      assert.ok(paths.includes('refId'));
      assert.ok(paths.includes('title'));
      assert.ok(paths.includes('category'));
      assert.ok(paths.includes('building'));
      assert.ok(paths.includes('campus'));
      assert.ok(paths.includes('status'));
      assert.ok(paths.includes('reportCount'));
      assert.ok(paths.includes('createdBy'));
      assert.ok(paths.includes('createdAt'));
      assert.ok(paths.includes('updatedAt'));
    });

    test('real Mongoose Issue document sanitizes correctly with Privacy Rule § 9', () => {
      const issueDoc = new Issue({
        refId: 'CF-2026-0001',
        title: 'Broken desk in LH-101',
        category: '507f1f77bcf86cd799439011',
        building: '507f1f77bcf86cd799439012',
        campus: 'north',
        locationText: 'Room 101, 1st floor',
        description: 'Desk leg broken',
        photos: ['https://example.com/p1.jpg'],
        createdBy: '507f1f77bcf86cd799439013',
      });

      const sanitized = sanitizePublicIssue(issueDoc);
      assert.equal(sanitized.refId, 'CF-2026-0001');
      assert.equal(sanitized.title, 'Broken desk in LH-101');
      assert.equal(sanitized.campus, 'north');
      assert.equal(sanitized.__v, undefined);
    });
  });

  describe('Subtask 10: Authority Triage Queries', () => {
    test('handles authority triage multi-status and priorityBand query filters', async () => {
      const mockIssues = [
        {
          _id: '507f1f77bcf86cd799439011',
          refId: 'CF-2026-0001',
          title: 'Power outage in Library',
          status: 'Reported',
          priorityBand: 'Critical',
          createdBy: { role: 'student' },
        },
      ];

      const mockModel = {
        find(filter) {
          assert.deepEqual(filter.status, { $in: ['Reported', 'In Progress'] });
          assert.deepEqual(filter.priorityBand, { $in: ['High', 'Critical'] });
          return createMockQuery(mockIssues);
        },
        countDocuments() {
          return Promise.resolve(1);
        },
      };

      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({
        query: {
          status: 'Reported,In Progress',
          priorityBand: 'High,Critical',
          sort: 'priority',
        },
      });

      await controller.getFeed(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 1);
    });

    test('returns 400 when authority triage priorityBand is invalid', async () => {
      const mockModel = { find() {}, countDocuments() {} };
      const controller = createFeedController({ issueModel: mockModel });
      const { req, res } = createMockHttp({
        query: { priorityBand: 'SuperUrgent' },
      });

      await controller.getFeed(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'BAD_REQUEST');
      assert.equal(res.body.error.field, 'priorityBand');
    });
  });
});
