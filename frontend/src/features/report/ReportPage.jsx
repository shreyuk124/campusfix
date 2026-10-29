import { useState, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import LocationPicker from './components/LocationPicker';
import CategorySelector from './components/CategorySelector';
import DuplicateChecker from './components/DuplicateChecker';
import PhotoUploader from './components/PhotoUploader';
import ReportSuccess from './components/ReportSuccess';
import Button from '../../components/ui/Button';
import { issuesApi } from '../../api/issues';
import issuesService from '../issues/issuesService';

const DRAFT_STORAGE_KEY = 'campusfix_active_report_draft';

/**
 * ReportPage Component
 * 
 * 4-Step Student Reporting Journey:
 * 1. Step 1: Campus & Building Selection
 * 2. Step 2: Problem Category Selection
 * 3. Step 3: Live Duplicate Interception from MongoDB Atlas
 *    - Allows 1-tap "I am affected too" upvoting
 *    - Allows "Report anyway as a new issue" to bypass and file directly
 * 4. Step 4: Specific Room/Floor + Optional Photos + Description
 */
export default function ReportPage() {
  // 1. High-level Location State (restores from draft if page reloads)
  const [location, setLocation] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.campus) {
          return { campus: parsed.campus, building: parsed.building || '' };
        }
      }
    } catch {}
    return { campus: '', building: '' };
  });

  // 2. Specific room / landmark
  const [specificLocation, setSpecificLocation] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved).specificLocation || '';
    } catch {}
    return '';
  });

  // 3. Category State
  const [category, setCategory] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved).category || '';
    } catch {}
    return '';
  });

  // 4. Photos State
  const [photos, setPhotos] = useState([]);

  // 5. Description State
  const [description, setDescription] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved).description || '';
    } catch {}
    return '';
  });

  // 6. Live Duplicates & Bypass State
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [bypassedDuplicates, setBypassedDuplicates] = useState(false);

  // 7. Submission / Success State
  const [submissionState, setSubmissionState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-save form inputs to sessionStorage so mobile camera returns don't wipe data
  useEffect(() => {
    if (location.campus || location.building || category || specificLocation || description) {
      sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          campus: location.campus,
          building: location.building,
          category,
          specificLocation,
          description,
        })
      );
    }
  }, [location, category, specificLocation, description]);

  const handleReset = () => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setLocation({ campus: '', building: '' });
    setSpecificLocation('');
    setCategory('');
    setPhotos([]);
    setDescription('');
    setHasDuplicates(false);
    setBypassedDuplicates(false);
    setSubmissionState(null);
    setErrors({});
  };

  /**
   * Action A: Student clicked "I am affected too"
   */
  const handleAffectedToo = async (existingIssue) => {
    const issueId = existingIssue._id || existingIssue.id;

    try {
      if (issueId) {
        await issuesApi.upvote(issueId);
      }
    } catch (err) {
      console.warn('Upvote network fallback:', err.message);
    }

    try {
      if (issueId || existingIssue.refId) {
        await issuesService.toggleJoinIssue(issueId || existingIssue.refId);
      }
    } catch (localErr) {
      console.warn('Local toggle join fallback:', localErr);
    }

    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setSubmissionState({
      type: 'affected',
      referenceId: existingIssue.refId || existingIssue.referenceId || issueId,
      issueTitle: existingIssue.title,
    });
  };

  /**
   * Action B: Student clicked "Report anyway as a new issue"
   */
  const handleProceedAsNew = () => {
    setBypassedDuplicates(true);
  };

  /**
   * Action C: Submit brand-new issue
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!location.campus) newErrors.campus = 'Please select a campus.';
    if (!location.building) newErrors.building = 'Please select a building.';
    if (!category) newErrors.category = 'Please choose a problem category.';
    if (!specificLocation.trim()) newErrors.specificLocation = 'Please specify the exact room, floor, or landmark.';
    if (!description.trim()) newErrors.description = 'Please provide a description of the problem.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    let refId = null;
    let realMongoId = null;
    let serverPhotos = null;
    const finalTitle = description.slice(0, 60).trim();

    try {
      const formData = new FormData();
      formData.append('title', finalTitle);
      formData.append('campus', location.campus.toLowerCase());
      formData.append('building', location.building);
      formData.append('category', category);
      formData.append('locationText', specificLocation.trim());
      formData.append('description', description.trim());

      photos.forEach((photoObj) => {
        if (photoObj.file) {
          formData.append('photos', photoObj.file);
        }
      });

      const response = await issuesApi.create(formData);
      const serverIssue = response?.data?.data || response?.data || response;
      realMongoId = serverIssue._id;
      refId = serverIssue.refId || refId;
      serverPhotos = Array.isArray(serverIssue?.photos) && serverIssue.photos.length > 0 ? serverIssue.photos : null;
    } catch (apiError) {
      console.error('API submission failed:', apiError);
      const errorMsg =
        apiError.response?.data?.message ||
        apiError.response?.data?.error?.message ||
        apiError.message ||
        'Server error submitting issue. Please try again.';
      setErrors((prev) => ({ ...prev, submit: errorMsg }));
      setIsSubmitting(false);
      return;
    }

    // Persist to local store for immediate UI reflection using the real MongoDB ID and refId
    const localIssue = await issuesService.createIssue({
      _id: realMongoId,
      id: realMongoId,
      referenceId: refId || undefined,
      title: finalTitle,
      description: description.trim(),
      category,
      campus: location.campus,
      building: location.building,
      location: specificLocation.trim(),
      photos: serverPhotos || photos,
    });

    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setIsSubmitting(false);
    setSubmissionState({
      type: 'new',
      referenceId: refId || localIssue.referenceId,
      issueTitle: localIssue.title,
    });
  };

  // Render confirmation screen once submitted or upvoted
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

  // Show detailed fields if: building + category picked AND (no duplicates found OR user bypassed them)
  const canShowDetailedInputs =
    Boolean(location.building && category) && (!hasDuplicates || bypassedDuplicates);

  return (
    <div className="mx-auto max-w-form space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Report an Issue
        </h1>
        <p className="mt-1 text-sm text-muted">
          Submit maintenance and safety complaints across campus to notify estate authorities.
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
              setBypassedDuplicates(false);
              setHasDuplicates(false);
              setErrors((prev) => ({ ...prev, campus: '', building: '' }));
            }}
            errors={errors}
          />
        </section>

        {/* Step 2: Category Selector */}
        {location.building && (
          <>
            <hr className="border-line" />
            <section className="animate-in fade-in duration-200">
              <CategorySelector
                value={category}
                onChange={(newCategory) => {
                  setCategory(newCategory);
                  setBypassedDuplicates(false);
                  setHasDuplicates(false);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
                error={errors.category}
              />
            </section>
          </>
        )}

        {/* Step 3: Live Duplicate Interception (Only shown if building & category chosen, and not yet bypassed) */}
        {location.building && category && !bypassedDuplicates && (
          <section className="pt-1">
            <DuplicateChecker
              building={location.building}
              category={category}
              onAffectedToo={handleAffectedToo}
              onProceedAsNew={handleProceedAsNew}
              onDuplicatesFound={setHasDuplicates}
            />
          </section>
        )}

        {/* Step 4: Room, Photos, Description */}
        {canShowDetailedInputs && (
          <div className="space-y-7 animate-in fade-in duration-300">
            <hr className="border-line" />

            {/* Exact Spot / Room */}
            <section className="space-y-1.5">
              <label htmlFor="specific-location" className="block text-sm font-semibold text-ink flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-600" />
                <span>Exact Spot / Room / Floor in {location.building} <span className="text-danger">*</span></span>
              </label>
              <p className="text-xs text-muted">
                Specify the room number, lab, or landmark so the technician can locate it immediately.
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

            {/* Description Textarea */}
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

            <hr className="border-line" />

            {/* Photo Evidence */}
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

            {/* Server Error Banner */}
            {errors.submit && (
              <div className="p-3.5 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Submit Button */}
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
