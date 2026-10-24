import mongoose from 'mongoose';

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
      enum: ['Reported', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Reopened'],
      default: 'Reported',
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
    priorityBand: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
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
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

issueSchema.index({ building: 1, category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

export const Issue = mongoose.model('Issue', issueSchema);
