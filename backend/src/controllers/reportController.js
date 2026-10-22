import mongoose from 'mongoose';
import { Issue } from '../models/Issue.js';

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
