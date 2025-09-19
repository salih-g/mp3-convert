'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Loader2, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidYouTubeUrl } from '@/lib/utils';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  videoId: string;
}

interface ConversionState {
  status: 'idle' | 'fetching' | 'converting' | 'completed' | 'error';
  progress?: number;
  error?: string;
  videoInfo?: VideoInfo;
  downloadUrl?: string;
}

export function YouTubeConverter() {
  const t = useTranslations('HomePage');
  const [url, setUrl] = useState('');
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    if (!isValidYouTubeUrl(url)) {
      setConversionState({
        status: 'error',
        error: t('error.invalidUrl')
      });
      return;
    }

    setConversionState({ status: 'fetching' });

    try {
      // First, get video info
      const infoResponse = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!infoResponse.ok) {
        const errorData = await infoResponse.json();
        throw new Error(errorData.error || 'Failed to fetch video info');
      }

      const videoInfo = await infoResponse.json();
      setConversionState({
        status: 'converting',
        videoInfo
      });

      // Then, convert to MP3
      const convertResponse = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!convertResponse.ok) {
        const errorData = await convertResponse.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const { downloadUrl } = await convertResponse.json();
      setConversionState({
        status: 'completed',
        videoInfo,
        downloadUrl
      });

    } catch (error) {
      console.error('Conversion error:', error);
      setConversionState({
        status: 'error',
        error: error instanceof Error ? error.message : t('error.generic')
      });
    }
  };

  const handleDownload = () => {
    if (conversionState.downloadUrl && conversionState.videoInfo) {
      const link = document.createElement('a');
      link.href = conversionState.downloadUrl;
      link.download = `${conversionState.videoInfo.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setUrl('');
    setConversionState({ status: 'idle' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            placeholder={t('urlPlaceholder')}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={conversionState.status === 'fetching' || conversionState.status === 'converting'}
          />
          <Button
            type="submit"
            disabled={!url.trim() || conversionState.status === 'fetching' || conversionState.status === 'converting'}
            className="sm:w-auto w-full"
          >
            {conversionState.status === 'fetching' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {conversionState.status === 'converting' && (
              <Music className="mr-2 h-4 w-4 animate-pulse-subtle" />
            )}
            {conversionState.status === 'fetching' ? t('fetchingInfo') :
             conversionState.status === 'converting' ? t('converting') :
             t('convertButton')}
          </Button>
        </div>
      </form>

      {/* Video Info Display */}
      {conversionState.videoInfo && (
        <div className="card p-4">
          <div className="flex gap-4">
            <img
              src={conversionState.videoInfo.thumbnail}
              alt={conversionState.videoInfo.title}
              className="w-24 h-18 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {conversionState.videoInfo.title}
              </h3>
              <p className="text-muted-foreground text-xs">
                {t('duration')}: {conversionState.videoInfo.duration}
              </p>
              {conversionState.status === 'converting' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t('converting')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {conversionState.status === 'completed' && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{t('conversionComplete')}</span>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg">
              <Download className="mr-2 h-4 w-4" />
              {t('downloadButton')}
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              {t('convertAnother')}
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {conversionState.status === 'error' && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{conversionState.error}</span>
          </div>
          <Button variant="secondary" onClick={resetForm}>
            {t('tryAgain')}
          </Button>
        </div>
      )}
    </div>
  );
}