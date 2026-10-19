import { useRef, useState } from 'react';
import { Camera, UploadCloud, X, AlertCircle, Image as ImageIcon } from 'lucide-react';

/**
 * System Constraints
 */
export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 3;
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 5MB in bytes
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * PhotoUploader Component
 * 
 * Props:
 * @param {Array} photos - Array of photo objects currently attached: [{ id, file, previewUrl }]
 * @param {function} onPhotosChange - Parent callback function to update photos array
 * @param {string} error - Optional validation error message from parent
 */
export default function PhotoUploader({ photos = [], onPhotosChange, error }) {
  // Reference to the hidden native HTML <input type="file" />
  const fileInputRef = useRef(null);

  // Local state to display file-validation errors (e.g., file too big, invalid format)
  const [localError, setLocalError] = useState('');

  // Drag-over visual highlight state
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Validate an individual file:
   * 1. Checks MIME type (JPG, PNG, WebP)
   * 2. Checks file size (< 5MB)
   * Returns an error string or null if valid.
   */
  const validateFile = (file) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `"${file.name}" is not supported. Please upload JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      return `"${file.name}" is too large (${sizeInMB}MB). Maximum file size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  /**
   * Process newly selected or dropped files
   */
  const handleFilesAdded = (incomingFiles) => {
    setLocalError('');

    if (!incomingFiles || incomingFiles.length === 0) return;

    // Check available slots
    const availableSlots = MAX_PHOTOS - photos.length;
    if (availableSlots <= 0) {
      setLocalError(`You have already attached the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    // Convert FileList to array and take only what fits in available slots
    const filesToProcess = Array.from(incomingFiles).slice(0, availableSlots);
    const validNewPhotos = [];

    for (const file of filesToProcess) {
      const errorMsg = validateFile(file);
      if (errorMsg) {
        setLocalError(errorMsg);
        return; // Stop processing and alert the user
      }

      // Generate a client-side blob URL for instant preview without uploading yet!
      validNewPhotos.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file, // Keep raw File object for future backend FormData upload
        previewUrl: URL.createObjectURL(file), // Blob URL for <img>
      });
    }

    // Notify parent of updated photos array
    onPhotosChange([...photos, ...validNewPhotos]);

    // Reset file input value so user can re-select the same file if deleted and re-added
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove a photo by index
   */
  const handleRemovePhoto = (indexToRemove) => {
    setLocalError('');

    // Revoke the blob URL to free up browser memory (prevents memory leaks)
    URL.revokeObjectURL(photos[indexToRemove].previewUrl);

    // Filter out the selected photo
    const updatedPhotos = photos.filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updatedPhotos);
  };

  /**
   * Trigger native file picker when custom upload card is clicked
   */
  const handleBoxClick = () => {
    if (photos.length >= MAX_PHOTOS) {
      setLocalError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Drag & Drop event handlers
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const activeError = error || localError;

  return (
    <div className="w-full space-y-3">
      {/* Header with mandatory indicator and counter badge */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-ink">
            Photo Evidence <span className="text-danger">* (Required)</span>
          </label>
          <p className="text-xs text-muted">
            Attach at least 1 clear photo (max {MAX_PHOTOS}). JPG, PNG, WebP up to {MAX_FILE_SIZE_MB}MB each.
          </p>
        </div>

        {/* Counter Badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            photos.length >= MIN_PHOTOS
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-canvas text-muted border border-line'
          }`}
        >
          {photos.length} / {MAX_PHOTOS} photos
        </span>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFilesAdded(e.target.files)}
        className="hidden"
        aria-hidden="true"
      />

      {/* Custom Drag-and-Drop Upload Area */}
      {photos.length < MAX_PHOTOS && (
        <div
          onClick={handleBoxClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-150 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
              : 'border-line-strong bg-surface hover:border-brand-500 hover:bg-surface-muted'
          }`}
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Camera size={22} />
          </div>
          <p className="text-sm font-medium text-ink">
            <span className="text-brand-600 font-semibold underline underline-offset-2">
              Click to take/upload photo
            </span>{' '}
            or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted">
            Min {MIN_PHOTOS} photo required • Max {MAX_FILE_SIZE_MB}MB each
          </p>
        </div>
      )}

      {/* Thumbnail Previews Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-1">
          {photos.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-video overflow-hidden rounded-lg border border-line bg-canvas shadow-sm"
            >
              <img
                src={item.previewUrl}
                alt={`Photo proof ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Photo Index Tag */}
              <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Photo {index + 1}
              </span>

              {/* Remove Photo Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening file dialog
                  handleRemovePhoto(index);
                }}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-white transition-colors hover:bg-danger focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Validation or Size Error Message */}
      {activeError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger" role="alert">
          <AlertCircle size={14} className="shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
}