import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ['status', 'assignment', 'merge', 'safety'],
      default: 'status',
    },
    from: {
      type: String,
      default: null,
    },
    to: {
      type: String,
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

statusHistorySchema.index({ issue: 1, createdAt: 1 });

export const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);
export default StatusHistory;
