import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YouTube to MP3 Converter',
    short_name: 'YT2MP3',
    description: 'Convert YouTube videos to high-quality MP3 files instantly',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff0000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['utilities', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'any',
  };
}