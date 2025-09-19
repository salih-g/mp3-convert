import ytdl from '@distube/ytdl-core';
import youtubedl from 'youtube-dl-exec';
import { Readable } from 'stream';

interface YoutubeDLInfo {
  title: string;
  duration: number;
  thumbnail: string;
  id: string;
  uploader: string;
}

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  author?: string;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    console.log('Attempting to get video info for URL:', url);

    // Validate URL format
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      throw new Error('Invalid YouTube URL format');
    }

    // Try youtube-dl-exec first as it's more reliable against bot detection
    try {
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }) as YoutubeDLInfo;

      console.log('Successfully retrieved video info via youtube-dl-exec:', {
        title: info.title,
        duration: info.duration,
        videoId: info.id
      });

      return {
        title: info.title || 'Unknown Title',
        duration: Math.floor(info.duration) || 0,
        thumbnail: info.thumbnail || '',
        videoId: info.id || '',
        author: info.uploader || 'Unknown',
      };
    } catch (youtubeDlError) {
      console.log('youtube-dl-exec failed, falling back to ytdl-core:', youtubeDlError);

      // Fallback to ytdl-core with enhanced headers
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
          },
        },
        agent: undefined,
      });

      console.log('Successfully retrieved video info via ytdl-core:', {
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        videoId: info.videoDetails.videoId
      });

      return {
        title: info.videoDetails.title || 'Unknown Title',
        duration: parseInt(info.videoDetails.lengthSeconds) || 0,
        thumbnail: info.videoDetails.thumbnails?.[0]?.url || '',
        videoId: info.videoDetails.videoId || '',
        author: info.videoDetails.author?.name || 'Unknown',
      };
    }
  } catch (error) {
    console.error('Error getting video info:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      url: url
    });

    if (error instanceof Error) {
      if (error.message.includes('Video unavailable')) {
        throw new Error('Video is unavailable or private');
      }
      if (error.message.includes('age-restricted')) {
        throw new Error('Video is age-restricted');
      }
      if (error.message.includes('region')) {
        throw new Error('Video is not available in your region');
      }
      if (error.message.includes('Sign in to confirm')) {
        throw new Error('YouTube bot detection - please try again later');
      }
    }

    throw new Error('Failed to get video information: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function getAudioStream(url: string): Promise<Readable> {
  try {
    // First get video info to check available formats
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
      },
      agent: undefined,
    });

    console.log('Available formats:', info.formats.filter(f => f.hasAudio).map(f => ({
      itag: f.itag,
      container: f.container,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      audioBitrate: f.audioBitrate,
      audioQuality: f.audioQuality
    })));

    // Try to get audio stream with different quality options
    const stream = ytdl(url, {
      filter: format => format.hasAudio && !format.hasVideo,
      quality: 'highestaudio',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
        },
      },
      agent: undefined,
    });

    return stream;
  } catch (error) {
    console.error('Error getting audio stream:', error);
    throw new Error('Failed to get audio stream');
  }
}