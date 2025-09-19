import { NextRequest, NextResponse } from 'next/server';
import { isValidYouTubeUrl, sanitizeFilename } from '@/lib/utils';
import { getVideoInfo, downloadAudio } from '@/lib/youtube';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(clientIp, 3, 3600); // 3 requests per hour

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const { url } = await request.json();

    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video information first
    const videoInfo = await getVideoInfo(url);

    // Check duration limit (10 minutes = 600 seconds)
    if (videoInfo.duration > 600) {
      return NextResponse.json(
        { error: 'Video is too long (max 10 minutes)' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedTitle = sanitizeFilename(videoInfo.title);
    const filename = `${sanitizedTitle}.mp3`;

    // Create temporary file path
    const tempDir = tmpdir();
    const tempFilePath = path.join(tempDir, `${Date.now()}-${videoInfo.videoId}`);
    const outputPath = `${tempFilePath}.%(ext)s`;

    try {
      // Download and convert audio
      await downloadAudio(url, outputPath);

      // Find the actual output file
      const actualOutputPath = `${tempFilePath}.mp3`;

      // Read the file
      const audioBuffer = await fs.readFile(actualOutputPath);

      // Clean up temporary file
      try {
        await fs.unlink(actualOutputPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      // Return the file as a download
      const headers = new Headers({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': audioBuffer.length.toString(),
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      });

      return new NextResponse(audioBuffer, {
        status: 200,
        headers,
      });

    } catch (downloadError) {
      console.error('Download error:', downloadError);

      // Try to clean up any partial files
      try {
        await fs.unlink(`${tempFilePath}.mp3`);
      } catch {
        // Ignore cleanup errors
      }

      if (downloadError instanceof Error) {
        if (downloadError.message.includes('Video unavailable') ||
            downloadError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Video not found or unavailable' },
            { status: 404 }
          );
        }
        if (downloadError.message.includes('private') ||
            downloadError.message.includes('restricted')) {
          return NextResponse.json(
            { error: 'Video is private or restricted' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to convert video to MP3' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add CORS headers
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}