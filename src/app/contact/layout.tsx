import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Marrakech Studio',
  description: 'تواصل مباشرة مع فريق وكالة BRANDXPER في مراكش، المغرب. رقم الهاتف والواتساب الرسمي: 212778481250+، البريد: BRANDXPER@GMAIL.COM. طلبات بطاقات الشركات واستشارات المشاريع.',
  keywords: [
    'تواصل مع brandxpere',
    'مكتب brandxper مراكش',
    'رقم هاتف brandxper',
    'contact brandxper Marrakech',
    'agence de communication Marrakech contact',
  ],
  alternates: {
    canonical: 'https://www.brandxpere.com/contact',
  },
  openGraph: {
    title: 'Contact BRANDXPER | Marrakech Studio & Direct Consultation',
    description: 'Direct communication hotline +212 778-481250 for smart NFC cards and digital agency inquiries.',
    url: 'https://www.brandxpere.com/contact',
    images: ['/brandxpere-full.png'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
