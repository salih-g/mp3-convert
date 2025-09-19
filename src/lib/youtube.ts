import ytdl from '@distube/ytdl-core';
import { Readable } from 'stream';
import fetch from 'node-fetch';

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

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Alternative method to get video info by scraping YouTube page
async function getVideoInfoFromPage(url: string): Promise<VideoInfo> {
  const headers = getRandomHeaders();

  try {
    console.log('Attempting to fetch video info from YouTube page directly...');

    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract video info from page HTML
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Title';

    // Extract duration from JSON data
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 0;

    // Extract thumbnail
    const thumbnailMatch = html.match(/"url":"(https:\/\/i\.ytimg\.com\/vi\/[^"]+)"/);
    const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';

    // Extract author
    const authorMatch = html.match(/"author":"([^"]+)"/);
    const author = authorMatch ? authorMatch[1] : 'Unknown';

    // Extract video ID
    const videoId = extractVideoId(url) || '';

    console.log('Successfully extracted video info from page:', {
      title,
      duration,
      videoId,
      author
    });

    return {
      title,
      duration,
      thumbnail,
      videoId,
      author,
    };
  } catch (error) {
    console.error('Failed to get video info from page:', error);
    throw error;
  }
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  let lastError: Error | null = null;

  // Validate URL format first
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    throw new Error('Invalid YouTube URL format');
  }

  console.log('Starting video info extraction for:', url);

  // Method 1: Try direct page scraping first (most reliable)
  try {
    console.log('Method 1: Attempting direct page scraping...');
    return await getVideoInfoFromPage(url);
  } catch (error) {
    lastError = error instanceof Error ? error : new Error('Unknown error');
    console.log('Method 1 failed:', lastError.message);
  }

  // Method 2: Try ytdl-core (if page scraping failed)
  // Note: ytdl-core may still create debug files, but page scraping should work first
  const ytdlAttempts = [
    // Safe ytdl.getInfo
    () => ytdl.getInfo(url, {
      requestOptions: {
        headers: getRandomHeaders(),
      },
    }),

    // Alternative with different headers
    () => ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          ...getRandomHeaders(),
          'Cookie': '',
        },
      },
    })
  ];

  for (let i = 0; i < ytdlAttempts.length; i++) {
    try {
      console.log(`Method 2.${i + 1}: Attempting ytdl-core...`);

      // Add small random delay
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }

      const info = await ytdlAttempts[i]();

      console.log(`Method 2.${i + 1} succeeded:`, {
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
      console.log(`Method 2.${i + 1} failed:`, lastError.message);

      // Skip remaining ytdl attempts if it's a file system error
      if (lastError.message.includes('EROFS') || lastError.message.includes('read-only')) {
        console.log('File system error detected, skipping remaining ytdl attempts');
        break;
      }
    }
  }

  // Method 3: Last resort - extract from URL if it has video ID
  try {
    console.log('Method 3: Attempting basic info extraction from URL...');
    const videoId = extractVideoId(url);

    if (videoId) {
      // Create basic info if we can at least get the video ID
      return {
        title: `YouTube Video ${videoId}`,
        duration: 0, // Unknown duration
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        videoId,
        author: 'Unknown',
      };
    }
  } catch (error) {
    console.log('Method 3 failed:', error);
  }

  // All methods failed
  console.error('All methods failed. Last error:', lastError);

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
    if (lastError.message.includes('EROFS') || lastError.message.includes('read-only')) {
      throw new Error('Server file system restriction. Please try again.');
    }
  }

  throw new Error('Failed to get video information using all available methods: ' + (lastError?.message || 'Unknown error'));
}

export async function getAudioStream(url: string): Promise<Readable> {
  let lastError: Error | null = null;

  // Try multiple approaches for getting audio stream
  const streamAttempts = [
    // Attempt 1: High quality audio without video
    () => {
      const headers = getRandomHeaders();
      return ytdl(url, {
        filter: format => format.hasAudio && !format.hasVideo,
        quality: 'highestaudio',
        requestOptions: {
          headers,
        },
      });
    },

    // Attempt 2: Alternative with different quality
    () => {
      const headers = getRandomHeaders();
      return ytdl(url, {
        filter: format => format.hasAudio,
        quality: 'lowestaudio', // Lower quality as fallback
        requestOptions: {
          headers,
        },
      });
    },

    // Attempt 3: Any audio format
    () => {
      const headers = getRandomHeaders();
      return ytdl(url, {
        filter: 'audioonly',
        requestOptions: {
          headers,
        },
      });
    }
  ];

  for (let i = 0; i < streamAttempts.length; i++) {
    try {
      console.log(`Attempting to get audio stream (method ${i + 1})...`);

      // Add delay between attempts
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
      }

      const stream = streamAttempts[i]();

      // Test if stream is valid by listening for data
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Stream timeout'));
        }, 10000);

        stream.once('response', () => {
          clearTimeout(timeout);
          console.log(`Audio stream method ${i + 1} successful`);
          resolve(stream);
        });

        stream.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.log(`Audio stream method ${i + 1} failed:`, lastError.message);

      // Skip remaining attempts if it's a file system error
      if (lastError.message.includes('EROFS') || lastError.message.includes('read-only')) {
        console.log('File system error detected, skipping remaining stream attempts');
        break;
      }
    }
  }

  console.error('All audio stream methods failed. Last error:', lastError);
  throw new Error('Failed to get audio stream: ' + (lastError?.message || 'Unknown error'));
}