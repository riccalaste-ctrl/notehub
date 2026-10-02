'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail, ShieldCheck } from 'lucide-react';
import { buildInstitutionDisclaimer } from '@/lib/user-session-client';

interface Settings {
  support_email?: string;
  admin_email?: string;
  site_policy?: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings || {}))
      .catch(() => {});
  }, []);

  const email = settings.support_email || settings.admin_email;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
      className="relative z-10 mt-20 border-t border-white/[0.08] py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="footer-orbit mb-8 overflow-hidden rounded-[2rem] border border-white/[0.09] p-6 sm:p-8">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                <ShieldCheck className="size-3.5" />
                Spazio di apprendimento
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Tutto ciò che ti serve per studiare,
                <span className="text-gradient-purple"> in un unico posto.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-foreground-muted">
                Note, risorse, consigli e strumenti organizzati per rendere la ricerca più semplice e il lavoro quotidiano più fluido.
              </p>
            </div>
            <div className="space-y-3 text-sm text-foreground-muted">
              {email && (
                <a href={`mailto:${email}`} className="group flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="size-4 text-cyan-300" />
                  <span>{email}</span>
                  <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              )}
              {settings.site_policy && (
                <p className="max-w-sm leading-5">{settings.site_policy}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link href="/privacy-policy" className="footer-link">Privacy</Link>
              <Link href="/cookie-policy" className="footer-link">Cookie</Link>
              <Link href="/service-rules" className="footer-link">Regole</Link>
              <Link href="/contact-reporting" className="footer-link">Segnalazioni</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white/80">SKAKK-UP · The Digital Agora</p>
            <p className="mt-1">{buildInstitutionDisclaimer(email)}</p>
          </div>
          <p className="uppercase tracking-[0.18em] text-white/30">Premium Knowledge Experience</p>
        </div>
      </div>
    </motion.footer>
  );
}
