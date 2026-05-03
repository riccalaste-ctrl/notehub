'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutGrid, BookOpen, Lightbulb, Plus, Menu, X, Search, Compass, ChevronRight, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenUpload?: () => void;
  currentSection?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ onOpenUpload, currentSection, breadcrumbs }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutGrid },
    { label: 'Materie', href: '/materie', icon: BookOpen },
    { label: 'Consigli', href: '/consigli', icon: Lightbulb },
    { label: 'I miei appunti', href: '/i-miei-appunti', icon: FileText },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center gap-8 w-56 h-full p-6 neu-sidebar border-r border-stone-200/50">
        <Link href="/" className="flex items-center gap-2 w-full">
          <div className="size-9 rounded-neu flex justify-center items-center p-1">
            <Image src="/logo.svg" alt="SKAKK-UP" width={36} height={36} className="w-full h-full" />
          </div>
          <span className="font-semibold text-lg leading-7 tracking-tight text-foreground">
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
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-neu transition-all duration-300 ease-out text-sm font-semibold ${
                  isActive
                    ? 'shadow-neu-pressed text-lavender-dark'
                    : 'text-foreground-light hover:text-foreground hover:shadow-neu-badge'
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
      <header className="fixed top-0 left-0 right-0 z-50 neu-header lg:left-56">
        <div className="flex justify-between items-center h-16 px-4 lg:px-8">
          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-neu neu-button">
              <Menu className="size-5 text-foreground" />
            </button>
            <Link href="/" className="size-8 rounded-neu flex justify-center items-center p-0.5">
              <Image src="/logo.svg" alt="SKAKK-UP" width={36} height={36} className="w-full h-full" />
            </Link>
            <span className="font-semibold text-base tracking-tight text-foreground">
              SKAKK-UP
            </span>
          </div>

          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2">
            <Compass className="size-5 text-foreground-muted" />
            {breadcrumbs ? breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <ChevronRight className="size-4 text-foreground-light" />
                {crumb.href ? (
                  <Link href={crumb.href} className="font-medium text-sm text-foreground-light hover:text-foreground transition">{crumb.label}</Link>
                ) : (
                  <span className="font-bold text-sm text-foreground">{crumb.label}</span>
                )}
              </span>
            )) : currentSection && (
              <>
                <ChevronRight className="size-4 text-foreground-light" />
                <span className="font-bold text-sm text-foreground">{currentSection}</span>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="px-3 py-2 text-sm font-semibold text-foreground hover:shadow-neu-badge rounded-neu premium-transition"
              >
                Esci
              </button>
            ) : (
              <Link href="/login" className="px-3 py-2 text-sm font-semibold text-foreground hover:shadow-neu-badge rounded-neu premium-transition">
                Login
              </Link>
            )}
            <Link href="/admin" className="px-3 py-2 text-sm font-semibold text-foreground hover:shadow-neu-badge rounded-neu premium-transition">
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
              className="fixed left-0 top-0 bottom-0 z-50 w-64 neu-sidebar border-r border-stone-200/50 p-6 lg:hidden"
            >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-neu flex justify-center items-center p-1">
                      <Image src="/logo.svg" alt="SKAKK-UP" width={36} height={36} className="w-full h-full" />
                    </div>
                    <span className="font-semibold text-lg text-foreground">SKAKK-UP</span>
                  </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-neu neu-button">
                  <X className="size-5 text-foreground" />
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-neu text-sm font-semibold premium-transition ${
                        isActive
                          ? 'shadow-neu-pressed text-lavender-dark'
                          : 'text-foreground-light hover:text-foreground hover:shadow-neu-badge'
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
