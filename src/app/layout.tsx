import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free YouTube to MP3 Converter - High Quality Audio Download",
  description: "Convert YouTube videos to MP3 format instantly. Fast, free, and high-quality audio conversion. No registration required.",
  keywords: "youtube to mp3, youtube converter, mp3 download, audio converter, free converter",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Free YouTube to MP3 Converter - High Quality Audio Download",
    description: "Convert YouTube videos to MP3 format instantly. Fast, free, and high-quality audio conversion. No registration required.",
    type: 'website',
    locale: 'en',
    siteName: 'YT2MP3',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free YouTube to MP3 Converter - High Quality Audio Download",
    description: "Convert YouTube videos to MP3 format instantly. Fast, free, and high-quality audio conversion. No registration required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}