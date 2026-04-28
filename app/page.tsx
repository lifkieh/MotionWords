'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Mic, ArrowRight, HandMetal } from "lucide-react";
import { useTranslation } from "./components/LanguageContext";

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('home.level1.title'),
      description: t('home.level1.desc'),
      icon: BookOpen,
      href: "/learn",
      color: "bg-blue-500",
    },
    {
      title: t('home.level2.title'),
      description: t('home.level2.desc'),
      icon: MessageSquare,
      href: "/spelling",
      color: "bg-purple-500",
    },
    {
      title: t('home.level3.title'),
      description: t('home.level3.desc'),
      icon: Mic,
      href: "/interactive",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="flex-1 w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-brand-100/50 to-transparent dark:from-brand-900/20 pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-brand-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none -z-10 dark:bg-brand-600/20" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10 dark:bg-purple-600/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center gap-12 text-left"
        >
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8 border border-brand-200 dark:border-brand-800/50">
              <HandMetal className="w-4 h-4" />
              <span>{t('home.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('home.title1')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">
                {t('home.title2')}
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl transition-all shadow-lg hover:shadow-brand-500/30"
              >
                {t('home.cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#levels"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl transition-all"
              >
                {t('home.explore')}
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-purple-500 rounded-[2rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
            <img 
              src="/hero.png" 
              alt="Sign Language Hero" 
              className="relative rounded-[2rem] shadow-2xl border-4 border-white dark:border-slate-800 object-cover w-full h-auto aspect-square lg:aspect-[4/3]"
            />
          </div>
        </motion.div>

        <motion.div
          id="levels"
          className="mt-32 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, staggerChildren: 0.2 }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                className="relative group bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 flex-grow">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-auto inline-flex items-center text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
                >
                  {t('home.startLevel')} <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}