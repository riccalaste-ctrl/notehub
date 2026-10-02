'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Filter, Search, SlidersHorizontal, X } from 'lucide-react';

interface Subject { id: string; name: string; slug: string; }
interface Professor { id: string; name: string; }
interface SearchFilters {
  search: string;
  subjectId: string;
  professorId: string;
  dateFrom: string;
  dateTo: string;
}
interface SearchBarProps {
  subjects: Subject[];
  professors: Professor[];
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

export default function SearchBar({ subjects, professors, filters, onFilterChange }: SearchBarProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setLocalFilters(filters), [filters]);

  const handleChange = useCallback((key: keyof SearchFilters, value: string) => {
    const next = { ...localFilters, [key]: value };
    setLocalFilters(next);
    onFilterChange(next);
  }, [localFilters, onFilterChange]);

  const clearFilters = useCallback(() => {
    const empty = { search: '', subjectId: '', professorId: '', dateFrom: '', dateTo: '' };
    setLocalFilters(empty);
    onFilterChange(empty);
  }, [onFilterChange]);

  const activeCount = Object.entries(localFilters).filter(([key, value]) => key !== 'search' && value !== '').length;

  return (
    <section className="search-shell mb-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-cyan-200/60" />
          <input
            aria-label="Cerca risorse"
            type="search"
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Cerca appunti, argomenti, file..."
            className="search-main-input w-full pl-12 pr-4"
          />
          {localFilters.search && (
            <button aria-label="Cancella ricerca" onClick={() => handleChange('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-foreground-muted hover:bg-white/10 hover:text-white">
              <X className="size-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className={`filter-trigger ${filtersOpen || activeCount ? 'is-active' : ''}`}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="size-4" />
          Filtri
          {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4 grid gap-3 border-t border-white/[0.07] pt-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="filter-field">
            <span>Materia</span>
            <select value={localFilters.subjectId} onChange={(e) => handleChange('subjectId', e.target.value)}>
              <option value="">Tutte le materie</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Professore</span>
            <select value={localFilters.professorId} onChange={(e) => handleChange('professorId', e.target.value)}>
              <option value="">Tutti i professori</option>
              {professors.map((professor) => <option key={professor.id} value={professor.id}>{professor.name}</option>)}
            </select>
          </label>
          <label className="filter-field">
            <span>Da</span>
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input type="date" value={localFilters.dateFrom} onChange={(e) => handleChange('dateFrom', e.target.value)} className="pl-9" />
            </span>
          </label>
          <label className="filter-field">
            <span>A</span>
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <input type="date" value={localFilters.dateTo} onChange={(e) => handleChange('dateTo', e.target.value)} className="pl-9" />
            </span>
          </label>
          <div className="md:col-span-2 xl:col-span-4 flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Filter className="size-3.5" />
              {activeCount ? `${activeCount} filtri attivi` : 'Nessun filtro aggiuntivo'}
            </div>
            {(activeCount > 0 || localFilters.search) && (
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-cyan-200 hover:text-white">
                Reimposta tutto
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
