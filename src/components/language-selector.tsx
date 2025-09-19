'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSelector() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments[1] === 'en' || segments[1] === 'tr') {
      segments[1] = newLocale;
    } else {
      segments.unshift('', newLocale);
    }
    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label={t('language')}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{t('language')}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 rounded-md border bg-background shadow-md z-50">
          <button
            onClick={() => switchLocale('en')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
              locale === 'en' ? 'bg-accent' : ''
            }`}
          >
            {t('english')}
          </button>
          <button
            onClick={() => switchLocale('tr')}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
              locale === 'tr' ? 'bg-accent' : ''
            }`}
          >
            {t('turkish')}
          </button>
        </div>
      )}
    </div>
  );
}