'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HandMetal, BookOpen, MessageSquare, Mic, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from './LanguageContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useTranslation();

  const navItems = [
    { name: t('nav.home'),   href: '/', icon: HandMetal },
    { name: t('nav.level1'), href: '/learn', icon: BookOpen },
    { name: t('nav.level2'), href: '/spelling', icon: MessageSquare },
    { name: t('nav.level3'), href: '/interactive', icon: Mic },
    { name: 'Level 4: Practice', href: '/practice', icon: HandMetal },
  ];

  const toggleLocale = () => setLocale(locale === 'en' ? 'id' : 'en');

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{ background: 'var(--s1)', borderBottom: '1px solid var(--bd)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" style={{ textDecoration: 'none' }}>
            <div
              className="flex items-center justify-center w-[30px] h-[30px] rounded-[9px] flex-shrink-0"
              style={{ background: 'var(--ac)' }}
            >
              <HandMetal className="w-[15px] h-[15px] text-white" />
            </div>
            <span
              className="font-semibold text-[15px] tracking-tight"
              style={{ color: 'var(--t1)', letterSpacing: '-0.02em' }}
            >
              Motion<span style={{ color: 'var(--ac)' }}>Words</span>
            </span>
          </Link>

          {/* Desktop nav pill */}
          <div className="hidden md:flex nav-pill">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('nav-item flex items-center gap-1.5', isActive && 'active')}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="btn btn-ghost btn-sm flex items-center gap-1.5"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold">{locale === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}</span>
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleLocale} className="text-sm font-bold" style={{ color: 'var(--t2)' }}>
              {locale === 'en' ? '🇬🇧' : '🇮🇩'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--t2)' }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid var(--bd)', background: 'var(--s2)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'var(--ac-t)' : 'var(--t2)',
                      background: isActive ? 'var(--ac-bg)' : 'transparent',
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}