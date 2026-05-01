'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, MessageSquare, Mic, ArrowRight, HandMetal } from 'lucide-react';
import { useTranslation } from './components/LanguageContext';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      num: '01',
      title: t('home.level1.title'),
      desc: t('home.level1.desc'),
      icon: BookOpen,
      href: '/learn',
    },
    {
      num: '02',
      title: t('home.level2.title'),
      desc: t('home.level2.desc'),
      icon: MessageSquare,
      href: '/spelling',
    },
    {
      num: '03',
      title: t('home.level3.title'),
      desc: t('home.level3.desc'),
      icon: Mic,
      href: '/interactive',
    },
  ];

  const metrics = [
    { val: '4',    label: t('home.level1.title').includes('Alfabet') ? 'Sistem isyarat' : 'Sign systems' },
    { val: 'A–Z',  label: t('home.level1.title').includes('Alfabet') ? 'Alfabet penuh' : 'Full alphabet' },
    { val: '3',    label: 'Levels' },
    { val: 'Free', label: t('home.level1.title').includes('Alfabet') ? 'Tanpa akun' : 'No account' },
  ];

  const systems = ['BISINDO', 'SIBI', 'ASL', 'International Sign'];

  return (
    <div className="flex-1 w-full">

      {/* ── Support bar ── */}
      <div
        className="flex items-center gap-7 px-6 lg:px-10 py-3.5 overflow-x-auto"
        style={{ background: 'var(--s2)', borderBottom: '1px solid var(--bd)' }}
      >
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.09em] whitespace-nowrap flex-shrink-0"
          style={{ color: 'var(--t3)' }}
        >
          {t('home.level1.title').includes('Alfabet') ? 'Mendukung' : 'Supports'}
        </span>
        <div className="flex items-center gap-5 flex-wrap">
          {systems.map((sys, i) => (
            <span key={sys} className="flex items-center gap-5">
              <span
                className="text-[13.5px] font-medium"
                style={{ color: 'var(--t3)', letterSpacing: '-0.01em' }}
              >
                {sys}
              </span>
              {i < systems.length - 1 && (
                <span
                  className="w-[3px] h-[3px] rounded-full flex-shrink-0"
                  style={{ background: 'var(--bd2)' }}
                />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-center px-6 lg:px-10 pt-20 pb-16"
        style={{ background: 'var(--bg)' }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none grid-bg" />

        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-7">
            <span className="eyebrow">
              <span className="live-dot" />
              {t('home.badge')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="font-semibold leading-[1.06] mb-5"
            style={{
              fontSize: 'clamp(40px, 7vw, 64px)',
              letterSpacing: '-0.04em',
              color: 'var(--t1)',
            }}
          >
            {t('home.title1')}{' '}
            <span style={{ color: 'var(--ac)' }}>{t('home.title2')}</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mb-10 mx-auto"
            style={{
              fontSize: '16px',
              color: 'var(--t2)',
              lineHeight: '1.7',
              maxWidth: '420px',
            }}
          >
            {t('home.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-14"
          >
            <Link href="/learn" className="btn btn-primary btn-lg">
              {t('home.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#levels" className="btn btn-outline btn-lg">
              {t('home.explore')}
            </Link>
          </motion.div>

          {/* Metrics */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="metric-row"
          >
            {metrics.map((m) => (
              <div key={m.label} className="metric-cell">
                <div className="metric-val">{m.val}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Feature cards ── */}
      <section
        id="levels"
        className="px-6 lg:px-10 py-20"
        style={{ background: 'var(--s1)' }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="section-over">{t('home.explore')}</p>
          <h2 className="section-title mb-10">
            {t('home.level1.title').includes('Alfabet')
              ? 'Tiga level untuk menguasai bahasa isyarat'
              : 'Three levels to master sign language'}
          </h2>

          <motion.div
            className="grid md:grid-cols-3 gap-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.href}
                  variants={{
                    initial: { opacity: 0, y: 24 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } },
                  }}
                >
                  <Link
                    href={f.href}
                    className="card card-hover flex flex-col h-full p-7"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {/* Level tag */}
                    <p
                      className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-5"
                      style={{ color: 'var(--t3)' }}
                    >
                      {f.num}
                    </p>

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-5 flex-shrink-0"
                      style={{ background: 'var(--ac-bg)', border: '1px solid var(--ac-bd)' }}
                    >
                      <Icon className="w-[17px] h-[17px]" style={{ color: 'var(--ac)' }} />
                    </div>

                    {/* Text */}
                    <h3
                      className="font-semibold mb-2 leading-tight"
                      style={{ fontSize: '16.5px', letterSpacing: '-0.025em', color: 'var(--t1)' }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed flex-grow mb-6"
                      style={{ color: 'var(--t2)', lineHeight: '1.65' }}
                    >
                      {f.desc}
                    </p>

                    {/* CTA */}
                    <span
                      className="flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: 'var(--ac)' }}
                    >
                      {t('home.startLevel')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    {/* Ghost number */}
                    <span
                      className="absolute right-4 bottom-1 text-[88px] font-bold leading-none pointer-events-none select-none"
                      style={{ color: 'rgba(74,108,247,0.05)', letterSpacing: '-0.04em' }}
                    >
                      {f.num}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}