import { Building2, Compass, AlertCircle } from 'lucide-react';

/**
 * COEP Technological University - Campus Definitions
 */
export const CAMPUSES = [
  { id: 'north', label: 'North Campus' },
  { id: 'south', label: 'South Campus' },
  { id: 'hostel', label: 'Hostel Campus' },
];

/**
 * Real COEP Buildings Dictionary (Verified from COEP Campus Navigation GIS data)
 */
export const BUILDINGS_BY_CAMPUS = {
  north: [
    'Academic Complex',
    'Applied Mechanics Building',
    'Bhau Institute of Innovation',
    'Boat Club',
    'Cognizant Lab',
    'Data Centre',
    'Electronics & Telecommunication (E&TC) Building',
    'ENTC Extension',
    'Engineering Physics Lab',
    'Instrumentation & Control Building',
    'Mini Auditorium',
    'Computer Engineering & IT Building',
    'Mechanical Engineering Building',
  ],
  south: [
    'Main Heritage Building',
    'Main Auditorium',
    'Electrical Engineering Building',
    'Civil Engineering Building',
    'Metallurgy & Materials Science Building',
    'Meta Workshop',
    'COEP Canteen / Meta Canteen',
    'Manufacturing & Production Engineering Building',
    'Planning Department Building',
    'Central Library',
    'Natu Building',
    'Maths Department',
    'Language Lab',
    'Geology Museum',
    'COEP SBI Bank',
    'Student Section',
  ],
  hostel: [
    'Boys Hostel Complex (Blocks C–J)',
    'Girls Hostel Complex (GHB & Blocks A–B)',
    'Hostel Mess & Dining Hall',
    'COEP Gymkhana & Ground',
  ],
};

/**
 * LocationPicker Component (Step 1: Campus & Building)
 * 
 * Only handles the high-level location (Campus and Building).
 * The fine-grained room/spot field is moved after duplicate detection
 * to avoid asking the user to type room details if their issue is already reported!
 */
export default function LocationPicker({
  campus,
  building,
  onLocationChange,
  errors = {},
}) {
  const availableBuildings = campus ? BUILDINGS_BY_CAMPUS[campus] || [] : [];

  const handleCampusChange = (newCampus) => {
    if (newCampus === campus) return;

    onLocationChange({
      campus: newCampus,
      building: '', // Reset building to prevent invalid cross-campus states
    });
  };

  const handleBuildingChange = (e) => {
    onLocationChange({
      campus,
      building: e.target.value,
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div>
        <label className="block text-sm font-semibold text-ink">
          Step 1: Where is the problem? <span className="text-danger">*</span>
        </label>
        <p className="text-xs text-muted">
          Select the COEP campus and building first.
        </p>
      </div>

      {/* Level 1: Campus Selection */}
      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink">
          Campus
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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

      {/* Level 2: Building Selection */}
      <div>
        <label
          htmlFor="building-select"
          className="mb-1.5 block text-xs font-medium text-ink flex items-center gap-1.5"
        >
          <Building2 size={14} className="text-muted" />
          <span>Building</span>
        </label>

        <select
          id="building-select"
          disabled={!campus}
          value={building}
          onChange={handleBuildingChange}
          className={`block h-11 w-full rounded-md border bg-surface pl-3.5 pr-9 text-sm text-ink transition-colors duration-150 focus:outline-none focus:ring-2 ${
            errors.building
              ? 'border-danger focus:border-danger focus:ring-danger-50'
              : 'border-line-strong focus:border-brand-500 focus:ring-brand-100'
          } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted cursor-pointer`}
        >
          <option value="">
            {campus
              ? `-- Choose a ${campus === 'north' ? 'North' : campus === 'south' ? 'South' : 'Hostel'} Campus Building --`
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
    </div>
  );
}