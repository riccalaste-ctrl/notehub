'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutGrid, BookOpen, Lightbulb, Plus, Menu, X, Search, Compass, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenUpload?: () => void;
  currentSection?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ onOpenUpload, currentSection, breadcrumbs }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutGrid },
    { label: 'Materie', href: '/materie', icon: BookOpen },
    { label: 'Consigli', href: '/consigli', icon: Lightbulb },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center gap-8 w-56 h-full p-6 glass-sidebar">
        <Link href="/" className="flex items-center gap-2 w-full">
          <div className="size-9 transition-all duration-300 rounded-xl flex justify-center items-center gradient-logo">
            <GraduationCap className="size-5 text-white" />
          </div>
          <span className="font-extrabold text-lg leading-7 tracking-tight gradient-text">
            SKAKK-UP
          </span>
        </Link>

        <nav className="flex flex-col gap-2 w-full">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl transition-all duration-300 ease-out text-sm font-semibold ${
                  isActive
                    ? 'bg-stone-800 text-white'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header lg:left-56">
        <div className="flex justify-between items-center h-16 px-4 lg:px-8">
          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-stone-100 premium-transition">
              <Menu className="size-5 text-stone-800" />
            </button>
            <Link href="/" className="size-8 rounded-xl flex justify-center items-center gradient-logo">
              <GraduationCap className="size-4 text-white" />
            </Link>
            <span className="font-extrabold text-base tracking-tight gradient-text">
              SKAKK-UP
            </span>
          </div>

          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2">
            <Compass className="size-5 text-stone-500" />
            {breadcrumbs ? breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="size-4 text-stone-400" />
                {crumb.href ? (
                  <Link href={crumb.href} className="font-medium text-sm text-stone-700 hover:text-stone-900 transition">{crumb.label}</Link>
                ) : (
                  <span className="font-bold text-sm text-stone-900">{crumb.label}</span>
                )}
              </span>
            )) : currentSection && (
              <>
                <ChevronRight className="size-4 text-stone-400" />
                <span className="font-bold text-sm text-stone-900">{currentSection}</span>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {onOpenUpload && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center px-5 py-2 font-semibold rounded-full text-white text-sm gradient-primary premium-transition"
              >
                <Plus className="size-4 mr-1.5" />
                <span className="relative z-10">Carica</span>
              </motion.button>
            )}

            <Link href="/admin" className="px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100 rounded-xl premium-transition">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 glass-sidebar p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="size-9 rounded-xl flex justify-center items-center gradient-logo">
                    <GraduationCap className="size-5 text-white" />
                  </div>
                  <span className="font-extrabold text-lg gradient-text">SKAKK-UP</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-stone-100">
                  <X className="size-5 text-stone-800" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold premium-transition ${
                        isActive
                          ? 'bg-stone-800 text-white'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
