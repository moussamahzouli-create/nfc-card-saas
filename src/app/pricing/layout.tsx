import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | Smart NFC Business Cards',
  description: 'أسعار وباقات بطاقات الأعمال الذكية NFC والبروفايل الرقمي من BRANDXPER. باقة مجانية وباقات احترافية للشركات والأفراد مع تحليلات متقدمة.',
  keywords: [
    'اسعار بطاقات NFC المغرب',
    'NFC business cards pricing',
    'prix carte de visite NFC Maroc',
    'شراء بطاقة ذكية',
    'اشتراكات بطاقة الاعمال الرقمية',
  ],
  alternates: {
    canonical: 'https://www.brandxpere.com/pricing',
  },
  openGraph: {
    title: 'Smart NFC Card Plans & Pricing | BRANDXPER',
    description: 'Transparent pricing for digital business cards & smart NFC hardware. Free plan available.',
    url: 'https://www.brandxpere.com/pricing',
    images: ['/brandxpere-full.png'],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
