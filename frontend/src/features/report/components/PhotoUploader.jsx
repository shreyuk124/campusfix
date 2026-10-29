import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

/**
 * System Limits for Photo Evidence
 */
export const MIN_PHOTOS = 0;
export const MAX_PHOTOS = 3;
export const MAX_FILE_SIZE_MB = 25; // 25MB limit supported by backend
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * PhotoUploader Component
 * 
 * Clean, modular component providing:
 * 1. "Take Photo" button -> Opens phone camera directly using capture="environment"
 * 2. "Choose from Gallery" button -> Opens phone photo library
 * 3. Instant thumbnail preview & removal
 * 
 * @param {Array} photos - Current array of photo objects: [{ id, file, previewUrl }]
 * @param {Function} onPhotosChange - Notifies parent component when photos update
 * @param {String} error - Validation error from parent
 */
export default function PhotoUploader({ photos = [], onPhotosChange, error }) {
  // Input ref dedicated to live camera capture
  const cameraInputRef = useRef(null);

  // Input ref dedicated to gallery photo selection
  const galleryInputRef = useRef(null);

  // Local state for file validation errors
  const [localError, setLocalError] = useState('');

  /**
   * Process selected files from camera or gallery
   */
  const handleFilesAdded = (incomingFileList) => {
    setLocalError('');

    if (!incomingFileList || incomingFileList.length === 0) return;

    // Check how many slots are remaining
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setLocalError(`You can attach a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    // Process files within available slots
    const filesToProcess = Array.from(incomingFileList).slice(0, remainingSlots);
    const newValidPhotos = [];
    let completed = 0;

    for (const file of filesToProcess) {
      // Check file size (< 25MB)
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        setLocalError(`"${file.name}" is ${sizeInMB}MB. Maximum allowed is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      const photoId = `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Read file into persistent Base64 Data URL so Android Chrome doesn't drop temporary camera cache
      const reader = new FileReader();
      reader.onload = (event) => {
        newValidPhotos.push({
          id: photoId,
          file,
          previewUrl: event.target.result,
        });
        completed++;
        if (completed === filesToProcess.length) {
          onPhotosChange([...photos, ...newValidPhotos]);
        }
      };
      reader.onerror = () => {
        newValidPhotos.push({
          id: photoId,
          file,
          previewUrl: URL.createObjectURL(file),
        });
        completed++;
        if (completed === filesToProcess.length) {
          onPhotosChange([...photos, ...newValidPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove a photo by index
   */
  const handleRemovePhoto = (indexToRemove) => {
    setLocalError('');

    // Free memory of the preview URL
    if (photos[indexToRemove]?.previewUrl) {
      URL.revokeObjectURL(photos[indexToRemove].previewUrl);
    }

    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onPhotosChange(updated);
  };


  const activeError = error || localError;

  return (
    <div className="w-full space-y-3">
      {/* Header and Photo Counter */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-ink">
            Photo Evidence <span className="text-muted font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-muted">
            Attach up to {MAX_PHOTOS} photos. Take a live picture or pick from gallery.
          </p>
        </div>

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

      {/* 1. Dedicated Camera Input (capture="environment" forces camera on mobile) */}
      <input
        id="camera-photo-input"
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onClick={(e) => {
          e.target.value = '';
        }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(e.target.files);
          }
        }}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 2. Dedicated Gallery Input (standard file picker) */}
      <input
        id="gallery-photo-input"
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/*"
        onClick={(e) => {
          e.target.value = '';
        }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(e.target.files);
          }
        }}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Upload Buttons Box */}
      {photos.length < MAX_PHOTOS && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-strong bg-surface p-5 text-center transition-all duration-150 hover:border-brand-500 hover:bg-surface-muted">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Camera size={22} />
          </div>

          <p className="text-sm font-semibold text-ink">Add Photo Evidence</p>
          <p className="mt-0.5 text-xs text-muted">
            Up to {MAX_PHOTOS} photos • Max {MAX_FILE_SIZE_MB}MB each
          </p>

          {/* Action Buttons: Take Photo (Camera) & Gallery */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
            <label
              htmlFor="camera-photo-input"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95 cursor-pointer"
            >
              <Camera size={15} />
              <span>Take Photo</span>
            </label>

            <label
              htmlFor="gallery-photo-input"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-canvas hover:border-brand-400 active:scale-95 cursor-pointer"
            >
              <ImageIcon size={15} className="text-brand-600" />
              <span>Choose from Gallery</span>
            </label>
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

              <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/75 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Photo {index + 1}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto(index);
                }}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-white transition-colors hover:bg-danger focus:outline-none cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Validation Message */}
      {activeError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-danger" role="alert">
          <AlertCircle size={14} className="shrink-0" />
          <span>{activeError}</span>
        </p>
      )}
    </div>
  );
}
