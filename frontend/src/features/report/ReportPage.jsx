import { useState } from 'react';
import LocationPicker from './components/LocationPicker';
import CategorySelector from './components/CategorySelector';

/**
 * ReportPage Component
 * 
 * The main container for the issue reporting flow.
 * Holds all form state at the top level (Controlled State pattern).
 */
export default function ReportPage() {
  // 1. Location state: stored as an object to group related fields together
  const [location, setLocation] = useState({
    campus: '',
    building: '',
    specificLocation: '',
  });

  // 2. Category state: id of selected category
  const [category, setCategory] = useState('');

  // 3. Validation errors state
  const [errors, setErrors] = useState({});

  return (
    <div className="mx-auto max-w-form space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Report an Issue
        </h1>
        <p className="mt-1 text-sm text-muted">
          Submit maintenance and safety complaints across campus with photo evidence.
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
              // Clear location-related errors as user interacts
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

        {/* Live State Visualizer (Helpful for testing & learning) */}
        <div className="rounded-lg bg-canvas p-3.5 text-xs text-muted space-y-1">
          <div className="font-semibold text-ink">Form State Debugger:</div>
          <div>
            Campus: <span className="font-mono text-brand-600 font-bold">{location.campus || 'none'}</span>
          </div>
          <div>
            Building: <span className="font-mono text-brand-600 font-bold">{location.building || 'none'}</span>
          </div>
          <div>
            Exact Spot: <span className="font-mono text-brand-600 font-bold">{location.specificLocation || 'none'}</span>
          </div>
          <div>
            Category: <span className="font-mono text-brand-600 font-bold">{category || 'none'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}