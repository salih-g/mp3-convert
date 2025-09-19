import ytdl from '@distube/ytdl-core';
import { Readable } from 'stream';

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  author?: string;
}

// Function to generate random realistic headers
function getRandomHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];

  const acceptLanguages = [
    'en-US,en;q=0.9',
    'en-US,en;q=0.8,tr;q=0.6',
    'en-GB,en;q=0.9',
    'tr-TR,tr;q=0.9,en;q=0.8'
  ];

  return {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)],
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'Pragma': 'no-cache',
  };
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  let lastError: Error | null = null;

  // Try multiple times with different configurations
  const attempts = [
    // Attempt 1: Basic configuration with random headers
    () => ytdl.getInfo(url, {
      requestOptions: {
        headers: getRandomHeaders(),
      }
    }),

    // Attempt 2: With different request options
    () => ytdl.getInfo(url, {
      requestOptions: {
        headers: getRandomHeaders(),
      }
    }),

    // Attempt 3: With basic info only (faster)
    () => ytdl.getBasicInfo(url, {
      requestOptions: {
        headers: getRandomHeaders(),
      }
    })
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log(`Attempting to get video info for URL (attempt ${i + 1}):`, url);

      // Validate URL format
      if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        throw new Error('Invalid YouTube URL format');
      }

      // Add small random delay to appear more human-like
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }

      const info = await attempts[i]();

      console.log(`Successfully retrieved video info (attempt ${i + 1}):`, {
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
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.log(`Attempt ${i + 1} failed:`, lastError.message);

      // If this is a bot detection error, try next method immediately
      if (lastError.message.includes('Sign in to confirm') ||
          lastError.message.includes('playError')) {
        continue;
      }

      // For other errors, still try other methods but log more details
      console.error(`Attempt ${i + 1} error details:`, {
        message: lastError.message,
        url: url
      });
    }
  }

  // All attempts failed
  console.error('All attempts failed. Last error:', lastError);

  if (lastError) {
    if (lastError.message.includes('Video unavailable')) {
      throw new Error('Video is unavailable or private');
    }
    if (lastError.message.includes('age-restricted')) {
      throw new Error('Video is age-restricted');
    }
    if (lastError.message.includes('region')) {
      throw new Error('Video is not available in your region');
    }
    if (lastError.message.includes('Sign in to confirm') || lastError.message.includes('playError')) {
      throw new Error('YouTube bot detection triggered. Video may be region-restricted or require sign-in.');
    }
  }

  throw new Error('Failed to get video information after multiple attempts: ' + (lastError?.message || 'Unknown error'));
}

export async function getAudioStream(url: string): Promise<Readable> {
  try {
    // Use the same logic as getVideoInfo for better reliability
    const headers = getRandomHeaders();

    // First get video info to check available formats
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers,
      }
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
        headers,
      }
    });

    return stream;
  } catch (error) {
    console.error('Error getting audio stream:', error);
    throw new Error('Failed to get audio stream');
  }
}