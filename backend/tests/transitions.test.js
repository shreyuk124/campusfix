import test from 'node:test';
import assert from 'node:assert/strict';

// Transition matrix under test (matching triageController.js)
const ALLOWED_STATUS_TRANSITIONS = {
  Reported: [], // Cannot transition directly via PATCH /status; must use POST /assign
  Assigned: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed'],
  Closed: [], // Terminal
};

function validateTransition(fromStatus, toStatus, resolutionNote) {
  if (fromStatus === 'Reported' && toStatus === 'Assigned') {
    return {
      allowed: false,
      statusCode: 422,
      errorCode: 'ASSIGN_ENDPOINT_REQUIRED',
      message: 'Moving an issue from Reported to Assigned requires assigning a team via POST /api/v1/issues/:id/assign.',
    };
  }

  const allowedMoves = ALLOWED_STATUS_TRANSITIONS[fromStatus] || [];
  if (!allowedMoves.includes(toStatus)) {
    return {
      allowed: false,
      statusCode: 422,
      errorCode: 'INVALID_STATUS_TRANSITION',
      message: `Cannot transition status from "${fromStatus}" to "${toStatus}".`,
    };
  }

  if (toStatus === 'Resolved' && (!resolutionNote || !resolutionNote.trim())) {
    return {
      allowed: false,
      statusCode: 422,
      errorCode: 'RESOLUTION_NOTE_REQUIRED',
      message: 'A non-empty resolutionNote is required to mark an issue as Resolved.',
    };
  }

  return { allowed: true };
}

function calculateAssignmentOutcome(currentStatus, oldTeamName, newTeamName, customNote) {
  if (['Resolved', 'Closed'].includes(currentStatus)) {
    return {
      allowed: false,
      statusCode: 422,
      errorCode: 'CANNOT_ASSIGN_TERMINAL_ISSUE',
    };
  }

  const nextStatus = currentStatus === 'Reported' ? 'Assigned' : currentStatus;
  const isReassignment = Boolean(oldTeamName && oldTeamName !== newTeamName);

  let note = customNote?.trim();
  if (!note) {
    if (isReassignment) {
      note = `Reassigned from ${oldTeamName} to ${newTeamName}`;
    } else {
      note = `Assigned to ${newTeamName}`;
    }
  }

  return {
    allowed: true,
    nextStatus,
    note,
    statusHistoryFrom: currentStatus,
    statusHistoryTo: nextStatus,
  };
}

// ---------------------------------------------------------------------------
// 1. Full-Loop Happy Path Tests
// ---------------------------------------------------------------------------
test('Full-loop progression: Reported -> Assigned -> In Progress -> Resolved -> Closed', () => {
  // Step 1: Assign from Reported
  const step1 = calculateAssignmentOutcome('Reported', null, 'Electrical Team');
  assert.equal(step1.allowed, true);
  assert.equal(step1.nextStatus, 'Assigned');
  assert.equal(step1.statusHistoryFrom, 'Reported');
  assert.equal(step1.statusHistoryTo, 'Assigned');
  assert.equal(step1.note, 'Assigned to Electrical Team');

  // Step 2: Assigned -> In Progress
  const step2 = validateTransition('Assigned', 'In Progress');
  assert.equal(step2.allowed, true);

  // Step 3: In Progress -> Resolved (with mandatory resolution note)
  const step3 = validateTransition('In Progress', 'Resolved', 'Replaced faulty breaker.');
  assert.equal(step3.allowed, true);

  // Step 4: Resolved -> Closed (terminal)
  const step4 = validateTransition('Resolved', 'Closed');
  assert.equal(step4.allowed, true);
});

// ---------------------------------------------------------------------------
// 2. State Machine Violation Tests (Rejecting with 422)
// ---------------------------------------------------------------------------
test('Terminal state: Closed -> any status must be rejected with 422', () => {
  for (const target of ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Closed']) {
    const res = validateTransition('Closed', target);
    assert.equal(res.allowed, false);
    assert.equal(res.statusCode, 422);
    assert.equal(res.errorCode, 'INVALID_STATUS_TRANSITION');
  }
});

test('Disallow moving backward or skipping steps', () => {
  // Resolved -> In Progress
  const backwardRes = validateTransition('Resolved', 'In Progress');
  assert.equal(backwardRes.allowed, false);
  assert.equal(backwardRes.statusCode, 422);

  // Reported -> Closed directly
  const skipToClose = validateTransition('Reported', 'Closed');
  assert.equal(skipToClose.allowed, false);
  assert.equal(skipToClose.statusCode, 422);

  // Assigned -> Closed directly
  const skipAssignedToClose = validateTransition('Assigned', 'Closed');
  assert.equal(skipAssignedToClose.allowed, false);
  assert.equal(skipAssignedToClose.statusCode, 422);

  // In Progress -> Closed directly without Resolved
  const skipToClosed = validateTransition('In Progress', 'Closed');
  assert.equal(skipToClosed.allowed, false);
  assert.equal(skipToClosed.statusCode, 422);
});

test('PATCH /status: Reported -> Assigned must be rejected (must use assign endpoint)', () => {
  const res = validateTransition('Reported', 'Assigned');
  assert.equal(res.allowed, false);
  assert.equal(res.statusCode, 422);
  assert.equal(res.errorCode, 'ASSIGN_ENDPOINT_REQUIRED');
});

test('In Progress -> Resolved requires non-empty resolutionNote', () => {
  const missingNote = validateTransition('In Progress', 'Resolved', '');
  assert.equal(missingNote.allowed, false);
  assert.equal(missingNote.statusCode, 422);
  assert.equal(missingNote.errorCode, 'RESOLUTION_NOTE_REQUIRED');

  const whitespaceNote = validateTransition('In Progress', 'Resolved', '   ');
  assert.equal(whitespaceNote.allowed, false);
  assert.equal(whitespaceNote.statusCode, 422);
  assert.equal(whitespaceNote.errorCode, 'RESOLUTION_NOTE_REQUIRED');
});

// ---------------------------------------------------------------------------
// 3. Reassignment Tests
// ---------------------------------------------------------------------------
test('Reassignment preserves In Progress status and logs old and new team', () => {
  const outcome = calculateAssignmentOutcome(
    'In Progress',
    'Electrical Team',
    'IT Maintenance Team'
  );

  assert.equal(outcome.allowed, true);
  // Status stays In Progress
  assert.equal(outcome.nextStatus, 'In Progress');
  assert.equal(outcome.statusHistoryFrom, 'In Progress');
  assert.equal(outcome.statusHistoryTo, 'In Progress');
  assert.equal(outcome.note, 'Reassigned from Electrical Team to IT Maintenance Team');
});

test('Reject assignment on Resolved or Closed issues', () => {
  const resolvedAssign = calculateAssignmentOutcome('Resolved', null, 'Electrical Team');
  assert.equal(resolvedAssign.allowed, false);
  assert.equal(resolvedAssign.statusCode, 422);
  assert.equal(resolvedAssign.errorCode, 'CANNOT_ASSIGN_TERMINAL_ISSUE');

  const closedAssign = calculateAssignmentOutcome('Closed', null, 'Electrical Team');
  assert.equal(closedAssign.allowed, false);
  assert.equal(closedAssign.statusCode, 422);
  assert.equal(closedAssign.errorCode, 'CANNOT_ASSIGN_TERMINAL_ISSUE');
});
