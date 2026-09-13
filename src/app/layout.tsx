import type { Metadata, Viewport } from "next";
import { Poppins, Cairo } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const cairo = Cairo({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#301739",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brandxpere.com"),
  title: {
    default: "BRANDXPER | Premium Digital Agency & Smart NFC Cards | وكالة رقمية وبطاقات الأعمال الذكية",
    template: "%s | BRANDXPER",
  },
  description: "وكالة BRANDXPER الرقمية الرائدة في مراكش والمغرب. نقدم خدمات الهوية البصرية (Branding)، تطوير المواقع والتطبيقات عبر Next.js، التسويق الرقمي وإدارة الإعلانات، وبطاقات الأعمال الذكية NFC المتطورة. Premium Digital Agency & Smart NFC Business Cards in Marrakech, Morocco & Worldwide.",
  applicationName: "BRANDXPER",
  keywords: [
    // بطاقات الأعمال الذكية والـ NFC (Arabic)
    "بطاقات اعمال ذكية",
    "بطاقة عمل رقمية",
    "بطاقات NFC المغرب",
    "بطاقة بزنس كارد ذكية",
    "كارت فيزيت ذكية مراكش",
    "بطاقات تعريف ذكية للشركات",
    "شراء بطاقات NFC بالمغرب",
    // خدمات الوكالة الرقمية (Arabic)
    "وكالة رقمية مراكش",
    "تصميم مواقع المغرب",
    "برمجة مواقع وتطبيقات",
    "تصميم هويات بصرية",
    "تسويق رقمي المغرب",
    "إدارة الحملات الإعلانية",
    "إنتاج فيديو سينمائي وموشن جرافيك",
    "خدمات البراندينغ للشركات",
    // English keywords
    "smart NFC business cards Morocco",
    "digital business cards Marrakech",
    "digital agency Marrakech",
    "creative agency Morocco",
    "web development Next.js Morocco",
    "branding and identity systems",
    "high ROAS performance marketing",
    "cinematic media production Morocco",
    "luxury metal NFC cards",
    "NFC cards Africa",
    "brandxpere",
    "brandxper",
    // French keywords (Vital in Morocco)
    "cartes de visite connectées NFC Maroc",
    "carte de visite intelligente",
    "agence digitale Marrakech",
    "création site web Maroc Next.js",
    "agence de communication Marrakech",
    "identité visuelle et branding Maroc",
    "marketing digital et publicité Google Meta Maroc",
    "cartes NFC pour entreprises Maroc",
  ],
  authors: [{ name: "BRANDXPER Studio", url: "https://www.brandxpere.com" }],
  creator: "BRANDXPER",
  publisher: "BRANDXPER",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://www.brandxpere.com",
    languages: {
      "ar-MA": "https://www.brandxpere.com",
      "fr-MA": "https://www.brandxpere.com",
      "en-US": "https://www.brandxpere.com",
      "x-default": "https://www.brandxpere.com",
    },
  },
  openGraph: {
    title: "BRANDXPER | Premium Digital Agency & Smart NFC Cards",
    description: "Full-service digital agency and smart NFC solutions provider. Branding, UX web platforms, performance marketing, and connected identity in Marrakech and worldwide.",
    url: "https://www.brandxpere.com",
    siteName: "BRANDXPER",
    locale: "ar_MA",
    alternateLocale: ["en_US", "fr_MA"],
    type: "website",
    images: [
      {
        url: "/brandxpere-full.png",
        width: 1200,
        height: 630,
        alt: "BRANDXPER - Premium Digital Agency & Smart NFC Business Cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BRANDXPER | Digital Agency & Smart NFC Cards",
    description: "Crafting iconic brand systems, bespoke web apps, and connected smart NFC cards. Based in Marrakech, Morocco.",
    site: "@brandxpere",
    creator: "@brandxpere",
    images: ["/brandxpere-full.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/brandxpere-icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/brandxpere-icon.png",
    apple: [
      { url: "/brandxpere-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "d1ef1ac176a1f8e1",
  },
  other: {
    "google-site-verification": "googled1ef1ac176a1f8e1.html",
  },
  category: "technology",
};

// Schema.org Structured Data
const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "ProfessionalService", "Organization"],
      "@id": "https://www.brandxpere.com/#organization",
      "name": "BRANDXPER",
      "legalName": "BRANDXPER SARL",
      "alternateName": [
        "brandxpere",
        "وكالة براندكسبير الرقمية",
        "BrandXper Digital Agency & Smart NFC",
      ],
      "url": "https://www.brandxpere.com",
      "logo": "https://www.brandxpere.com/brandxpere-icon.png",
      "image": "https://www.brandxpere.com/brandxpere-full.png",
      "telephone": "+212778481250",
      "email": "BRANDXPER@GMAIL.COM",
      "priceRange": "$$",
      "currenciesAccepted": "MAD, USD, EUR",
      "paymentAccepted": "Cash, Credit Card, Wire Transfer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Marrakech",
        "addressRegion": "Marrakech-Safi",
        "addressCountry": "MA",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 31.6295,
        "longitude": -7.9811,
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          "opens": "09:00",
          "closes": "19:00",
        },
      ],
      "sameAs": [
        "https://www.instagram.com/brandxpere/",
        "https://wa.me/212778481250",
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "150",
        "bestRating": "5",
        "worstRating": "1",
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "BRANDXPER Core Services & Products",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Smart NFC Business Cards (بطاقات الأعمال الذكية NFC)",
              "description": "Laser-engraved metal & matte smart NFC cards with real-time cloud profile management.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Branding & Visual Identity Systems (الهوية البصرية والعلامة التجارية)",
              "description": "Bespoke logos, design tokens, brand books, and luxury corporate collateral.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "UX Engineering & Web Development (تطوير المنصات والمواقع)",
              "description": "Custom Next.js web applications, SaaS platforms, and conversion-optimized e-commerce.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Growth Marketing & Performance Ads (التسويق الرقمي وإدارة الحملات)",
              "description": "High-ROAS Meta & Google ads, full-funnel conversion tracking, and SEO domination.",
            },
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Cinematic Media & 3D Motion Graphics (الإنتاج الإعلامي وموشن جرافيك)",
              "description": "Commercial brand videos, 3D photorealistic product renders, and social content.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.brandxpere.com/#website",
      "url": "https://www.brandxpere.com",
      "name": "BRANDXPER",
      "publisher": {
        "@id": "https://www.brandxpere.com/#organization",
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.brandxpere.com/c/{search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${cairo.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="googled1ef1ac176a1f8e1.html" />
        <meta name="google-site-verification" content="googled1ef1ac176a1f8e1" />
        <meta name="google-site-verification" content="d1ef1ac176a1f8e1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
