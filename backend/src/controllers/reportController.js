import mongoose from 'mongoose';
import fs from 'fs';
import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';
import { Category } from '../models/Category.js';
import { Building } from '../models/Building.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';

/**
 * Helper: Escapes special characters in string for safe RegExp queries
 */
const escapeRegex = (str) => {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Helper: Generates a human-friendly ticket ID (e.g. CF-72941)
 */
const generateRefId = () => {
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `CF-${digits}`;
};

/**
 * @desc    Find active issues in the same building & category for duplicate interception
 * @route   GET /api/v1/issues/similar
 * @access  Public
 */
export const getSimilarIssues = async (req, res, next) => {
  try {
    const bldInput = req.query.buildingId || req.query.building;
    const catInput = req.query.categoryId || req.query.category;

    if (!bldInput || !catInput) {
      return res.status(400).json({
        success: false,
        message: 'Both building and category query parameters are required.',
      });
    }

    // Resolve building ID from string or ObjectId
    let resolvedBuildingId = bldInput;
    if (!mongoose.Types.ObjectId.isValid(bldInput)) {
      const cleanBld = String(bldInput).trim();
      const bldDoc = await Building.findOne({
        $or: [
          { name: cleanBld },
          { name: new RegExp('^' + escapeRegex(cleanBld) + '$', 'i') },
          { code: new RegExp('^' + escapeRegex(cleanBld) + '$', 'i') },
        ],
      });
      if (bldDoc) resolvedBuildingId = bldDoc._id;
    }

    // Resolve category ID from string key/name or ObjectId
    let resolvedCategoryId = catInput;
    if (!mongoose.Types.ObjectId.isValid(catInput)) {
      const cleanCat = String(catInput).trim();
      const catDoc = await Category.findOne({
        $or: [
          { key: cleanCat.toLowerCase() },
          { name: cleanCat },
          { name: new RegExp('^' + escapeRegex(cleanCat) + '$', 'i') },
        ],
      });
      if (catDoc) resolvedCategoryId = catDoc._id;
    }

    // If building or category not in DB yet, there are 0 duplicates
    if (
      !mongoose.Types.ObjectId.isValid(resolvedBuildingId) ||
      !mongoose.Types.ObjectId.isValid(resolvedCategoryId)
    ) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Only active (unresolved) issues can be upvoted as duplicates
    const activeStatuses = ['Reported', 'Assigned', 'In Progress'];

    const similarIssues = await Issue.find({
      building: resolvedBuildingId,
      category: resolvedCategoryId,
      status: { $in: activeStatuses },
    })
      .select('refId title locationText photos status reportCount createdAt')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return res.status(200).json({
      success: true,
      count: similarIssues.length,
      data: similarIssues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new issue with optional photo evidence files (0-3 photos)
 * @route   POST /api/v1/issues
 * @access  Public / Student
 */
export const createIssue = async (req, res, next) => {
  let uploadedFilePaths = [];

  try {
    // Step 1: Collect uploaded photos if any
    if (req.files && req.files.length > 0) {
      uploadedFilePaths = req.files.map((file) => file.path);
    }

    const photoUrls =
      req.files && req.files.length > 0
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];

    // Step 2: Validate required form inputs
    const {
      title,
      category,
      building,
      campus,
      locationText,
      description,
      userId,
    } = req.body;

    if (!title || !category || !building || !campus || !locationText || !description) {
      throw new Error('MISSING_REQUIRED_FIELDS');
    }

    console.log('[createIssue] Incoming body:', req.body);
    console.log('[createIssue] Uploaded files count:', req.files?.length || 0);

    // Step 3: Safely resolve Category (by ID, exact name, or safe regex)
    let resolvedCategoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const cleanCat = String(category).trim();
      let catDoc = await Category.findOne({
        $or: [
          { key: cleanCat.toLowerCase() },
          { name: cleanCat },
          { name: new RegExp('^' + escapeRegex(cleanCat) + '$', 'i') },
        ],
      });

      if (!catDoc) {
        try {
          console.log(`[createIssue] Category "${category}" not found in DB. Auto-creating...`);
          catDoc = await Category.create({
            name: cleanCat,
            key: cleanCat.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            description: cleanCat,
          });
        } catch (err) {
          catDoc = await Category.findOne({
            $or: [{ key: cleanCat.toLowerCase() }, { name: cleanCat }],
          });
        }
      }

      if (catDoc) resolvedCategoryId = catDoc._id;
    }

    // Step 4: Safely resolve Building (handles names with parentheses, slashes, ampersands)
    let resolvedBuildingId = building;
    if (!mongoose.Types.ObjectId.isValid(building)) {
      const cleanBuilding = String(building).trim();
      let bldDoc = await Building.findOne({
        $or: [
          { name: cleanBuilding },
          { name: new RegExp('^' + escapeRegex(cleanBuilding) + '$', 'i') },
          { code: new RegExp('^' + escapeRegex(cleanBuilding) + '$', 'i') },
        ],
      });

      if (!bldDoc) {
        try {
          console.log(`[createIssue] Building "${building}" not found in DB. Auto-creating...`);
          const code =
            (cleanBuilding.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 6) || 'BLD') +
            `-${Math.floor(100 + Math.random() * 900)}`;
          bldDoc = await Building.create({
            name: cleanBuilding,
            code,
            campus: campus ? campus.toLowerCase() : 'north',
          });
        } catch (err) {
          bldDoc = await Building.findOne({ name: cleanBuilding });
        }
      }

      if (bldDoc) resolvedBuildingId = bldDoc._id;
    }

    if (
      !mongoose.Types.ObjectId.isValid(resolvedBuildingId) ||
      !mongoose.Types.ObjectId.isValid(resolvedCategoryId)
    ) {
      throw new Error('INVALID_ID_FORMAT');
    }

    // Step 5: Resolve reporter attribution
    let reporterId = req.user?._id;
    if (!reporterId && userId && mongoose.Types.ObjectId.isValid(userId)) {
      reporterId = userId;
    }
    if (!reporterId) {
      const anyUser = await User.findOne({ role: 'student' });
      reporterId = anyUser ? anyUser._id : new mongoose.Types.ObjectId();
    }

    // Step 6: Create and save Issue (clean model, reportCount-driven, NO priority scores)
    const newIssue = new Issue({
      refId: generateRefId(),
      title: title.trim(),
      category: resolvedCategoryId,
      building: resolvedBuildingId,
      campus: campus.toLowerCase(),
      locationText: locationText.trim(),
      description: description.trim(),
      photos: photoUrls,
      createdBy: reporterId,
      reportCount: 1,
      status: 'Reported',
    });

    const savedIssue = await newIssue.save();

    // Step 7: Record submission report
    await Report.create({
      issue: savedIssue._id,
      reporter: reporterId,
      note: 'Initial reporter submission',
      photos: photoUrls,
    });

    // Step 8: Return HTTP 201 Created
    return res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: {
        _id: savedIssue._id,
        refId: savedIssue.refId,
        title: savedIssue.title,
        status: savedIssue.status,
        reportCount: savedIssue.reportCount,
        photos: savedIssue.photos,
        createdAt: savedIssue.createdAt,
      },
    });
  } catch (error) {
    console.error('[createIssue error]:', error);

    // Rollback uploaded photos if MongoDB save fails
    uploadedFilePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('Failed to unlink orphaned file:', filePath, unlinkErr);
        }
      }
    });

    if (error.message === 'MISSING_REQUIRED_FIELDS') {
      return res.status(400).json({
        success: false,
        message: 'All issue details (title, category, building, campus, location, description) are required.',
      });
    }

    if (error.message === 'INVALID_ID_FORMAT') {
      return res.status(400).json({
        success: false,
        message: 'Invalid building or category identifier format.',
      });
    }

    next(error);
  }
};

/**
 * @desc    Upvote / Re-report an existing issue ("I'm facing this too")
 * @route   POST /api/v1/issues/:id/reports
 * @access  Public / Student
 */
export const upvoteIssue = async (req, res, next) => {
  try {
    const { id: issueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue identifier format.',
      });
    }

    const existingIssue = await Issue.findById(issueId);

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    if (['Resolved', 'Closed'].includes(existingIssue.status)) {
      return res.status(400).json({
        success: false,
        message: 'This issue has already been resolved or closed.',
      });
    }

    const reporterId = req.user?._id || req.body.userId || new mongoose.Types.ObjectId();
    const note = req.body.note ? req.body.note.trim() : 'Upvoted by affected student';

    try {
      await Report.create({
        issue: existingIssue._id,
        reporter: reporterId,
        note,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'You have already reported or upvoted this issue.',
        });
      }
      throw createErr;
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      existingIssue._id,
      {
        $inc: {
          reportCount: 1,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Issue upvoted successfully.',
      data: {
        issueId: updatedIssue._id,
        refId: updatedIssue.refId,
        reportCount: updatedIssue.reportCount,
        status: updatedIssue.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue status, resolution notes, and assign maintenance teams
 * @route   PATCH /api/v1/issues/:id/status
 * @route   POST /api/v1/issues/:id/assign
 * @access  Staff / Admin / Public
 */
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote, note } = req.body;
    const incomingTeam = req.body.assignedTeam || req.body.team || req.body.teamId;

    if (!status && !incomingTeam && resolutionNote === undefined && note === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_UPDATE_DATA',
          message: 'At least one field (status, assignedTeam, resolutionNote) must be provided.',
        },
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { refId: id };

    const issue = await Issue.findOne(query);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ISSUE_NOT_FOUND',
          message: 'Issue not found with the provided identifier.',
        },
      });
    }

    // Step 1: Assign maintenance team if provided
    if (incomingTeam) {
      let teamId = incomingTeam;
      if (!mongoose.Types.ObjectId.isValid(incomingTeam)) {
        const cleanTeamName = String(incomingTeam).trim();
        let teamDoc = await Team.findOne({
          $or: [
            { name: cleanTeamName },
            { name: new RegExp('^' + escapeRegex(cleanTeamName) + '$', 'i') },
          ],
        });
        if (!teamDoc) {
          try {
            console.log(`[updateIssueStatus] Team "${cleanTeamName}" not found in DB. Auto-creating...`);
            teamDoc = await Team.create({ name: cleanTeamName });
          } catch (teamErr) {
            teamDoc = await Team.findOne({ name: cleanTeamName });
          }
        }
        if (teamDoc) {
          teamId = teamDoc._id;
        }
      }
      issue.assignedTeam = teamId;
      // Auto-transition to Assigned if currently Reported
      if (issue.status === 'Reported' && !status) {
        issue.status = 'Assigned';
      }
    }

    // Step 2: Update status if provided
    if (status) {
      const validStatuses = [
        'Reported',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Reopened',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
        });
      }

      issue.status = status;
      if (status === 'Resolved') {
        issue.resolvedAt = new Date();
      }
      if (status === 'Closed') {
        issue.closedAt = new Date();
      }
    }

    // Step 3: Update resolution notes if provided
    const noteText = resolutionNote !== undefined ? resolutionNote : note;
    if (noteText !== undefined) {
      issue.resolutionNote = String(noteText).trim();
    }

    // Step 4: Persist changes to MongoDB Atlas
    await issue.save();

    // Step 5: Populate relations for rich response
    if (mongoose.models.Team) await issue.populate('assignedTeam', 'name');
    if (mongoose.models.Building) await issue.populate('building', 'name campus');
    if (mongoose.models.Category) await issue.populate('category', 'name label');

    return res.status(200).json({
      success: true,
      message: `Issue updated successfully.`,
      data: {
        id: issue._id,
        _id: issue._id,
        refId: issue.refId,
        status: issue.status,
        assignedTeam: issue.assignedTeam?.name || 'Unassigned',
        resolutionNote: issue.resolutionNote,
        resolvedAt: issue.resolvedAt,
        updatedAt: issue.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
