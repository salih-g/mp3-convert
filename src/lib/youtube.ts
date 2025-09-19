import ytdl from '@distube/ytdl-core';
import { Readable } from 'stream';

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

    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    });

    console.log('Successfully retrieved video info:', {
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
    }

    throw new Error('Failed to get video information: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function getAudioStream(url: string): Promise<Readable> {
  try {
    // First get video info to check available formats
    const info = await ytdl.getInfo(url);

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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    });

    return stream;
  } catch (error) {
    console.error('Error getting audio stream:', error);
    throw new Error('Failed to get audio stream');
  }
}