'use client';

import { useState, useEffect, useCallback } from 'react';

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface Professor {
  id: string;
  name: string;
}

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

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = useCallback((key: keyof SearchFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  const clearFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      search: '',
      subjectId: '',
      professorId: '',
      dateFrom: '',
      dateTo: '',
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const hasFilters = Object.values(localFilters).some(v => v !== '');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cerca
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Nome file..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Materia
          </label>
          <select
            value={localFilters.subjectId}
            onChange={(e) => handleChange('subjectId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tutte</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Professore
          </label>
          <select
            value={localFilters.professorId}
            onChange={(e) => handleChange('professorId', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tutti</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Data
          </label>
          <input
            type="date"
            value={localFilters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Pulisci filtri
          </button>
        </div>
      )}
    </div>
  );
}