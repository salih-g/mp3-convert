import { NextRequest, NextResponse } from 'next/server';
import { isValidYouTubeUrl, formatDuration } from '@/lib/utils';
import { getVideoInfo } from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video information using yt-dlp
    const videoInfo = await getVideoInfo(url);

    // Check duration limit (10 minutes = 600 seconds)
    if (videoInfo.duration > 600) {
      return NextResponse.json(
        { error: 'Video is too long (max 10 minutes)' },
        { status: 400 }
      );
    }

    const responseData = {
      title: videoInfo.title,
      duration: formatDuration(videoInfo.duration),
      thumbnail: videoInfo.thumbnail,
      videoId: videoInfo.videoId,
      author: videoInfo.author,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Video info error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable') || error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('private') || error.message.includes('restricted')) {
        return NextResponse.json(
          { error: 'Video is private or restricted' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}

// Add CORS headers for cross-origin requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}