'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, LayoutGrid, BookOpen, Lightbulb, Plus, Menu, X, Search, Compass, ChevronRight, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

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
    { label: 'Area admin', href: '/admin', icon: ShieldCheck },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col items-center gap-8 w-56 h-full p-5 bg-[#0d0f16]/90 backdrop-blur-3xl border-r border-white/10 shadow-2xl">
        <Link href="/" className="flex items-center gap-2 w-full">
          <div className="size-9 rounded-xl flex justify-center items-center p-1 bg-gradient-to-br from-violet-300 to-cyan-300 shadow-lg shadow-cyan-500/10">
            <Image src="/logo.svg" alt="SKAKK-UP" width={36} height={36} className="w-full h-full" />
          </div>
          <span className="font-bold text-lg leading-7 tracking-tight text-gradient">
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
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-300 ease-out text-sm font-semibold relative overflow-hidden group ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-violet-400/20 to-cyan-300/10 border border-violet-300/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'text-foreground-muted hover:text-white hover:bg-white/5'
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
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#08090d]/80 backdrop-blur-2xl border-b border-white/10 lg:left-56 transition-all duration-500">
        <div className="flex justify-between items-center h-16 px-4 lg:px-8">
          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button aria-label="Apri navigazione" onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
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
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all duration-300"
              >
                <LogOut className="size-4" />
                Esci
              </button>
            ) : (
              <Link href="/login" className="px-3 py-2 text-sm font-semibold text-foreground-light hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
                Login
              </Link>
            )}
            <Link href="/admin" className="px-3 py-2 text-sm font-semibold text-foreground-light hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
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
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface/80 backdrop-blur-3xl border-r border-white/5 p-6 lg:hidden shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-neu flex justify-center items-center p-1">
                      <Image src="/logo.svg" alt="SKAKK-UP" width={36} height={36} className="w-full h-full" />
                    </div>
                    <span className="font-semibold text-lg text-foreground">SKAKK-UP</span>
                  </div>
                <button aria-label="Chiudi navigazione" onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                          : 'text-foreground-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  );
                })}
                {isAuthenticated && (
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-300 mt-2"
                  >
                    <LogOut className="size-4" />
                    Esci
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav aria-label="Navigazione principale mobile" className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 hidden items-center justify-around border-t border-white/10 bg-[#0d0f16]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl lg:hidden">
        {navItems.slice(0, 4).map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
          return <Link key={href} href={href} aria-label={label} aria-current={active ? 'page' : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors ${active ? 'text-cyan-300' : 'text-foreground-muted'}`}>
            <Icon className="size-4" /> <span className="truncate">{label === 'I miei appunti' ? 'Appunti' : label}</span>
          </Link>;
        })}
      </nav>
    </>
  );
}
