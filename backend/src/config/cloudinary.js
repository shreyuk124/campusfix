import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

let isConfigured = false;

function ensureCloudinary() {
  if (isConfigured) return true;

  const hasConfig = Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
      process.env.CLOUDINARY_URL
  );

  if (!hasConfig) return false;

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  isConfigured = true;
  return true;
}

/**
 * Uploads a local file to Cloudinary with automatic optimization.
 * Falls back to returning the local /uploads path if Cloudinary is not configured.
 *
 * @param {string} localFilePath - Path to file on disk (e.g. backend/uploads/photo-123.jpg)
 * @param {string} filename - Base filename
 * @returns {Promise<string>} Permanent HTTPS URL or local /uploads/filename
 */
export async function uploadToCloudinary(localFilePath, filename) {
  const ready = ensureCloudinary();
  if (!ready) {
    console.warn('[Cloudinary] Keys missing in process.env, saving locally to /uploads');
    return `/uploads/${filename}`;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'campusfix/issues',
      public_id: filename.replace(/\.[^/.]+$/, ''),
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Clean up temporary local file after successful cloud upload
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (cleanupErr) {
        console.warn('[Cloudinary] Could not delete local temp file:', cleanupErr.message);
      }
    }

    return result.secure_url;
  } catch (error) {
    console.warn('[Cloudinary] Upload failed, falling back to local file:', error.message);
    return `/uploads/${filename}`;
  }
}

export { cloudinary };
