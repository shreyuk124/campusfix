import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    campus: {
      type: String,
      enum: ['north', 'south'],
      default: 'north',
    },
  },
  { timestamps: true }
);

export const Building = mongoose.models.Building || mongoose.model('Building', buildingSchema);
export default Building;
