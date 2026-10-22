import mongoose from 'mongoose';
import fs from 'fs';
import { Issue } from '../models/Issue.js';
import { Report } from '../models/Report.js';

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
    // Step 1: Extract building and category from query parameters
    const { buildingId, categoryId } = req.query;

    // Step 2: Ensure both required query parameters are provided
    if (!buildingId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Both buildingId and categoryId query parameters are required.',
      });
    }

    // Step 3: Validate MongoDB ObjectId formats to prevent cast errors
    const isValidBuilding = mongoose.Types.ObjectId.isValid(buildingId);
    const isValidCategory = mongoose.Types.ObjectId.isValid(categoryId);

    if (!isValidBuilding || !isValidCategory) {
      return res.status(400).json({
        success: false,
        message: 'Invalid buildingId or categoryId format.',
      });
    }

    // Step 4: Filter by active statuses only (resolved issues are not considered duplicates)
    const activeStatuses = ['Reported', 'Assigned', 'In Progress'];

    // Step 5: Query issues using the compound index { building: 1, category: 1, status: 1 }
    const similarIssues = await Issue.find({
      building: buildingId,
      category: categoryId,
      status: { $in: activeStatuses },
    })
      .select('refId title locationText photos status reportCount createdAt') // only fetch fields needed for duplicate cards
      .sort({ createdAt: -1 }) // newest issues first
      .limit(5) // keep list concise for student preview
      .lean(); // return plain JS objects for lower memory usage and speed

    // Step 6: Send back matching issues
    return res.status(200).json({
      success: true,
      count: similarIssues.length,
      data: similarIssues,
    });
  } catch (error) {
    // Forward unexpected errors to the global error middleware
    next(error);
  }
};

/**
 * @desc    Create a new issue with 1-3 photo evidence files
 * @route   POST /api/v1/issues
 * @access  Public / Student
 */
export const createIssue = async (req, res, next) => {
  // Track disk paths for rollback in case MongoDB or downstream operations fail
  let uploadedFilePaths = [];

  try {
    // Step 1: File Verification - Ensure at least 1 photo was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least 1 photo is required as evidence.',
      });
    }

    // Capture disk paths from Multer so we can delete them if MongoDB fails
    uploadedFilePaths = req.files.map((file) => file.path);

    // Transform disk filenames into client-consumable URL paths
    const photoUrls = req.files.map((file) => `/uploads/${file.filename}`);

    // Step 2: Form Body Extraction & Validation
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

    // Step 3: Database Identifier Validation
    if (
      !mongoose.Types.ObjectId.isValid(building) ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      throw new Error('INVALID_ID_FORMAT');
    }

    // Fallback user attribution: authenticated user -> body user -> newly generated mock ID
    const reporterId = req.user?._id || userId || new mongoose.Types.ObjectId();

    // Step 4: Instantiate & Save Issue Document
    const newIssue = new Issue({
      refId: generateRefId(),
      title: title.trim(),
      category,
      building,
      campus: campus.toLowerCase(),
      locationText: locationText.trim(),
      description: description.trim(),
      photos: photoUrls,
      createdBy: reporterId,
      reportCount: 1,
      status: 'Reported',
      priorityScore: 10, // Base default score for newly submitted complaints
      priorityBand: 'Low',
    });

    const savedIssue = await newIssue.save();

    // Step 5: Seed the Report Collection (Anti-Self-Upvote Lock)
    await Report.create({
      issue: savedIssue._id,
      reporter: reporterId,
      note: 'Initial reporter submission',
      photos: photoUrls,
    });

    // Step 6: Send Clean 201 Response
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
    // Step 7: The Orphan File Rollback - clean up uploaded files if DB save failed
    uploadedFilePaths.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('Failed to unlink orphaned file:', filePath, unlinkErr);
        }
      }
    });

    // Handle known validation errors with clean 400 Bad Request responses
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

    // Forward unexpected exceptions to centralized error middleware
    next(error);
  }
};
