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

  return {
    title: seoMessages?.title || 'YouTube to MP3 Converter',
    description: seoMessages?.description || 'Convert YouTube videos to MP3 format instantly',
    keywords: seoMessages?.keywords || 'youtube to mp3, converter, download',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    alternates: {
      canonical: '/',
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
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMessages?.title || 'YouTube to MP3 Converter',
      description: seoMessages?.description || 'Convert YouTube videos to MP3 format instantly',
    },
    robots: {
      index: true,
      follow: true,
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