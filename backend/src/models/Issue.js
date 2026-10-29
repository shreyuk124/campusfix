import mongoose from 'mongoose';

/**
 * Issue Schema
 * 
 * Represents a student-reported campus maintenance or safety problem.
 * Priority scores have been removed for a clean, reportCount-driven model.
 */
const issueSchema = new mongoose.Schema(
  {
    refId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building is required'],
    },
    campus: {
      type: String,
      enum: ['north', 'south'],
      required: true,
    },
    locationText: {
      type: String,
      required: [true, 'Specific location / room / floor is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true,
    },
    photos: {
      type: [String],
      validate: [
        (val) => !val || val.length <= 3,
        'A maximum of 3 photos can be attached as evidence',
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'In Progress', 'Resolved'],
      default: 'Reported',
    },
    reportCount: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

issueSchema.index({ building: 1, category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

export const Issue = mongoose.model('Issue', issueSchema);
