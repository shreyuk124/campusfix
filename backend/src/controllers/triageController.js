import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Building } from '../models/Building.js';
import { Team } from '../models/Team.js';
import { Issue } from '../models/Issue.js';
import { StatusHistory } from '../models/StatusHistory.js';

// Linear status machine transition map:
// Reported -> Assigned (strictly via POST /assign)
// Assigned -> In Progress
// In Progress -> Resolved (requires resolutionNote)
// Resolved -> Closed
// Closed is terminal (no transitions allowed)
const ALLOWED_STATUS_TRANSITIONS = {
  Reported: [], // Cannot transition directly via PATCH /status; must use POST /assign
  Assigned: ['In Progress'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed'],
  Closed: [],
};

/**
 * @desc    Get all active categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name key defaultTeam isActive')
      .populate('defaultTeam', 'name')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active buildings with optional campus filter
 * @route   GET /api/v1/buildings
 * @access  Public
 */
export const getBuildings = async (req, res, next) => {
  try {
    const query = { isActive: true };
    if (req.query.campus && ['north', 'south'].includes(req.query.campus.toLowerCase())) {
      query.campus = req.query.campus.toLowerCase();
    }

    const buildings = await Building.find(query)
      .select('name campus floors isActive')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: buildings.length,
      data: buildings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active maintenance teams with linked categories
 * @route   GET /api/v1/teams
 * @access  Public
 */
export const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ isActive: true })
      .select('name categories isActive')
      .populate('categories', 'name key')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign or reassign an issue to a maintenance team
 * @route   POST /api/v1/issues/:id/assign
 * @access  Protected (Admin only)
 */
export const assignIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { teamId, note } = req.body;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid issue identifier format.',
        },
      });
    }

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TEAM_ID',
          message: 'A valid teamId is required.',
        },
      });
    }

    // 2. Fetch target issue
    const issue = await Issue.findById(id).populate('assignedTeam');
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ISSUE_NOT_FOUND',
          message: 'Issue not found.',
        },
      });
    }

    // 3. Reject assignment when issue is already Resolved or Closed
    if (['Resolved', 'Closed'].includes(issue.status)) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'CANNOT_ASSIGN_TERMINAL_ISSUE',
          message: `Cannot assign or reassign an issue that is already ${issue.status}.`,
        },
      });
    }

    // 4. Validate target team existence and active status
    const targetTeam = await Team.findById(teamId);
    if (!targetTeam) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Target maintenance team not found.',
        },
      });
    }

    if (!targetTeam.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INACTIVE_TEAM',
          message: 'Cannot assign issue to an inactive team.',
        },
      });
    }

    // 5. Status & Reassignment note determination
    const currentStatus = issue.status;
    // Auto-move to Assigned ONLY when current status is Reported
    const nextStatus = currentStatus === 'Reported' ? 'Assigned' : currentStatus;

    let assignmentNote = note?.trim();
    const isReassignment =
      issue.assignedTeam && String(issue.assignedTeam._id) !== String(targetTeam._id);

    if (!assignmentNote) {
      if (isReassignment) {
        const oldTeamName = issue.assignedTeam.name || 'previous team';
        assignmentNote = `Reassigned from ${oldTeamName} to ${targetTeam.name}`;
      } else {
        assignmentNote = `Assigned to ${targetTeam.name}`;
      }
    }

    // 6. Update issue and save
    issue.assignedTeam = targetTeam._id;
    issue.status = nextStatus;
    const savedIssue = await issue.save();
    await savedIssue.populate('assignedTeam');

    // 7. Append audit log in StatusHistory
    await StatusHistory.create({
      issue: issue._id,
      kind: 'assignment',
      from: currentStatus, // Log actual current status
      to: nextStatus,
      actor: req.user?._id || null,
      note: assignmentNote,
    });

    return res.status(200).json({
      success: true,
      message: 'Issue assigned successfully.',
      data: savedIssue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Advance an issue's status through the linear state machine
 * @route   PATCH /api/v1/issues/:id/status
 * @access  Protected (Admin only)
 */
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, resolutionNote, note } = req.body;

    // 1. Validate ObjectId format and required status field
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid issue identifier format.',
        },
      });
    }

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STATUS',
          message: 'A target status is required.',
        },
      });
    }

    // 2. Fetch target issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ISSUE_NOT_FOUND',
          message: 'Issue not found.',
        },
      });
    }

    const currentStatus = issue.status;

    // 3. Disallow moving Reported -> Assigned via PATCH /status (must use POST /assign)
    if (currentStatus === 'Reported' && targetStatus === 'Assigned') {
      return res.status(422).json({
        success: false,
        error: {
          code: 'ASSIGN_ENDPOINT_REQUIRED',
          message:
            'Moving an issue from Reported to Assigned requires assigning a team via POST /api/v1/issues/:id/assign.',
        },
      });
    }

    // 4. Validate transition against linear state machine
    const allowedMoves = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedMoves.includes(targetStatus)) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition status from "${currentStatus}" to "${targetStatus}".`,
        },
      });
    }

    // 5. Mandatory resolutionNote validation for Resolved status
    if (targetStatus === 'Resolved' && (!resolutionNote || !resolutionNote.trim())) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'RESOLUTION_NOTE_REQUIRED',
          message: 'A non-empty resolutionNote is required to mark an issue as Resolved.',
        },
      });
    }

    // 6. Build conditional update doc
    const updateDoc = {
      status: targetStatus,
    };

    if (targetStatus === 'Resolved') {
      updateDoc.resolvedAt = new Date();
      updateDoc.resolutionNote = resolutionNote.trim();
    }

    if (targetStatus === 'Closed') {
      updateDoc.closedAt = new Date();
    }

    // 7. Atomic optimistic lock: update conditioned on current status to prevent race conditions
    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: id, status: currentStatus },
      { $set: updateDoc },
      { new: true }
    ).populate('assignedTeam');

    if (!updatedIssue) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONCURRENT_UPDATE_CONFLICT',
          message:
            'Issue status was modified concurrently by another process. Please refresh and retry.',
        },
      });
    }

    // 8. Append audit log in StatusHistory
    const auditNote =
      resolutionNote?.trim() ||
      note?.trim() ||
      `Status changed from ${currentStatus} to ${targetStatus}`;

    await StatusHistory.create({
      issue: updatedIssue._id,
      kind: 'status',
      from: currentStatus,
      to: targetStatus,
      actor: req.user?._id || null,
      note: auditNote,
    });

    return res.status(200).json({
      success: true,
      message: `Issue status updated to ${targetStatus}.`,
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};
