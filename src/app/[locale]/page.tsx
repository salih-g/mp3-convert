import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { YouTubeConverter } from '@/components/youtube-converter';
import { LanguageSelector } from '@/components/language-selector';
import { Music, Zap, Shield, Heart } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="w-full px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">YT2MP3</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Converter Section */}
          <div className="mb-16">
            <YouTubeConverter />
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.highQuality')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.highQualityDesc')}</p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.fast')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.fastDesc')}</p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.free')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.freeDesc')}</p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">{t('features.secure')}</h3>
              <p className="text-sm text-muted-foreground">{t('features.secureDesc')}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('howToUse.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <p className="text-sm text-muted-foreground">{t('howToUse.step1')}</p>
              </div>
              <div className="p-4">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <p className="text-sm text-muted-foreground">{t('howToUse.step2')}</p>
              </div>
              <div className="p-4">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <p className="text-sm text-muted-foreground">{t('howToUse.step3')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 YT2MP3. {t('footer.allRightsReserved')}</p>
          <p className="mt-2">{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  );
}