import { useState } from 'react';
import LocationPicker from './components/LocationPicker';
import CategorySelector from './components/CategorySelector';
import PhotoUploader from './components/PhotoUploader';

/**
 * ReportPage Component
 * 
 * Master container for the issue reporting flow.
 * Holds all form state at the top level (Controlled State pattern).
 */
export default function ReportPage() {
  // 1. Location state (Campus, Building, Exact Spot)
  const [location, setLocation] = useState({
    campus: '',
    building: '',
    specificLocation: '',
  });

  // 2. Category state (Safety, Electrical, Plumbing, etc.)
  const [category, setCategory] = useState('');

  // 3. Mandatory Photos state (Array of { id, file, previewUrl })
  const [photos, setPhotos] = useState([]);

  // 4. Description & optional suggestions
  const [description, setDescription] = useState('');

  // 5. Validation errors state
  const [errors, setErrors] = useState({});

  return (
    <div className="mx-auto max-w-form space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Report an Issue
        </h1>
        <p className="mt-1 text-sm text-muted">
          Submit maintenance and safety complaints across campus with mandatory photo evidence.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card space-y-8">
        {/* Step 1: 3-Level Cascading Location Picker */}
        <section>
          <LocationPicker
            campus={location.campus}
            building={location.building}
            specificLocation={location.specificLocation}
            onLocationChange={(newLocation) => {
              setLocation(newLocation);
              setErrors((prev) => ({
                ...prev,
                campus: '',
                building: '',
                specificLocation: '',
              }));
            }}
            errors={errors}
          />
        </section>

        <hr className="border-line" />

        {/* Step 2: Category Selector */}
        <section>
          <CategorySelector
            value={category}
            onChange={(newCategory) => {
              setCategory(newCategory);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            error={errors.category}
          />
        </section>

        <hr className="border-line" />

        {/* Step 3: Mandatory Photo Uploader (Min 1, Max 3) */}
        <section>
          <PhotoUploader
            photos={photos}
            onPhotosChange={(newPhotos) => {
              setPhotos(newPhotos);
              setErrors((prev) => ({ ...prev, photos: '' }));
            }}
            error={errors.photos}
          />
        </section>

        <hr className="border-line" />

        {/* Step 4: Problem Description Textarea */}
        <section className="space-y-1.5">
          <label htmlFor="problem-desc" className="block text-sm font-semibold text-ink">
            Problem Description <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-muted">
            Provide details about the issue to help maintenance staff resolve it quickly.
          </p>
          <textarea
            id="problem-desc"
            rows={4}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            placeholder="Describe what is broken, how severe it is, or any safety concerns..."
            className="block w-full rounded-md border border-line-strong bg-surface p-3 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.description && (
            <p className="text-xs font-medium text-danger">{errors.description}</p>
          )}
        </section>

        {/* Live State Visualizer (Educational tool for evaluation) */}
        <div className="rounded-lg bg-canvas p-3.5 text-xs text-muted space-y-1">
          <div className="font-semibold text-ink">Form State Debugger:</div>
          <div>
            Campus / Building:{' '}
            <span className="font-mono font-bold text-brand-600">
              {location.campus || 'none'} → {location.building || 'none'}
            </span>
          </div>
          <div>
            Category:{' '}
            <span className="font-mono font-bold text-brand-600">
              {category || 'none'}
            </span>
          </div>
          <div>
            Photos Attached:{' '}
            <span className="font-mono font-bold text-brand-600">
              {photos.length} / 3 ({photos.length >= 1 ? 'Valid ✓' : 'Invalid ✗ (Min 1)'})
            </span>
          </div>
          <div>
            Description:{' '}
            <span className="font-mono font-bold text-brand-600">
              {description ? `${description.length} chars` : 'empty'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}