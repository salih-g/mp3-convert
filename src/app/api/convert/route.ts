import { NextRequest, NextResponse } from 'next/server';
import { isValidYouTubeUrl, sanitizeFilename } from '@/lib/utils';
import { getVideoInfo, getAudioStream } from '@/lib/youtube';

// Force Node.js runtime for ytdl-core compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
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

    try {
      // Get audio stream
      const audioStream = await getAudioStream(url);

      // Convert stream to buffer using a more robust approach
      const chunks: Buffer[] = [];
      let totalSize = 0;

      return new Promise<NextResponse>((resolve) => {
        let hasError = false;

        audioStream.on('data', (chunk: Buffer) => {
          if (!hasError) {
            chunks.push(chunk);
            totalSize += chunk.length;
            console.log(`Received chunk: ${chunk.length} bytes, total: ${totalSize} bytes`);
          }
        });

        audioStream.on('end', () => {
          if (hasError) return;

          console.log(`Stream ended. Total chunks: ${chunks.length}, total size: ${totalSize} bytes`);

          if (chunks.length === 0 || totalSize === 0) {
            console.error('No audio data received from stream');
            resolve(NextResponse.json(
              { error: 'No audio data received' },
              { status: 500 }
            ));
            return;
          }

          // Combine all chunks into a single buffer
          const audioBuffer = Buffer.concat(chunks);
          console.log(`Final buffer size: ${audioBuffer.length} bytes`);

          // Return the file as a download
          const headers = new Headers({
            'Content-Type': 'audio/mp4',
            'Content-Disposition': `attachment; filename="${filename.replace('.mp3', '.m4a')}"`,
            'Content-Length': audioBuffer.length.toString(),
          });

          resolve(new NextResponse(audioBuffer, {
            status: 200,
            headers,
          }));
        });

        audioStream.on('error', (error: Error) => {
          hasError = true;
          console.error('Stream error:', error);

          if (error.message.includes('Video unavailable') ||
              error.message.includes('not found')) {
            resolve(NextResponse.json(
              { error: 'Video not found or unavailable' },
              { status: 404 }
            ));
          } else if (error.message.includes('private') ||
                     error.message.includes('restricted')) {
            resolve(NextResponse.json(
              { error: 'Video is private or restricted' },
              { status: 403 }
            ));
          } else {
            resolve(NextResponse.json(
              { error: 'Failed to convert video to audio' },
              { status: 500 }
            ));
          }
        });
      });

    } catch (streamError) {
      console.error('Stream error:', streamError);

      if (streamError instanceof Error) {
        if (streamError.message.includes('Video unavailable') ||
            streamError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Video not found or unavailable' },
            { status: 404 }
          );
        }
        if (streamError.message.includes('private') ||
            streamError.message.includes('restricted')) {
          return NextResponse.json(
            { error: 'Video is private or restricted' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to convert video to audio' },
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