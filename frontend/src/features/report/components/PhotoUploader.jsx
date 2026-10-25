import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle, Loader2 } from 'lucide-react';

/**
 * System Constraints
 */
export const MIN_PHOTOS = 0;
export const MAX_PHOTOS = 3;
export const MAX_FILE_SIZE_MB = 10; // Generous 10MB limit for modern mobile camera sensors
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/**
 * Automatically compress and normalize camera photos to standard JPG (< 2MB)
 * Prevents mobile camera photos (which are often 8-15MB) from getting rejected.
 */
const compressImage = (file) => {
  return new Promise((resolve) => {
    // If not an image, resolve as-is
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Max dimensions for mobile campus report photos
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const compressedFile = new File([blob], cleanName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to raw file if image loading fails
    };

    img.src = objectUrl;
  });
};

/**
 * PhotoUploader Component
 * 
 * Props:
 * @param {Array} photos - Array of photo objects currently attached: [{ id, file, previewUrl }]
 * @param {function} onPhotosChange - Parent callback function to update photos array
 * @param {string} error - Optional validation error message from parent
 */
export default function PhotoUploader({ photos = [], onPhotosChange, error }) {
  // Reference for file picker (gallery/files)
  const galleryInputRef = useRef(null);
  // Reference for native camera capture
  const cameraInputRef = useRef(null);

  // Local state to display file-validation errors
  const [localError, setLocalError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drag-over visual highlight state
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Process newly selected or dropped files
   */
  const handleFilesAdded = async (incomingFiles) => {
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
    setIsProcessing(true);

    try {
      for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
          setLocalError(`"${file.name}" is too large (${sizeInMB}MB). Maximum file size is ${MAX_FILE_SIZE_MB}MB.`);
          setIsProcessing(false);
          return;
        }

        try {
          // Compress and normalize to JPEG
          const processedFile = await compressImage(file);

          validNewPhotos.push({
            id: `${processedFile.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            file: processedFile,
            previewUrl: URL.createObjectURL(processedFile),
          });
        } catch (err) {
          console.warn('Compression error, using raw file:', err);
          validNewPhotos.push({
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            file,
            previewUrl: URL.createObjectURL(file),
          });
        }
      }

      // Notify parent of updated photos array
      onPhotosChange([...photos, ...validNewPhotos]);
    } finally {
      setIsProcessing(false);
      // Reset file input values
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  /**
   * Remove a photo by index
   */
  const handleRemovePhoto = (indexToRemove) => {
    setLocalError('');

    // Revoke blob URL to free up memory
    if (photos[indexToRemove]?.previewUrl) {
      URL.revokeObjectURL(photos[indexToRemove].previewUrl);
    }

    const updatedPhotos = photos.filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updatedPhotos);
  };

  /**
   * Trigger native camera directly
   */
  const handleCameraClick = (e) => {
    e.stopPropagation();
    if (photos.length >= MAX_PHOTOS) {
      setLocalError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  /**
   * Trigger gallery / file picker
   */
  const handleGalleryClick = (e) => {
    e.stopPropagation();
    if (photos.length >= MAX_PHOTOS) {
      setLocalError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
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
      {/* Header with optional indicator and counter badge */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-ink">
            Photo Evidence <span className="text-muted font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-muted">
            Attach up to {MAX_PHOTOS} photos. Take a live picture or pick from gallery.
          </p>
        </div>

        {/* Counter Badge */}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            photos.length > 0
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-canvas text-muted border border-line'
          }`}
        >
          {photos.length} / {MAX_PHOTOS} photos
        </span>
      </div>

      {/* Hidden Native Input for Gallery / File Picker */}
      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFilesAdded(e.target.files)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Hidden Native Input for Direct Mobile Camera Capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFilesAdded(e.target.files)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Custom Upload Area */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all duration-150 ${
            isDragging
              ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
              : 'border-line-strong bg-surface hover:border-brand-500 hover:bg-surface-muted'
          }`}
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            {isProcessing ? (
              <Loader2 size={22} className="animate-spin text-brand-600" />
            ) : (
              <Camera size={22} />
            )}
          </div>

          <p className="text-sm font-semibold text-ink">
            {isProcessing ? 'Optimizing photo...' : 'Add Photo Evidence'}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Up to {MAX_PHOTOS} photos • Max {MAX_FILE_SIZE_MB}MB each
          </p>

          {/* Action Buttons: Take Photo (Camera) & Gallery */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95 disabled:opacity-50"
            >
              <Camera size={15} />
              Take Photo
            </button>

            <button
              type="button"
              onClick={handleGalleryClick}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-canvas hover:border-brand-400 active:scale-95 disabled:opacity-50"
            >
              <ImageIcon size={15} className="text-brand-600" />
              Choose from Gallery
            </button>
          </div>
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
                  e.stopPropagation();
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
