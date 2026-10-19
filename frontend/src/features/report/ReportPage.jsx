import { useState } from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from './components/LocationPicker';
import CategorySelector from './components/CategorySelector';
import DuplicateChecker from './components/DuplicateChecker';
import PhotoUploader, { MIN_PHOTOS } from './components/PhotoUploader';
import ReportSuccess from './components/ReportSuccess';
import Button from '../../components/ui/Button';

/**
 * ReportPage Component
 * 
 * Flow:
 * 1. Step 1: Campus & Building (Fast selection)
 * 2. Step 2: Category (Electrical, Plumbing, etc.)
 * 3. Step 3: EARLY DUPLICATE INTERCEPTION (Zero typing needed if already reported!)
 *    - "I am affected too" -> Success Screen
 *    - "None of these - report as new" -> Reveals Step 4 (Room, Photos, Description)
 * 4. Step 4: Specific Room/Floor + Mandatory Photos + Description
 */
export default function ReportPage() {
  // 1. High-level Location State
  const [location, setLocation] = useState({
    campus: '',
    building: '',
  });

  // 2. Specific room/floor (only typed if reporting as new)
  const [specificLocation, setSpecificLocation] = useState('');

  // 3. Category State
  const [category, setCategory] = useState('');

  // 4. Mandatory Photos State
  const [photos, setPhotos] = useState([]);

  // 5. Description State
  const [description, setDescription] = useState('');

  // 6. Duplicate Interception State
  const [bypassedDuplicates, setBypassedDuplicates] = useState(false);

  // 7. Submission / Success State
  const [submissionState, setSubmissionState] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleReset = () => {
    setLocation({ campus: '', building: '' });
    setSpecificLocation('');
    setCategory('');
    setPhotos([]);
    setDescription('');
    setBypassedDuplicates(false);
    setSubmissionState(null);
    setErrors({});
  };

  /**
   * Action A: Student clicked "I am affected too"
   */
  const handleAffectedToo = (existingIssue) => {
    setSubmissionState({
      type: 'affected',
      referenceId: existingIssue.id,
      issueTitle: existingIssue.title,
    });
  };

  /**
   * Action B: Student confirmed their issue is new
   */
  const handleProceedAsNew = () => {
    setBypassedDuplicates(true);
  };

  /**
   * Validate & Submit Form
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!location.campus) newErrors.campus = 'Please select a campus (North or South).';
    if (!location.building) newErrors.building = 'Please select a building.';
    if (!category) newErrors.category = 'Please select an issue category.';
    if (!specificLocation.trim()) newErrors.specificLocation = 'Please specify the exact room, lab, or floor.';
    if (photos.length < MIN_PHOTOS) newErrors.photos = `At least ${MIN_PHOTOS} photo evidence is required.`;
    if (!description.trim()) newErrors.description = 'Please provide a description of the problem.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const randomRef = `CF-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmissionState({
        type: 'new',
        referenceId: randomRef,
        issueTitle: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
      });
    }, 800);
  };

  // If successfully submitted or upvoted, render confirmation screen
  if (submissionState) {
    return (
      <ReportSuccess
        type={submissionState.type}
        referenceId={submissionState.referenceId}
        issueTitle={submissionState.issueTitle}
        onReset={handleReset}
      />
    );
  }

  // Can we show the detailed form fields?
  // Only if:
  // 1. Campus, Building, and Category are chosen
  // 2. AND either no duplicates exist OR user clicked "None of these, report as new"
  const canShowDetailedInputs = location.building && category && bypassedDuplicates;

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

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card space-y-7">
        
        {/* Step 1: Campus & Building Selection */}
        <section>
          <LocationPicker
            campus={location.campus}
            building={location.building}
            onLocationChange={(newLocation) => {
              setLocation(newLocation);
              setBypassedDuplicates(false); // Reset duplicate bypass if location changes!
              setErrors((prev) => ({ ...prev, campus: '', building: '' }));
            }}
            errors={errors}
          />
        </section>

        {/* Step 2: Category Selector (Visible once Campus & Building are picked) */}
        {location.building && (
          <>
            <hr className="border-line" />
            <section className="animate-in fade-in duration-200">
              <CategorySelector
                value={category}
                onChange={(newCategory) => {
                  setCategory(newCategory);
                  setBypassedDuplicates(false); // Re-run duplicate check on category change!
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
                error={errors.category}
              />
            </section>
          </>
        )}

        {/* Step 3: Early Duplicate Interception Banner */}
        {/* Appears immediately when Building & Category are active! */}
        {location.building && category && !bypassedDuplicates && (
          <section className="pt-1">
            <DuplicateChecker
              building={location.building}
              category={category}
              onAffectedToo={handleAffectedToo}
              onProceedAsNew={handleProceedAsNew}
            />
          </section>
        )}

        {/* Step 4: Detailed Input (Only shown once user confirms it's a new issue) */}
        {canShowDetailedInputs && (
          <div className="space-y-7 animate-in fade-in duration-300">
            <hr className="border-line" />

            {/* 4A: Exact Spot / Room / Floor */}
            <section className="space-y-1.5">
              <label htmlFor="specific-location" className="block text-sm font-semibold text-ink flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-600" />
                <span>Exact Spot / Room / Floor in {location.building} <span className="text-danger">*</span></span>
              </label>
              <p className="text-xs text-muted">
                Specify the room number, lab, or landmark so the maintenance technician can find it immediately.
              </p>
              <input
                id="specific-location"
                type="text"
                placeholder="e.g. 3rd Floor, Lab 302, near east washroom"
                value={specificLocation}
                onChange={(e) => {
                  setSpecificLocation(e.target.value);
                  setErrors((prev) => ({ ...prev, specificLocation: '' }));
                }}
                className={`block h-11 w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                  errors.specificLocation
                    ? 'border-danger focus:border-danger focus:ring-danger-50'
                    : 'border-line-strong focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.specificLocation && (
                <p className="text-xs font-medium text-danger">{errors.specificLocation}</p>
              )}
            </section>

            <hr className="border-line" />

            {/* 4B: Mandatory Photo Evidence */}
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

            {/* 4C: Problem Description Textarea */}
            <section className="space-y-1.5">
              <label htmlFor="problem-desc" className="block text-sm font-semibold text-ink">
                Problem Description <span className="text-danger">*</span>
              </label>
              <p className="text-xs text-muted">
                Describe the severity, damage, or hazard details.
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
                className={`block w-full rounded-md border p-3 text-sm text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-danger focus:border-danger focus:ring-danger-50'
                    : 'border-line-strong focus:border-brand-500 focus:ring-brand-100'
                }`}
              />
              {errors.description && (
                <p className="text-xs font-medium text-danger">{errors.description}</p>
              )}
            </section>

            {/* Final Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
              >
                Submit Maintenance Report
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}