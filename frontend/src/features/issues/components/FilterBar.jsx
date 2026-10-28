// features/issues/components/FilterBar.jsx - Reusable search, filter, and sort bar
// Minimalistic design without SLA or internal priority scoring
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  Building2,
  Tag,
  CircleDot,
} from 'lucide-react';
import { STATUSES, CATEGORIES, CAMPUS_BUILDINGS } from '../../../lib/constants';
import Button from '../../../components/ui/Button';

export function FilterBar({
  filters = {
    search: '',
    building: 'all',
    category: 'all',
    status: 'all',
    sort: 'newest',
  },
  onFilterChange,
  className = '',
  showStatusFilter = true,
}) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onFilterChange]);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClearAll = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      building: 'all',
      category: 'all',
      status: 'all',
      sort: 'newest',
    });
  };

  // Count active non-default filters
  const activeFilterCount = [
    filters.building !== 'all',
    filters.category !== 'all',
    showStatusFilter && filters.status !== 'all',
    Boolean(filters.search),
  ].filter(Boolean).length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary Bar: Search, Mobile Filters Trigger & Quick Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by issue title, reference ID, room, or problem..."
            className="block h-10 sm:h-11 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                handleChange('search', '');
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Right actions: Mobile Filter Button & Desktop Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button (<1024px) */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="flex lg:hidden flex-1 sm:flex-none items-center justify-center gap-2 h-10 px-3.5 rounded-lg border border-line-strong bg-surface text-sm font-medium text-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
          >
            <SlidersHorizontal size={16} className="text-muted" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop Selects (≥1024px) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Building Dropdown */}
            <select
              value={filters.building}
              onChange={(e) => handleChange('building', e.target.value)}
              className="h-10 rounded-lg border border-line-strong bg-surface pl-3 pr-9 text-xs sm:text-sm text-ink focus:border-brand-500 focus:ring-brand-100 cursor-pointer"
              aria-label="Filter by building"
            >
              <option value="all">All Buildings</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="h-10 rounded-lg border border-line-strong bg-surface pl-3 pr-9 text-xs sm:text-sm text-ink focus:border-brand-500 focus:ring-brand-100 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            {showStatusFilter && (
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="h-10 rounded-lg border border-line-strong bg-surface pl-3 pr-9 text-xs sm:text-sm text-ink focus:border-brand-500 focus:ring-brand-100 cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleChange('sort', e.target.value)}
              className="h-10 rounded-lg border border-line-strong bg-surface pl-3 pr-8 text-xs sm:text-sm font-medium text-ink focus:border-brand-500 focus:ring-brand-100 cursor-pointer"
              aria-label="Sort issues by"
            >
              <option value="newest">Sort: Newest first</option>
              <option value="most-affected">Sort: Most affected (+1)</option>
              <option value="oldest">Sort: Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-muted">
          <span className="font-medium text-body">Active filters:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
              Query: &quot;{filters.search}&quot;
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  handleChange('search', '');
                }}
                className="hover:text-brand-900 ml-0.5"
                aria-label="Remove search filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.building !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
              {filters.building}
              <button
                type="button"
                onClick={() => handleChange('building', 'all')}
                className="hover:text-brand-900 ml-0.5"
                aria-label="Remove building filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
              {filters.category}
              <button
                type="button"
                onClick={() => handleChange('category', 'all')}
                className="hover:text-brand-900 ml-0.5"
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {showStatusFilter && filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
              Status: {filters.status}
              <button
                type="button"
                onClick={() => handleChange('status', 'all')}
                className="hover:text-brand-900 ml-0.5"
                aria-label="Remove status filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearAll}
            className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline"
          >
            <RotateCcw size={12} />
            <span>Clear all</span>
          </button>
        </div>
      )}

      {/* Mobile Filters Slide-over / Sheet */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative mt-auto w-full rounded-t-2xl border-t border-line bg-surface p-5 shadow-modal animate-in slide-in-from-bottom duration-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-brand-600" />
                <h3 className="text-base font-bold text-ink">Filter Campus Issues</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-ink"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Building */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Building2 size={14} className="text-muted" />
                <span>Building / Facility</span>
              </label>
              <select
                value={filters.building}
                onChange={(e) => handleChange('building', e.target.value)}
                className="w-full h-11 rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink cursor-pointer focus:border-brand-500 focus:ring-brand-100"
              >
                <option value="all">All Buildings</option>
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Tag size={14} className="text-muted" />
                <span>Category</span>
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full h-11 rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink cursor-pointer focus:border-brand-500 focus:ring-brand-100"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            {showStatusFilter && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <CircleDot size={14} className="text-muted" />
                  <span>Status</span>
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full h-11 rounded-lg border border-line-strong bg-surface pl-3.5 pr-9 text-sm text-ink cursor-pointer focus:border-brand-500 focus:ring-brand-100"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleClearAll}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsMobileSheetOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
