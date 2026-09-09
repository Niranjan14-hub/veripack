import { cn } from '../../lib/format';

function Segment({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-line bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.value ?? 'all'}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[0.6rem] px-3 py-1.5 text-xs transition-colors focus-ring',
            value === option.value
              ? 'bg-white/[0.08] text-ink'
              : 'text-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ categories, verdict, category, onVerdictChange, onCategoryChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segment
        value={verdict}
        onChange={onVerdictChange}
        options={[
          { value: null, label: 'All' },
          { value: 'verified', label: 'Verified' },
          { value: 'issues_found', label: 'Issues' },
        ]}
      />
      <Segment
        value={category}
        onChange={onCategoryChange}
        options={[
          { value: null, label: 'Every category' },
          ...categories.map((item) => ({ value: item.key, label: item.label })),
        ]}
      />
    </div>
  );
}
