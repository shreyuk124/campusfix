import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

reportSchema.index({ issue: 1, reporter: 1 }, { unique: true });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
