import { useState } from 'react';
import CategorySelector from './components/CategorySelector';

export default function ReportPage() {
  // State to keep track of which category the student selected (defaults to empty string)
  const [category, setCategory] = useState('');
  // State to hold any validation error (e.g. if submitted without selecting)
  const [error, setError] = useState('');

  return (
    <div className="mx-auto max-w-form space-y-6">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Report an Issue</h1>
        <p className="mt-1 text-sm text-muted">
          Submit maintenance and safety complaints across campus with photo evidence.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-card space-y-6">
        {/* Step 1: Category Selection */}
        <CategorySelector
          value={category}
          onChange={(newCategory) => {
            setCategory(newCategory);
            setError(''); // Clear error once the user makes a selection
          }}
          error={error}
        />

        {/* Temporary debug visualizer so you can see the state update live */}
        <div className="rounded-md bg-canvas p-3 text-xs text-muted">
          <span className="font-semibold text-ink">Selected Category State:</span>{' '}
          {category ? (
            <code className="text-brand-600 font-bold">{category}</code>
          ) : (
            'None selected yet'
          )}
        </div>
      </div>
    </div>
  );
}