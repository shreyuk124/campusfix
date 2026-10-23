/**
 * backend/tests/feedQueryHelpers.test.js
 * 
 * Unit tests for Member 3 query validation and helper functions.
 * Runs with Node.js built-in test runner: node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePagination,
  parseSort,
  buildFilter,
  formatPaginationMeta,
  validateIssueId,
  QueryValidationError,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../src/utils/feedQueryHelpers.js';

describe('Member 3: feedQueryHelpers Unit Tests', () => {
  describe('parsePagination()', () => {
    test('returns default pagination when query is empty', () => {
      const result = parsePagination({});
      assert.equal(result.page, DEFAULT_PAGE);
      assert.equal(result.limit, DEFAULT_LIMIT);
      assert.equal(result.skip, 0);
    });

    test('parses valid numeric string parameters', () => {
      const result = parsePagination({ page: '2', limit: '15' });
      assert.equal(result.page, 2);
      assert.equal(result.limit, 15);
      assert.equal(result.skip, 15); // (2 - 1) * 15
    });

    test('enforces MAX_LIMIT of 50 to prevent DoS', () => {
      const result = parsePagination({ page: '1', limit: '500' });
      assert.equal(result.limit, MAX_LIMIT);
      assert.equal(result.skip, 0);
    });

    test('throws on page = 0 or negative', () => {
      assert.throws(
        () => parsePagination({ page: '0' }),
        (err) => err instanceof QueryValidationError && err.field === 'page'
      );
      assert.throws(
        () => parsePagination({ page: '-5' }),
        (err) => err instanceof QueryValidationError && err.field === 'page'
      );
    });

    test('throws on non-integer page', () => {
      assert.throws(
        () => parsePagination({ page: 'abc' }),
        (err) => err instanceof QueryValidationError && err.field === 'page'
      );
      assert.throws(
        () => parsePagination({ page: '1.5' }),
        (err) => err instanceof QueryValidationError && err.field === 'page'
      );
    });

    test('throws on invalid limit', () => {
      assert.throws(
        () => parsePagination({ limit: '0' }),
        (err) => err instanceof QueryValidationError && err.field === 'limit'
      );
      assert.throws(
        () => parsePagination({ limit: 'invalid' }),
        (err) => err instanceof QueryValidationError && err.field === 'limit'
      );
    });
  });

  describe('parseSort()', () => {
    test('defaults to newest when sort is omitted', () => {
      const { sortKey, sortObj } = parseSort();
      assert.equal(sortKey, 'newest');
      assert.deepEqual(sortObj, { createdAt: -1 });
    });

    test('handles newest explicitly (case-insensitive)', () => {
      const { sortKey, sortObj } = parseSort('NEWEST');
      assert.equal(sortKey, 'newest');
      assert.deepEqual(sortObj, { createdAt: -1 });
    });

    test('handles priority sort correctly', () => {
      const { sortKey, sortObj } = parseSort('priority');
      assert.equal(sortKey, 'priority');
      assert.deepEqual(sortObj, { priorityScore: -1, createdAt: -1 });
    });

    test('handles overdue sort contract', () => {
      const { sortKey, sortObj, pendingSchemaNote } = parseSort('overdue');
      assert.equal(sortKey, 'overdue');
      assert.deepEqual(sortObj, { slaDeadline: 1, createdAt: -1 });
      assert.ok(pendingSchemaNote);
    });

    test('throws on unknown sort parameter', () => {
      assert.throws(
        () => parseSort('malicious_field'),
        (err) => err instanceof QueryValidationError && err.field === 'sort'
      );
    });
  });

  describe('buildFilter()', () => {
    test('returns empty filter object for empty query', () => {
      const filter = buildFilter({});
      assert.deepEqual(filter, {});
    });

    test('validates and applies allowed campuses', () => {
      assert.deepEqual(buildFilter({ campus: 'north' }), { campus: 'north' });
      assert.deepEqual(buildFilter({ campus: 'SOUTH' }), { campus: 'south' });

      assert.throws(
        () => buildFilter({ campus: 'east' }),
        (err) => err instanceof QueryValidationError && err.field === 'campus'
      );
    });

    test('validates and normalizes allowed statuses', () => {
      assert.deepEqual(buildFilter({ status: 'Reported' }), { status: 'Reported' });
      assert.deepEqual(buildFilter({ status: 'in progress' }), { status: 'In Progress' });
      assert.deepEqual(buildFilter({ status: 'RESOLVED' }), { status: 'Resolved' });

      assert.throws(
        () => buildFilter({ status: 'Deleted' }),
        (err) => err instanceof QueryValidationError && err.field === 'status'
      );
    });

    test('accepts building and category filters safely', () => {
      const filter = buildFilter({
        campus: 'north',
        status: 'Reported',
        building: '6715b9f9e20a841234567890',
        category: '6715b9f9e20a841234567891',
      });

      assert.deepEqual(filter, {
        campus: 'north',
        status: 'Reported',
        building: '6715b9f9e20a841234567890',
        category: '6715b9f9e20a841234567891',
      });
    });

    test('ignores arbitrary unwhitelisted query keys', () => {
      const filter = buildFilter({
        campus: 'north',
        hackKey: { $gt: '' },
        __proto__: { admin: true },
      });

      assert.deepEqual(filter, { campus: 'north' });
    });
  });

  describe('formatPaginationMeta()', () => {
    test('calculates correct pages when total is 0', () => {
      const meta = formatPaginationMeta(0, 1, 10);
      assert.deepEqual(meta, {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasMore: false,
      });
    });

    test('calculates multi-page metadata with hasMore flag', () => {
      const page1 = formatPaginationMeta(35, 1, 10);
      assert.equal(page1.totalPages, 4);
      assert.equal(page1.hasMore, true);

      const page4 = formatPaginationMeta(35, 4, 10);
      assert.equal(page4.totalPages, 4);
      assert.equal(page4.hasMore, false);
    });
  });

  describe('validateIssueId()', () => {
    test('accepts valid 24-character hexadecimal ObjectId', () => {
      const id = '507f1f77bcf86cd799439011';
      const result = validateIssueId(id);
      assert.equal(result.isObjectId, true);
      assert.equal(result.isRefId, false);
      assert.equal(result.normalizedId, id);
    });

    test('accepts valid CF-YYYY-XXXX reference code', () => {
      const refId = 'CF-2026-0042';
      const result = validateIssueId(refId);
      assert.equal(result.isObjectId, false);
      assert.equal(result.isRefId, true);
      assert.equal(result.normalizedId, refId);
    });

    test('throws on malformed or malicious ID strings', () => {
      assert.throws(
        () => validateIssueId('short-id'),
        (err) => err instanceof QueryValidationError && err.field === 'id'
      );
      assert.throws(
        () => validateIssueId('../../../etc/passwd'),
        (err) => err instanceof QueryValidationError && err.field === 'id'
      );
      assert.throws(
        () => validateIssueId(''),
        (err) => err instanceof QueryValidationError && err.field === 'id'
      );
    });
  });
});
