// features/issues/components/PhotoGallery.jsx - Photo gallery with accessible Lightbox modal
import { useState } from 'react';
import { Image, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

export function PhotoGallery({ photos = [], className = '' }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  if (!photos || photos.length === 0) return null;

  const totalPhotos = photos.length;

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <Image size={14} className="text-brand-600" />
        <span>Photo Evidence ({totalPhotos} attached)</span>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((url, idx) => (
          <button
            key={url + idx}
            type="button"
            onClick={() => setSelectedPhotoIndex(idx)}
            className="group relative aspect-4/3 w-full overflow-hidden rounded-xl border border-line bg-surface-muted shadow-xs transition-all hover:border-brand-500 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={`View photo ${idx + 1} of ${totalPhotos} in full screen`}
          >
            <img
              src={url}
              alt={`Photo ${idx + 1} of ${totalPhotos} attached by reporter`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={20} className="drop-shadow-md" />
            </div>
            <span className="absolute bottom-2 left-2 rounded-md bg-ink/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
              Photo {idx + 1}
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close photo preview"
          >
            <X size={20} />
          </button>

          {/* Navigation arrows if multiple photos */}
          {totalPhotos > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Current Photo Display */}
          <div
            className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-xl bg-black/40 p-2 shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex]}
              alt={`Photo ${selectedPhotoIndex + 1} of ${totalPhotos} attached by reporter`}
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain mx-auto"
            />
            <p className="mt-2 text-center text-xs text-white/80">
              Photo {selectedPhotoIndex + 1} of {totalPhotos}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoGallery;
