import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
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
  title: "BRANDXPER | Premium Digital Agency & Smart NFC Cards | وكالة رقمية وبطاقات الأعمال الذكية",
  description: "BRANDXPER is a world-class digital agency specializing in branding, UX engineering, growth marketing, cinematic media, and next-gen NFC smart business cards. Marrakech, Maroc. Tel & WhatsApp: +212 778-481250. Instagram: @brandxpere",
  icons: {
    icon: '/brandxpere-icon.png',
    shortcut: '/brandxpere-icon.png',
    apple: '/brandxpere-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
