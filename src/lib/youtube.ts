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
    const info = await ytdl.getInfo(url);

    return {
      title: info.videoDetails.title || 'Unknown Title',
      duration: parseInt(info.videoDetails.lengthSeconds) || 0,
      thumbnail: info.videoDetails.thumbnails?.[0]?.url || '',
      videoId: info.videoDetails.videoId || '',
      author: info.videoDetails.author?.name || 'Unknown',
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw new Error('Failed to get video information');
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