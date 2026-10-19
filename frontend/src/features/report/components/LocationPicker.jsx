import { MapPin, Building2, Compass, AlertCircle } from 'lucide-react';

/**
 * COEP Technological University - Campus Definitions
 */
export const CAMPUSES = [
  { id: 'north', label: 'North Campus' },
  { id: 'south', label: 'South Campus' },
];

/**
 * Real COEP Buildings Dictionary (Verified from COEP Campus Navigation GIS data)
 * 
 * North Campus (Riverside / Tech & Academic Complex)
 * South Campus (Heritage Main Building / Civil / Metallurgy / Admin)
 */
export const BUILDINGS_BY_CAMPUS = {
  north: [
    'Academic Complex',
    'Applied Mechanics Building',
    'Bhau Building',
    'Boat Club',
    'Cognizant Lab',
    'Data Centre',
    'ENTC Building',
    'ENTC Extension',
    'Engineering Physics Lab',
    'Instruments Building',
    'Mini Auditorium',
    'New CSE Building',
    'New Mechanical Building',
    'Old CSE Building',
    'Old Mechanical Building',
  ],
  south: [
    'Main Building',
    'Main Auditorium',
    'Electrical Building',
    'New Civil Building',
    'Old Civil Building',
    'Metallurgy Building',
    'Meta Workshop',
    'Meta Canteen',
    'Manufacturing Building',
    'Production Building',
    'Planning Building',
    'Natu Building',
    'Maths Department',
    'Language Lab',
    'Geology Museum',
    'COEP SBI Bank',
    'MIS Office',
    'Student Section',
    'Scholarship Section',
    'Printing & Stationery',
  ],
};

/**
 * LocationPicker Component
 * 
 * Handles the 3-level cascading location selection:
 * 1. Campus selection (North vs South)
 * 2. Building dropdown (dynamically filtered by campus using real COEP buildings)
 * 3. Specific location (free text for room number, lab name, floor, or landmark)
 */
export default function LocationPicker({
  campus,
  building,
  specificLocation,
  onLocationChange,
  errors = {},
}) {
  // Dynamically compute the buildings available for whichever campus is currently active.
  const availableBuildings = campus ? BUILDINGS_BY_CAMPUS[campus] || [] : [];

  /**
   * Handle Campus Selection
   * When switching between North and South Campus, we reset `building: ''`
   * to ensure no cross-campus building mismatch occurs in state.
   */
  const handleCampusChange = (newCampus) => {
    if (newCampus === campus) return;

    onLocationChange({
      campus: newCampus,
      building: '', // Reset building
      specificLocation, // Retain specific room text
    });
  };

  const handleBuildingChange = (e) => {
    onLocationChange({
      campus,
      building: e.target.value,
      specificLocation,
    });
  };

  const handleSpecificLocationChange = (e) => {
    onLocationChange({
      campus,
      building,
      specificLocation: e.target.value,
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div>
        <label className="block text-sm font-semibold text-ink">
          Incident Location <span className="text-danger">*</span>
        </label>
        <p className="text-xs text-muted">
          Specify where on the COEP campus this maintenance issue occurred.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Level 1: Campus Selection (Pill Buttons)                       */}
      {/* ------------------------------------------------------------- */}
      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink">
          1. Select Campus
        </span>
        <div className="grid grid-cols-2 gap-3">
          {CAMPUSES.map((c) => {
            const isSelected = campus === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCampusChange(c.id)}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 px-4 text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500 shadow-sm'
                    : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted'
                }`}
              >
                <Compass
                  size={16}
                  className={isSelected ? 'text-brand-600' : 'text-muted'}
                />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
        {errors.campus && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{errors.campus}</span>
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Level 2: Building Selection (Cascading Dropdown)              */}
      {/* ------------------------------------------------------------- */}
      <div>
        <label
          htmlFor="building-select"
          className="mb-1.5 block text-xs font-medium text-ink flex items-center gap-1.5"
        >
          <Building2 size={14} className="text-muted" />
          <span>2. Select Building</span>
        </label>

        <select
          id="building-select"
          disabled={!campus}
          value={building}
          onChange={handleBuildingChange}
          className={`block h-11 w-full rounded-md border bg-surface px-3 text-sm text-ink transition-colors duration-150 focus:outline-none focus:ring-2 ${
            errors.building
              ? 'border-danger focus:border-danger focus:ring-danger-50'
              : 'border-line-strong focus:border-brand-500 focus:ring-brand-100'
          } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted`}
        >
          <option value="">
            {campus
              ? `-- Choose a ${campus === 'north' ? 'North' : 'South'} Campus Building --`
              : '-- Please select a campus first --'}
          </option>
          {availableBuildings.map((bldg) => (
            <option key={bldg} value={bldg}>
              {bldg}
            </option>
          ))}
        </select>

        {errors.building && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{errors.building}</span>
          </p>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Level 3: Exact Location (Room number, floor, or landmark)     */}
      {/* ------------------------------------------------------------- */}
      <div>
        <label
          htmlFor="specific-location"
          className="mb-1.5 block text-xs font-medium text-ink flex items-center gap-1.5"
        >
          <MapPin size={14} className="text-muted" />
          <span>3. Exact Spot / Room / Lab / Floor</span>
        </label>

        <input
          id="specific-location"
          type="text"
          placeholder="e.g. 2nd Floor, Lab 4, near east staircase"
          value={specificLocation}
          onChange={handleSpecificLocationChange}
          className={`block h-11 w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-muted transition-colors duration-150 focus:outline-none focus:ring-2 ${
            errors.specificLocation
              ? 'border-danger focus:border-danger focus:ring-danger-50'
              : 'border-line-strong focus:border-brand-500 focus:ring-brand-100'
          }`}
        />

        {errors.specificLocation && (
          <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{errors.specificLocation}</span>
          </p>
        )}
      </div>
    </div>
  );
}