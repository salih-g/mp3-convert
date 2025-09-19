import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const locales = ['en', 'tr'];

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const messages = await getMessages();
  const seoMessages = messages.SEO as any;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: seoMessages?.title || 'YouTube to MP3 Converter',
    description: seoMessages?.description || 'Convert YouTube videos to MP3 format instantly',
    keywords: seoMessages?.keywords || 'youtube to mp3, converter, download',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: {
        'en': '/en',
        'tr': '/tr',
      },
    },
    openGraph: {
      title: seoMessages?.title || 'YouTube to MP3 Converter',
      description: seoMessages?.description || 'Convert YouTube videos to MP3 format instantly',
      type: 'website',
      locale: locale,
      url: locale === 'en' ? baseUrl : `${baseUrl}/${locale}`,
      siteName: 'YT2MP3',
      images: [
        {
          url: `/opengraph-image`,
          width: 1200,
          height: 630,
          alt: seoMessages?.title || 'YouTube to MP3 Converter',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMessages?.title || 'YouTube to MP3 Converter',
      description: seoMessages?.description || 'Convert YouTube videos to MP3 format instantly',
      images: [`/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'add-your-google-verification-code-here',
    },
    category: 'technology',
    classification: 'Tools',
    other: {
      'application-name': 'YT2MP3',
      'apple-mobile-web-app-title': 'YT2MP3',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}