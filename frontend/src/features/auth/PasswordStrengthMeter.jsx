import { Check, X } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '' }) {
  const criteria = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains letters (a-z, A-Z)', met: /[A-Za-z]/.test(password) },
    { label: 'Contains at least 1 number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Contains special symbol (@$!%*?&)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-line-strong',
    'bg-danger',
    'bg-orange',
    'bg-brand-500',
    'bg-success',
  ];

  if (!password) {
    return (
      <p className="mt-1 text-xs text-muted">
        Rule hint: At least 8 characters, letters & numbers
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md bg-surface-muted p-2.5 text-xs border border-line">
      <div className="flex items-center justify-between">
        <span className="font-medium text-ink">Password strength:</span>
        <span
          className={`font-semibold ${
            score <= 1
              ? 'text-danger'
              : score === 2
              ? 'text-orange-700'
              : score === 3
              ? 'text-brand-600'
              : 'text-success'
          }`}
        >
          {strengthLabels[score]}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index < score ? strengthColors[score] : 'bg-line'
            }`}
          />
        ))}
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 gap-1 pt-1 text-[11px] sm:grid-cols-2">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 ${
              item.met ? 'text-success font-medium' : 'text-muted'
            }`}
          >
            {item.met ? (
              <Check size={12} className="shrink-0 text-success" />
            ) : (
              <X size={12} className="shrink-0 text-line-strong" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
