'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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
      .then(res => res.json())
      .then(data => setSettings(data.settings || {}))
      .catch(err => console.error('Settings fetch error:', err));
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="py-8 mt-8 border-t border-white/5 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-sm text-foreground-muted mb-2 font-medium">
            SKAKK-UP - The Digital Agora
          </p>
          {(settings.support_email || settings.admin_email) && (
            <a
              href={`mailto:${settings.support_email || settings.admin_email}`}
              className="text-sm text-neon-blue hover:text-white transition-colors font-medium"
            >
              Contatta gli amministratori
            </a>
          )}
        </div>

        {settings.site_policy && (
          <div className="glass-panel p-6 max-w-4xl mx-auto mb-8 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Policy & Responsabilità
            </h3>
            <p className="text-sm text-foreground-light leading-relaxed text-center">
              {settings.site_policy}
            </p>
            {(settings.support_email || settings.admin_email) && (
              <p className="text-sm text-foreground-light mt-4 text-center">
                Per problemi o segnalazioni:{' '}
                <a href={`mailto:${settings.support_email || settings.admin_email}`} className="text-neon-blue hover:text-white transition-colors">
                  {settings.support_email || settings.admin_email}
                </a>
              </p>
            )}
            <p className="text-sm text-foreground-muted mt-3 text-center">
              {buildInstitutionDisclaimer(settings.support_email || settings.admin_email)}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-6 mt-6 text-xs">
          <Link href="/privacy-policy" className="text-foreground-muted hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-foreground-muted/30">|</span>
          <Link href="/cookie-policy" className="text-foreground-muted hover:text-white transition-colors">
            Cookie Policy
          </Link>
        </div>

        <p className="text-xs text-foreground-muted/50 text-center mt-6 tracking-widest uppercase">
          Premium Knowledge Experience
        </p>
      </div>
    </motion.footer>
  );
}
