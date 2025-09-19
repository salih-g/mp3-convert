import Link from 'next/link';
import { Music, Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Music className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">YT2MP3</span>
        </div>

        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h1>
          <p className="text-muted-foreground mb-2">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <p className="text-sm text-muted-foreground">
            Ana sayfaya dönüp YouTube videolarınızı MP3'e dönüştürmeye devam edebilirsiniz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
          </Button>

          <Button variant="secondary" asChild className="flex items-center gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-4">Popüler İşlemler:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/"
              className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
            >
              YouTube'dan MP3
            </Link>
            <Link
              href="/"
              className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
            >
              Yüksek Kalite İndirme
            </Link>
            <Link
              href="/"
              className="text-xs bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
            >
              Ücretsiz Dönüştürme
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-xs text-muted-foreground">
          <p>Sorun devam ederse, lütfen ana sayfayı ziyaret edin.</p>
        </div>
      </div>
    </div>
  );
}