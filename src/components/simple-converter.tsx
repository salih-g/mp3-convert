'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Download, Loader2, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidYouTubeUrl } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  videoId: string;
}

interface ConversionState {
  status: 'idle' | 'fetching' | 'converting' | 'ffmpeg-converting' | 'completed' | 'error';
  progress?: number;
  error?: string;
  videoInfo?: VideoInfo;
  downloadUrl?: string;
}

export function SimpleConverter() {
  const [url, setUrl] = useState('');
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle'
  });
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const initFFmpeg = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();

      ffmpegRef.current.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
      });

      ffmpegRef.current.on('progress', ({ progress }) => {
        setConversionState(prev => ({
          ...prev,
          progress: Math.round(progress * 100)
        }));
      });

      await ffmpegRef.current.load();
    }
    return ffmpegRef.current;
  };

  const convertToMp3 = async (m4aBlob: Blob): Promise<Blob> => {
    const ffmpeg = await initFFmpeg();

    // Write M4A file to FFmpeg filesystem
    await ffmpeg.writeFile('input.m4a', await fetchFile(m4aBlob));

    // Convert M4A to MP3
    await ffmpeg.exec([
      '-i', 'input.m4a',
      '-acodec', 'libmp3lame',
      '-ab', '192k',
      '-ar', '44100',
      'output.mp3'
    ]);

    // Read the output MP3 file
    const data = await ffmpeg.readFile('output.mp3');

    // Clean up
    await ffmpeg.deleteFile('input.m4a');
    await ffmpeg.deleteFile('output.mp3');

    // Convert FileData to BlobPart for Blob creation
    return new Blob([data as BlobPart], { type: 'audio/mpeg' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    if (!isValidYouTubeUrl(url)) {
      setConversionState({
        status: 'error',
        error: 'Please enter a valid YouTube URL'
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

      // Check response headers
      const contentLength = convertResponse.headers.get('content-length');
      const contentType = convertResponse.headers.get('content-type');
      console.log('Response headers - Content-Length:', contentLength, 'Content-Type:', contentType);

      // Handle direct file download response
      const m4aBlob = await convertResponse.blob();
      console.log('Received M4A blob size:', m4aBlob.size, 'bytes');
      console.log('Blob type:', m4aBlob.type);

      // Verify blob size matches content-length
      if (contentLength && parseInt(contentLength) !== m4aBlob.size) {
        console.warn('Blob size mismatch! Expected:', contentLength, 'Got:', m4aBlob.size);
      }

      // Convert M4A to MP3 using FFmpeg
      setConversionState({
        status: 'ffmpeg-converting',
        videoInfo,
        progress: 0
      });

      console.log('Starting FFmpeg conversion...');
      const mp3Blob = await convertToMp3(m4aBlob);
      console.log('FFmpeg conversion completed. MP3 size:', mp3Blob.size, 'bytes');

      const downloadUrl = URL.createObjectURL(mp3Blob);

      setConversionState({
        status: 'completed',
        videoInfo,
        downloadUrl
      });

    } catch (error) {
      console.error('Conversion error:', error);
      setConversionState({
        status: 'error',
        error: error instanceof Error ? error.message : 'An error occurred. Please try again.'
      });
    }
  };

  const handleDownload = () => {
    if (conversionState.downloadUrl && conversionState.videoInfo) {
      // Use a more robust download approach
      const link = document.createElement('a');
      link.href = conversionState.downloadUrl;

      // Sanitize filename for download
      const sanitizedTitle = conversionState.videoInfo.title
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .substring(0, 100);

      link.download = `${sanitizedTitle}.mp3`;
      link.style.display = 'none';

      document.body.appendChild(link);

      // Add a small delay to ensure the link is in the DOM
      setTimeout(() => {
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          // Clean up the blob URL to free memory
          URL.revokeObjectURL(conversionState.downloadUrl!);
        }, 100);
      }, 100);
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
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={conversionState.status === 'fetching' || conversionState.status === 'converting' || conversionState.status === 'ffmpeg-converting'}
          />
          <Button
            type="submit"
            disabled={!url.trim() || conversionState.status === 'fetching' || conversionState.status === 'converting' || conversionState.status === 'ffmpeg-converting'}
            className="sm:w-auto w-full"
          >
            {conversionState.status === 'fetching' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {(conversionState.status === 'converting' || conversionState.status === 'ffmpeg-converting') && (
              <Music className="mr-2 h-4 w-4 animate-pulse-subtle" />
            )}
            {conversionState.status === 'fetching' ? 'Fetching info...' :
             conversionState.status === 'converting' ? 'Downloading audio...' :
             conversionState.status === 'ffmpeg-converting' ? `Converting to MP3... ${conversionState.progress || 0}%` :
             'Convert to MP3'}
          </Button>
        </div>
      </form>

      {/* Video Info Display */}
      {conversionState.videoInfo && (
        <div className="card p-4">
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                Duration: {conversionState.videoInfo.duration}
              </p>
              {(conversionState.status === 'converting' || conversionState.status === 'ffmpeg-converting') && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {conversionState.status === 'converting' ? 'Downloading audio...' :
                     `Converting to MP3... ${conversionState.progress || 0}%`}
                  </div>
                  {conversionState.status === 'ffmpeg-converting' && conversionState.progress && (
                    <div className="mt-1 w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${conversionState.progress}%` }}
                      ></div>
                    </div>
                  )}
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
            <span className="font-medium">Conversion completed!</span>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleDownload} size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download MP3
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Convert Another
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
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}