'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  onOpenUpload?: () => void;
}

export default function Header({ onOpenUpload }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">NoteHub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Carica
              </button>
            )}
            <Link href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              Admin
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {onOpenUpload && (
              <button
                onClick={() => {
                  onOpenUpload();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-primary-600 font-medium"
              >
                Carica file
              </button>
            )}
            <Link href="/admin" className="block px-4 py-2 text-slate-600 dark:text-slate-300">
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Header({ onOpenUpload }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-red-600 dark:text-red-500">NoteHub</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Carica
              </button>
            )}
            <button onClick={() => setAdminModalOpen(true)} className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">
              Admin
            </button>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
          <div className="px-4 py-3 space-y-2">
            {onOpenUpload && (
              <button
                onClick={() => {
                  onOpenUpload();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-primary-600 font-medium"
              >
                Carica file
              </button>
            )}
            <button onClick={() => { setAdminModalOpen(true); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300">
              Admin
            </button>
          </div>
        </div>
      )}
      <AdminPasswordModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </header>
  );
}