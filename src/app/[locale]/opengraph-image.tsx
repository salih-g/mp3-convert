import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'YouTube to MP3 Converter';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const title = locale === 'tr'
    ? 'YouTube\'dan MP3 Dönüştürücü'
    : 'YouTube to MP3 Converter';

  const description = locale === 'tr'
    ? 'YouTube videolarını yüksek kaliteli MP3 dosyalarına dönüştürün'
    : 'Convert YouTube videos to high-quality MP3 files';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#ff0000',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <div
              style={{
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
              }}
            >
              ♪
            </div>
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '48px',
              fontWeight: 'bold',
            }}
          >
            YT2MP3
          </div>
        </div>

        <div
          style={{
            color: 'white',
            fontSize: '64px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '24px',
            maxWidth: '900px',
            lineHeight: '1.1',
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '28px',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.3',
          }}
        >
          {description}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '20px',
          }}
        >
          {locale === 'tr' ? 'Ücretsiz • Hızlı • Güvenli' : 'Free • Fast • Secure'}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}