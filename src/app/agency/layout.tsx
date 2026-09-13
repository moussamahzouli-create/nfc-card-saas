import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Agency Marrakech & Full-Stack UX Engineering',
  description: 'وكالة BRANDXPER الرقمية في مراكش: تصميم الهويات البصرية والعلامات التجارية الفاخرة، برمجة وتطوير المواقع والتطبيقات السحابية Next.js، التسويق الإلكتروني عالي العائد ROAS، والإنتاج الإعلاني السينمائي وموشن جرافيك.',
  keywords: [
    'وكالة رقمية مراكش',
    'تصميم مواقع وتطبيقات المغرب',
    'تصميم هويات بصرية مراكش',
    'تسويق الكتروني المغرب',
    'digital agency Marrakech',
    'web development agency Morocco',
    'branding agency Marrakech',
    'UX engineering Next.js',
    'performance marketing agency Morocco',
    'agence digitale Marrakech',
    'création site internet Marrakech',
    'agence de communication Maroc',
  ],
  alternates: {
    canonical: 'https://www.brandxpere.com/agency',
  },
  openGraph: {
    title: 'BRANDXPER Digital Agency | Iconic Brands & Custom Web Systems',
    description: 'We build complete, timeless brand systems, high-performance Next.js platforms, and high-ROAS marketing funnels. Marrakech, Morocco.',
    url: 'https://www.brandxpere.com/agency',
    images: [
      {
        url: '/brandxpere-full.png',
        width: 1200,
        height: 630,
        alt: 'BRANDXPER Digital Agency Marrakech',
      },
    ],
  },
};

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
