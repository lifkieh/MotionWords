'use client';

import Link from 'next/link';
import { HandMetal } from 'lucide-react';
import { useTranslation } from './LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="mt-auto"
      style={{ borderTop: '1px solid var(--bd)', background: 'var(--s2)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2" style={{ color: 'var(--t1)' }}>
            <div
              className="w-[23px] h-[23px] rounded-[7px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--ac)' }}
            >
              <HandMetal className="w-[11px] h-[11px] text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ letterSpacing: '-0.02em' }}>
              Motion<span style={{ color: 'var(--ac)' }}>Words</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-xs text-center" style={{ color: 'var(--t3)', maxWidth: '300px' }}>
            {t('footer.tagline')}
          </p>

          {/* Links */}
          <div className="flex gap-5">
            {[
              { label: t('footer.alphabet'),    href: '/learn' },
              { label: t('footer.words'),       href: '/spelling' },
              { label: t('footer.interactive'), href: '/interactive' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--t3)', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t2)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="mt-6 pt-6 text-center text-[11px]"
          style={{ borderTop: '1px solid var(--bd)', color: 'var(--t3)' }}
        >
          {t('footer.copyright', { year: new Date().getFullYear().toString() })}
        </div>
      </div>
    </footer>
  );
}