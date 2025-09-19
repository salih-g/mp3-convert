export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  videoId: string;
  author?: string;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  try {
    // Use yt-dlp to get video information
    const YTDlpWrap = (await import('yt-dlp-wrap')).default;
    const ytDlpWrap = new YTDlpWrap();

    const info = await ytDlpWrap.getVideoInfo(url);

    return {
      title: info.title || 'Unknown Title',
      duration: info.duration || 0,
      thumbnail: info.thumbnail || '',
      videoId: info.id || '',
      author: info.uploader || info.channel || 'Unknown',
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw new Error('Failed to get video information');
  }
}

export async function downloadAudio(url: string, outputPath: string): Promise<string> {
  try {
    const YTDlpWrap = (await import('yt-dlp-wrap')).default;
    const ytDlpWrap = new YTDlpWrap();

    // Download audio in best quality, convert to MP3
    await ytDlpWrap.exec([
      url,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0', // Best quality
      '--output', outputPath,
      '--no-playlist',
      '--restrict-filenames', // Avoid special characters in filenames
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      '--referer', 'https://www.youtube.com/',
    ]);

    return outputPath;
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error('Failed to download and convert audio');
  }
}