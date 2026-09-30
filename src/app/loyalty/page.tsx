import type { Metadata } from 'next';
import LoyaltyLandingClient from './LoyaltyLandingClient';

export const metadata: Metadata = {
  title: 'Brand Xper Loyalty — La Carte de Fidélité Digitale pour Commerces',
  description:
    'Fidélisez vos clients avec une carte de fidélité 100% digitale sur smartphone. Sans application à télécharger. Attribution rapide de tampons par code PIN ou scanner QR commerçant. Pensé pour les commerces indépendants, cafés, restaurants et boutiques.',
  keywords: [
    'carte de fidélité digitale maroc',
    'programme de fidélité commerce',
    'fidélisation client smartphone',
    'carte fidélité qr code',
    'tampon digital fidelite',
    'espace commerçant fidélité',
    'brand xper loyalty',
    'fidelite cafe restaurant maroc',
    'digital loyalty card morocco',
  ],
  openGraph: {
    title: 'Brand Xper Loyalty — Révolutionnez la fidélité de votre commerce',
    description:
      'Transformez chaque visite en une raison de revenir. Carte de fidélité digitale sans application, double validation PIN & QR, et tableau de bord commerçant en temps réel.',
    url: 'https://www.brandxpere.com/loyalty',
    siteName: 'Brand Xper Loyalty',
    locale: 'fr_MA',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.brandxpere.com/loyalty',
  },
};

export default function LoyaltyPage() {
  return <LoyaltyLandingClient />;
}
