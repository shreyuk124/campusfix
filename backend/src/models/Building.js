import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Building name is required'],
      unique: true,
      trim: true,
    },
    campus: {
      type: String,
      enum: ['north', 'south'],
      required: false,
      default: null,
    },
    floors: {
      type: Number,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Building = mongoose.model('Building', buildingSchema);
export default Building;
