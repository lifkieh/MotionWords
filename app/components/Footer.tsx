import Link from 'next/link';
import { HandMetal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <HandMetal className="w-5 h-5 text-brand-500" />
            <span className="font-semibold text-slate-900 dark:text-white">MotionWords</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
            Empowering communication through visual learning. Supports BISINDO and SIBI.
          </div>
          <div className="flex gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="/learn" className="hover:text-brand-600 transition-colors">Alphabet</Link>
            <Link href="/spelling" className="hover:text-brand-600 transition-colors">Words</Link>
            <Link href="/interactive" className="hover:text-brand-600 transition-colors">Interactive</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} MotionWords. Built for inclusive education.
        </div>
      </div>
    </footer>
  );
}
