'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainNavbar from '@/components/MainNavbar';
import { useTranslation } from '@/lib/i18n';
import {
  Sparkles,
  Smartphone,
  QrCode,
  Award,
  Gift,
  Check,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Star,
  Store,
  Users,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Clock,
  Zap,
  Coffee,
  Utensils,
  Scissors,
  ShoppingBag,
  Dumbbell,
  Croissant,
  Building2,
  Wrench,
  KeyRound,
  Camera,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Phone,
  ScanLine,
  XCircle,
  Eye,
  BadgeCheck,
  Languages,
} from 'lucide-react';

type Lang = 'en' | 'fr' | 'ar';

// ═══════════════════════════════════════════════════════════
// TRILINGUAL CONTENT MATRIX (EN, FR, AR)
// ═══════════════════════════════════════════════════════════
const TRANSLATIONS = {
  en: {
    heroTag: 'Brand Xper Digital Loyalty System',
    heroTitle: 'Turn Every Customer Visit Into Loyalty.',
    heroSubtitle:
      'Say goodbye to lost paper cards. Brand Xper equips your business with a 100% digital loyalty card on smartphone. Zero app to download, instant QR onboarding, and secure dual validation by PIN or merchant camera scanner.',
    ctaPrimary: 'Start Your Loyalty Program',
    ctaSecondary: 'Explore How It Works',
    trust0App: '0 App Needed',
    trust0AppSub: '100% Mobile Browser & Wallet',
    trustOnboard: '15 Seconds',
    trustOnboardSub: 'Instant Customer Onboarding',
    trustDual: 'Dual Validation',
    trustDualSub: 'PIN Code or QR Scanner',

    // Section 2: What is it
    whatTag: 'The Solution',
    whatTitle: 'What is Brand Xper Loyalty?',
    whatDesc:
      'Brand Xper Loyalty is a smart digital loyalty card system that enables independent businesses, cafés, restaurants, and retail stores to reward returning customers through an effortless mobile-first stamp experience.',
    whatCard1Title: 'No Physical Card Needed',
    whatCard1Desc: 'Customers never lose their card again because it lives safely inside their smartphone.',
    whatCard2Title: 'Direct Customer Data',
    whatCard2Desc: 'Collect customer names and real phone numbers directly into your private merchant CRM.',
    whatCard3Title: 'Total Stamp Security',
    whatCard3Desc: 'Stamps can only be awarded through your secure merchant PIN or camera QR scanner.',

    // Section 3: How it works
    howTag: 'Simple Process',
    howTitle: 'How It Works in 4 Simple Steps',
    howSubtitle: 'A frictionless experience designed to take less than 10 seconds for both customers and cashier staff.',
    step1Num: '01',
    step1Title: 'Customer Scans QR',
    step1Desc: 'The customer scans the Brand Xper QR code displayed on your counter, table, or reception.',
    step2Num: '02',
    step2Title: 'Instant Access',
    step2Desc: 'Their digital loyalty card opens immediately in their mobile browser without any app install.',
    step3Num: '03',
    step3Title: 'Merchant Adds Stamp',
    step3Desc: 'Cashier enters a 4-digit PIN on the customer’s phone or scans their personal QR code.',
    step4Num: '04',
    step4Title: 'Collect & Reward',
    step4Desc: 'Customer completes their stamp progress, unlocks exclusive rewards, and keeps coming back.',

    // Section 4: Two ways to add a stamp
    waysTag: 'Dual Validation Flow',
    waysTitle: 'Two Secure Ways to Add a Stamp',
    waysSubtitle: 'Choose the method that best matches your workflow at checkout or table service.',
    m1Badge: 'Method 1',
    m1Title: 'Secure Merchant PIN Code',
    m1Desc:
      'Customer scans your business QR code. The merchant enters their secret 4-digit PIN directly on the customer’s screen. Stamp is verified and added in 2 seconds. Zero hardware needed.',
    m1Benefit1: 'Works instantly on any customer smartphone',
    m1Benefit2: 'No staff device or app required',
    m1Benefit3: 'PIN code can be updated anytime from your dashboard',

    m2Badge: 'Method 2 (New)',
    m2Title: 'Scan Customer QR Code',
    m2Desc:
      'Customer displays their unique personal loyalty QR on their card. Merchant opens the camera scanner from the Merchant Portal, scans the customer QR, verifies their profile, and taps "Add Stamp".',
    m2Benefit1: 'Fast, modern, touchless camera scanning',
    m2Benefit2: 'Instantly identifies customer name & stamp balance',
    m2Benefit3: 'One-tap confirmation with live success feedback',

    // Section 5: Digital loyalty card
    cardTag: 'The Digital Card',
    cardTitle: 'A Premium Digital Card in Every Customer’s Pocket',
    cardDesc:
      'Designed with high-end aesthetics, the Brand Xper loyalty card reflects your brand identity with pride. No bank-card numbers, no complex setup—just pure, delightful retention.',
    cardHolder: 'Card Holder',
    cardStamps: 'Stamps',
    cardRewardTitle: 'Reward Status',
    cardUnlocked: '🎉 Reward Unlocked! Claim in Store',
    cardRemaining: 'stamps left until VIP Reward',
    cardMyQr: 'Personal Customer QR Code',
    cardPresentText: 'Show this QR to merchant for instant camera stamping',

    // Section 6: Stamps & Rewards
    stampsTag: 'Interactive Demo',
    stampsTitle: 'Stamps & Rewards Experience',
    stampsSubtitle: 'Click any number to preview stamp progression and reward unlocking in real time:',

    // Section 7: Customer Experience
    cxTag: 'Customer Experience',
    cxTitle: 'Effortless for Customers, Every Single Time',
    cxDesc:
      'Customers love loyalty programs that respect their time. With Brand Xper, there are no forgotten passwords, no app downloads eating memory, and no lost cards.',
    cxPoint1: 'Zero App Download',
    cxPoint1Desc: 'Works instantly in mobile Safari, Chrome, and any web browser.',
    cxPoint2: 'Home Screen Bookmark',
    cxPoint2Desc: 'Customers can save their card to their phone home screen with 1 tap.',
    cxPoint3: 'Always Accessible',
    cxPoint3Desc: 'Available 24/7 with real-time balance tracking and rewards.',

    // Section 8: Merchant Dashboard
    dashTag: 'Merchant Dashboard',
    dashTitle: 'Your Private Control Center',
    dashDesc:
      'Track customer visits, manage stamps, view unmasked contact details, and measure real retention results from any phone, tablet, or laptop.',
    dashTile1: 'Total Customers',
    dashTile2: 'Stamps Awarded',
    dashTile3: 'Rewards Claimed',
    dashTile4: 'Visits This Month',

    // Section 9: Customer Management
    crmTag: 'Customer Management',
    crmTitle: 'Know Your Most Valuable Customers',
    crmDesc:
      'Unlike paper cards, Brand Xper provides a full customer directory with real unmasked phone numbers, visit frequency, and loyalty tier status.',
    crmColName: 'Customer',
    crmColPhone: 'Full Phone Number',
    crmColStamps: 'Stamps',
    crmColStatus: 'Status',
    crmColVisit: 'Last Visit',
    crmTagLoyal: 'Loyal VIP',
    crmTagReady: 'Reward Ready',
    crmTagNew: 'New Member',

    // Section 10: Benefits
    benTag: 'Business Benefits',
    benTitle: 'Why Modern Businesses Choose Brand Xper',
    benSubtitle: 'A practical, high-ROI solution built for everyday retail and hospitality.',
    ben1Title: 'Increase Repeat Visits',
    ben1Desc: 'Turn occasional visitors into loyal weekly regulars with rewarding milestones.',
    ben2Title: 'Build Real Customer Loyalty',
    ben2Desc: 'Create an emotional connection that makes your shop their preferred choice.',
    ben3Title: 'Digitalize Without Friction',
    ben3Desc: 'Save printing expenses permanently and adopt a modern, eco-friendly approach.',
    ben4Title: 'Understand Customer Activity',
    ben4Desc: 'See peak visit hours, customer growth trends, and loyalty completion rates.',
    ben5Title: 'Simplify Stamp Collection',
    ben5Desc: 'Takes seconds at checkout with either secure PIN or camera QR scan.',
    ben6Title: 'Professional Experience',
    ben6Desc: 'Elevate your brand image with a sleek digital product your customers admire.',
    ben7Title: 'Reduce Physical Loss',
    ben7Desc: '100% cloud-synced loyalty records that customers can never misplace.',
    ben8Title: 'Centralized Platform',
    ben8Desc: 'All your customer data, rewards, and staff PINs managed in one place.',

    // Section 11: Who is it for
    whoTag: 'Who is it for?',
    whoTitle: 'Tailored for Customer-Facing Businesses',
    whoSubtitle: 'Whether you run a specialty café or a busy beauty salon, Brand Xper adapts to you.',
    who1: 'Cafés & Coffee Shops',
    who1Sub: '10 coffees = 1 free beverage',
    who2: 'Restaurants & Bistros',
    who2Sub: 'Free dessert or main course',
    who3: 'Beauty Salons & Spas',
    who3Sub: 'Complimentary treatment',
    who4: 'Barbershops & Grooming',
    who4Sub: 'Free beard trim or haircut',
    who5: 'Fitness & Studios',
    who5Sub: 'Free personal coaching session',
    who6: 'Retail & Boutiques',
    who6Sub: 'Exclusive store voucher',
    who7: 'Bakeries & Pastry',
    who7Sub: 'Free pastry on 8th visit',
    who8: 'Car Wash & Detailing',
    who8Sub: 'VIP wash on 6th visit',

    // Section 12: Why Brand Xper
    whyTag: 'Why Brand Xper?',
    whyTitle: 'Built for Sustainable Business Growth',
    whyDesc:
      'Brand Xper isn’t just a loyalty card—it is part of a complete digital ecosystem combining smart NFC connected hardware, bespoke digital profiles, and professional business tools.',
    whyPoint1: 'Modern Digital Experience',
    whyPoint1Desc: 'State-of-the-art PWA technology with lightning-fast page loads.',
    whyPoint2: 'Merchant-First Architecture',
    whyPoint2Desc: 'Private, secure data isolation so your customer list belongs exclusively to you.',
    whyPoint3: 'Scalable Infrastructure',
    whyPoint3Desc: 'Ready for single-location shops and expanding multi-branch franchises.',

    // Section 13: FAQ
    faqTag: 'FAQ',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about Brand Xper Loyalty.',
    faqs: [
      {
        q: 'What is a digital loyalty card?',
        a: 'A digital loyalty card is a smartphone-based card that replaces traditional paper stamp cards. Customers access it through a simple QR scan in their web browser, where their stamps and rewards are safely stored in real time.',
      },
      {
        q: 'Does the customer need to download an app?',
        a: 'No, absolutely no app download is required. Brand Xper works on progressive web technology, accessible on all iOS (Safari) and Android (Chrome) devices without going to the App Store or Google Play.',
      },
      {
        q: 'How does the customer receive a stamp?',
        a: 'At checkout, the merchant can either type a secret 4-digit PIN directly on the customer’s phone screen, or open the Merchant Portal camera scanner to scan the customer’s personal loyalty QR code in one tap.',
      },
      {
        q: 'Can the merchant view and manage customer phone numbers?',
        a: 'Yes. In your private Merchant Dashboard, you have full access to your customer list with their names, full unmasked phone numbers, total stamps collected, and visit history.',
      },
      {
        q: 'Can customers use their loyalty card from any smartphone?',
        a: 'Yes. The system is universally compatible with 100% of modern smartphones. Customers can also save it to their home screen as a web icon for instant access.',
      },
      {
        q: 'How does the QR code system work?',
        a: 'Your business receives a dedicated high-definition QR code to display in-store (counter, table tents, entrance). When scanned, customers are automatically connected to your loyalty program.',
      },
      {
        q: 'Can the system be used by different types of businesses?',
        a: 'Yes! Brand Xper Loyalty is successfully used by cafés, restaurants, barbershops, beauty salons, retail boutiques, bakeries, fitness clubs, car washes, and local service providers.',
      },
    ],

    // Section 14: Final CTA
    finalTag: 'Get Started Today',
    finalTitle: 'Build Customer Loyalty Beyond the First Visit.',
    finalSubtitle:
      'Join modern businesses turning casual passersby into loyal regulars. Deploy your Brand Xper digital loyalty card in under 24 hours.',
    finalCtaPrimary: 'Start Your Loyalty Program',
    finalCtaSecondary: 'Contact Brand Xper',
    finalMerchantNote: 'Already a partner merchant?',
    finalMerchantLink: 'Access Merchant Portal →',
  },

  fr: {
    heroTag: 'Système de Fidélité Digitale Brand Xper',
    heroTitle: 'Transformez Chaque Visite Client en Fidélité.',
    heroSubtitle:
      'Dites adieu aux cartes papier perdues. Brand Xper dote votre commerce d’une carte de fidélité 100% digitale sur smartphone. Zéro application à télécharger, onboarding QR instantané et double validation sécurisée par PIN ou scanner caméra.',
    ctaPrimary: 'Créer mon programme de fidélité',
    ctaSecondary: 'Découvrir le fonctionnement',
    trust0App: '0 App Requise',
    trust0AppSub: '100% Navigateur & Smartphone',
    trustOnboard: '15 Secondes',
    trustOnboardSub: 'Inscription Client Express',
    trustDual: 'Double Validation',
    trustDualSub: 'Code PIN ou Scanner QR',

    whatTag: 'La Solution',
    whatTitle: 'Qu’est-ce que Brand Xper Loyalty ?',
    whatDesc:
      'Brand Xper Loyalty est une solution de carte de fidélité digitale permettant aux commerces indépendants, cafés, restaurants et boutiques de fidéliser leurs clients grâce à une expérience de tampons sur smartphone ultra-fluide.',
    whatCard1Title: 'Zéro Carte Papier',
    whatCard1Desc: 'Vos clients ne perdent plus jamais leur carte car elle reste enregistrée dans leur smartphone.',
    whatCard2Title: 'Fichier Client Qualifié',
    whatCard2Desc: 'Collectez le nom et le numéro de téléphone complet de vos clients dans votre CRM commerçant privé.',
    whatCard3Title: 'Sécurité Anti-Fraude',
    whatCard3Desc: 'Les tampons ne peuvent être validés que par votre code PIN secret ou votre scanner caméra.',

    howTag: 'Processus Simple',
    howTitle: 'Le Parcours en 4 Étapes Simples',
    howSubtitle: 'Une expérience conçue pour prendre moins de 10 secondes en caisse pour le client et le serveur.',
    step1Num: '01',
    step1Title: 'Scan du QR Code',
    step1Desc: 'Le client scanne le QR code Brand Xper posé sur votre comptoir, table ou vitrine.',
    step2Num: '02',
    step2Title: 'Ouverture Immédiate',
    step2Desc: 'Sa carte digitale s’ouvre directement dans son navigateur sans rien installer.',
    step3Num: '03',
    step3Title: 'Validation du Tampon',
    step3Desc: 'Le commerçant entre son code PIN ou scanne le QR personnel du client avec son scanner caméra.',
    step4Num: '04',
    step4Title: 'Récompense & Fidélité',
    step4Desc: 'Le client complète ses tampons, débloque son cadeau offert et revient avec enthousiasme.',

    waysTag: 'Double Méthode Exclusivité',
    waysTitle: 'Deux Façons Sécurisées de Tamponner la Carte',
    waysSubtitle: 'Choisissez la méthode qui correspond le mieux à votre rythme de service au comptoir ou en salle.',
    m1Badge: 'Méthode 1',
    m1Title: 'Code PIN Commerçant Sécurisé',
    m1Desc:
      'Le client présente sa carte. Le commerçant tape son code secret à 4 chiffres directement sur l’écran du client. Tampon validé en 2 secondes sans matériel supplémentaire.',
    m1Benefit1: 'Fonctionne sur tous les téléphones clients',
    m1Benefit2: 'Zéro appareil requis pour votre équipe',
    m1Benefit3: 'Code PIN modifiable depuis votre espace',

    m2Badge: 'Méthode 2 (Nouveau)',
    m2Title: 'Scanner Caméra QR Commerçant',
    m2Desc:
      'Le client affiche son QR code personnel. Le commerçant ouvre le scanner de son Espace Commerçant, scanne le QR, vérifie la fiche client et clique sur "+1 Ajouter un Tampon".',
    m2Benefit1: 'Scan ultra-rapide et sans contact via caméra',
    m2Benefit2: 'Affiche en direct le nom et solde du client',
    m2Benefit3: 'Validation en un clic avec confirmation visuelle',

    cardTag: 'La Carte Digitale',
    cardTitle: 'Une Carte Prestigieuse dans la Poche du Client',
    cardDesc:
      'Un design épuré et valorisant qui renforce l’image de marque de votre établissement. Pas de numéros de carte bancaire inutiles, une ergonomie pure orientée rétention.',
    cardHolder: 'Titulaire de la carte',
    cardStamps: 'Tampons',
    cardRewardTitle: 'Statut Récompense',
    cardUnlocked: '🎉 Récompense Débloquée ! À réclamer',
    cardRemaining: 'tampons restants avant le cadeau VIP',
    cardMyQr: 'QR Code Fidélité Personnel',
    cardPresentText: 'À présenter au commerçant pour validation immédiate',

    stampsTag: 'Démo Interactive',
    stampsTitle: 'Expérience Tampons & Récompenses',
    stampsSubtitle: 'Cliquez sur un chiffre pour tester la progression et le déblocage en direct :',

    cxTag: 'Expérience Client',
    cxTitle: 'Une Simplicité Absolue pour Vos Clients',
    cxDesc:
      'Vos clients adorent la simplicité. Aucun mot de passe à retenir, aucun téléchargement d’application qui encombre la mémoire, aucune carte oubliée.',
    cxPoint1: 'Zéro Application à Télécharger',
    cxPoint1Desc: 'Fonctionne instantanément sur Safari, Chrome et tous les navigateurs.',
    cxPoint2: 'Raccourci Écran d’Accueil',
    cxPoint2Desc: 'Le client peut épingler sa carte sur son écran d’accueil en 1 clic.',
    cxPoint3: 'Toujours Accessible',
    cxPoint3Desc: 'Disponible 24/7 avec suivi des tampons et des cadeaux en temps réel.',

    dashTag: 'Espace Commerçant',
    dashTitle: 'Votre Centre de Pilotage Privé',
    dashDesc:
      'Consultez vos statistiques réelles, gérez vos clients, accédez aux numéros de téléphone complets et mesurez la rétention en temps réel.',
    dashTile1: 'Clients Inscrits',
    dashTile2: 'Tampons Attribués',
    dashTile3: 'Récompenses Remises',
    dashTile4: 'Visites ce Mois',

    crmTag: 'Gestion Clients',
    crmTitle: 'Connaissez Enfin Vos Meilleurs Habitués',
    crmDesc:
      'Contrairement aux cartes papier, Brand Xper vous donne accès à votre répertoire client avec numéros en clair, historique de visite et statut de fidélité.',
    crmColName: 'Client',
    crmColPhone: 'Numéro de Téléphone en clair',
    crmColStamps: 'Tampons',
    crmColStatus: 'Statut',
    crmColVisit: 'Dernière Visite',
    crmTagLoyal: 'Client Fidèle VIP',
    crmTagReady: 'Récompense Prête',
    crmTagNew: 'Nouveau Membre',

    benTag: 'Avantages Commerçant',
    benTitle: 'Pourquoi les Commerçants Choisissent Brand Xper',
    benSubtitle: 'Une solution rentable et pratique pensée pour le commerce de proximité.',
    ben1Title: 'Augmentez les Visites Répétées',
    ben1Desc: 'Transformez les clients occasionnels en habitués fidèles grâce aux paliers.',
    ben2Title: 'Créez un Vrai Attachement',
    ben2Desc: 'Développez une relation de proximité qui incite à revenir chez vous.',
    ben3Title: 'Passez au Zéro Papier',
    ben3Desc: 'Économisez définitivement vos frais d’imprimerie et adoptez une démarche moderne.',
    ben4Title: 'Analysez l’Activité Réelle',
    ben4Desc: 'Suivez les heures d’affluence et le taux d’achèvement des programmes.',
    ben5Title: 'Validation Express en Caisse',
    ben5Desc: 'Quelques secondes suffisent par PIN ou scan QR sans ralentir le service.',
    ben6Title: 'Image de Marque Moderne',
    ben6Desc: 'Offrez une expérience numérique élégante qui impressionne vos clients.',
    ben7Title: 'Zéro Carte Perdue',
    ben7Desc: 'La carte est synchronisée sur le smartphone du client à vie.',
    ben8Title: 'Plateforme Centralisée',
    ben8Desc: 'Toutes vos données clients, récompenses et codes PIN au même endroit.',

    whoTag: 'Pour Qui ?',
    whoTitle: 'Conçu pour Tous les Métiers de Proximité',
    whoSubtitle: 'Du café de quartier au salon de coiffure réputé, Brand Xper s’adapte à votre enseigne.',
    who1: 'Cafés & Coffee Shops',
    who1Sub: '10 cafés = 1 boisson offerte',
    who2: 'Restaurants & Snacks',
    who2Sub: 'Plat ou dessert offert',
    who3: 'Salons de Beauté & Spas',
    who3Sub: 'Soin ou remise privilège',
    who4: 'Barbiers & Coiffure Homme',
    who4Sub: 'Taille de barbe ou coupe offerte',
    who5: 'Clubs de Sport & Fitness',
    who5Sub: 'Séance de coaching offerte',
    who6: 'Boutiques & Mode',
    who6Sub: 'Bon d’achat exclusif fidélité',
    who7: 'Boulangeries & Pâtisseries',
    who7Sub: 'Viennoiserie au 8ème passage',
    who8: 'Centres de Lavage Auto',
    who8Sub: 'Lavage complet offert au 6ème',

    whyTag: 'Pourquoi Brand Xper ?',
    whyTitle: 'Pensé pour Développer Votre Entreprise',
    whyDesc:
      'Brand Xper ne s’arrête pas à la carte de fidélité : découvrez une suite digitale complète combinant cartes sans contact NFC connectées, profils interactifs et studio créatif.',
    whyPoint1: 'Technologie Web de Pointe',
    whyPoint1Desc: 'Technologie PWA instantanée et ultra-rapide sans installation.',
    whyPoint2: 'Sécurité et Propriété des Données',
    whyPoint2Desc: 'Votre fichier client reste votre propriété exclusive et protégée.',
    whyPoint3: 'Évolutif et Multi-Points de Vente',
    whyPoint3Desc: 'Parfait pour un commerce unique comme pour une chaîne de plusieurs boutiques.',

    faqTag: 'Questions Fréquentes',
    faqTitle: 'Questions Fréquentes sur Brand Xper Loyalty',
    faqSubtitle: 'Tout ce que vous devez savoir pour lancer votre programme en toute confiance.',
    faqs: [
      {
        q: 'Qu’est-ce qu’une carte de fidélité digitale ?',
        a: 'Une carte de fidélité digitale est une carte numérique accessible sur smartphone qui remplace définitivement les cartes en carton. Le client y accède par un simple scan QR et retrouve son solde de tampons en temps réel.',
      },
      {
        q: 'Le client doit-il télécharger une application ?',
        a: 'Non, absolument aucune application n’est requise. Brand Xper utilise la technologie web instantanée, accessible sur tous les iPhone (Safari) et Android (Chrome) sans passer par l’App Store ni Google Play.',
      },
      {
        q: 'Comment le client reçoit-il un tampon lors de son achat ?',
        a: 'En caisse, le commerçant peut soit taper son code PIN secret à 4 chiffres sur l’écran du client, soit ouvrir son scanner caméra pour scanner le QR code personnel du client en 1 clic.',
      },
      {
        q: 'Le commerçant a-t-il accès aux numéros de téléphone des clients ?',
        a: 'Oui. Dans votre Espace Commerçant privé, vous disposez de votre répertoire complet avec les noms, les numéros de téléphone en clair (non masqués), le solde de tampons et l’historique des visites.',
      },
      {
        q: 'Les clients peuvent-ils utiliser leur carte depuis n’importe quel smartphone ?',
        a: 'Oui. La solution est universelle et 100% compatible avec tous les smartphones récents. Le client peut également l’épingler sur son écran d’accueil.',
      },
      {
        q: 'Comment fonctionne le QR code de mon commerce ?',
        a: 'Votre commerce reçoit un QR code unique haute définition à imprimer sur vos comptoirs, tables ou vitrines. Quand le client le scanne, il rejoint immédiatement votre programme.',
      },
      {
        q: 'Le système convient-il à tous les types d’activités ?',
        a: 'Oui ! Brand Xper Loyalty est utilisé par des cafés, restaurants, salons de coiffure, instituts de beauté, barbiers, boutiques, boulangeries, clubs de sport et garages.',
      },
    ],

    finalTag: 'Démarrer dès Aujourd’hui',
    finalTitle: 'Bâtissez une Fidélité Durable dès la Première Visite.',
    finalSubtitle:
      'Rejoignez les commerces modernes qui transforment les passants occasionnels en clients fidèles. Déployez votre programme Brand Xper en moins de 24h.',
    finalCtaPrimary: 'Créer mon programme de fidélité',
    finalCtaSecondary: 'Contacter Brand Xper',
    finalMerchantNote: 'Déjà commerçant partenaire ?',
    finalMerchantLink: 'Accéder à l’Espace Commerçant →',
  },

  ar: {
    heroTag: 'نظام بطاقة الولاء الرقمية Brand Xper',
    heroTitle: 'حوّل كل زيارة لزبائنك إلى ولاء دائم.',
    heroSubtitle:
      'ودّع بطاقات الولاء الورقية المفقودة. تمنحك Brand Xper بطاقة ولاء رقمية 100% على الهواتف الذكية. بدون تحميل أي تطبيق، تسجيل فوري عبر رمز QR، وتوثيق مزدوج وآمن عبر رمز PIN أو ماسح الكاميرا.',
    ctaPrimary: 'ابدأ برنامج الولاء الخاص بك',
    ctaSecondary: 'اكتشف كيف يعمل النظام',
    trust0App: 'بدون أي تطبيق',
    trust0AppSub: '100% متصفح وهاتف ذكي',
    trustOnboard: '15 ثانية فقط',
    trustOnboardSub: 'تسجيل زبائن فوري',
    trustDual: 'توثيق مزدوج',
    trustDualSub: 'رمز PIN أو مسح QR',

    whatTag: 'الحل الرقمي',
    whatTitle: 'ما هو نظام Brand Xper للولاء الرقمي؟',
    whatDesc:
      'هو نظام متطور للولاء الرقمي يتيح للمقاهي، المطاعم، صالونات التجميل، والمتاجر مكافأة زبائنهم الدائمين عبر بطاقة رقمية تفاعلية ونظام طوابع ذكي وسلس.',
    whatCard1Title: 'بدون بطاقات ورقية',
    whatCard1Desc: 'لن يفقد زبائنك بطاقتهم أبداً لأنها محفوظة دائماً داخل هاتفهم الذكي.',
    whatCard2Title: 'قاعدة بيانات حقيقية للزبائن',
    whatCard2Desc: 'اجمع أسماء وأرقام هواتف زبائنك بشكل كامل ومباشر في لوحة تحكم التاجر الخاصة بك.',
    whatCard3Title: 'أمان كامل ضد التلاعب',
    whatCard3Desc: 'لا يمكن إضافة الطوابع إلا عبر رمز PIN السري للتاجر أو عبر ماسح الكاميرا.',

    howTag: 'طريقة العمل',
    howTitle: 'كيف يعمل النظام في 4 خطوات بسيطة',
    howSubtitle: 'تجربة سريعة للغاية تستغرق أقل من 10 ثوانٍ عند الدفع دون إبطاء العمل.',
    step1Num: '01',
    step1Title: 'الزبون يمسح رمز QR',
    step1Desc: 'يمسح الزبون رمز QR الخاص بمتجرك المعروض عند صندوق الدفع أو على الطاولة.',
    step2Num: '02',
    step2Title: 'فتح البطاقة فوراً',
    step2Desc: 'تفتح بطاقة الولاء الرقمية مباشرة في متصفح الهاتف دون الحاجة لأي تطبيق.',
    step3Num: '03',
    step3Title: 'التاجر يضيف الطابع',
    step3Desc: 'يدخل التاجر رمز PIN على هاتف الزبون أو يمسح رمز QR الشخصي للزبون عبر الكاميرا.',
    step4Num: '04',
    step4Title: 'جمع الطوابع والمكافأة',
    step4Desc: 'يكمل الزبون طوابعه، ويحصل على هديته الحصرية ويعود لزيارتك باستمرار.',

    waysTag: 'مرونة حصرية',
    waysTitle: 'طريقتان آمنتان لإضافة طوابع الولاء',
    waysSubtitle: 'اختر الطريقة الأنسب لنمط خدمتك عند الصندوق أو في الصالة.',
    m1Badge: 'الطريقة الأولى',
    m1Title: 'رمز PIN السري للتاجر',
    m1Desc:
      'يفتح الزبون بطاقته، ثم يقوم التاجر أو النادل بإدخال رمز PIN المكون من 4 أرقام مباشرة على شاشة هاتف الزبون. يتم توثيق الطابع في ثانيتين دون الحاجة لأي جهاز إضافي.',
    m1Benefit1: 'يعمل فوراً على أي هاتف ذكي للزبون',
    m1Benefit2: 'لا يتطلب أي جهاز أو تطبيق خاص بفريق العمل',
    m1Benefit3: 'يمكنك تغيير رمز PIN في أي وقت من لوحة التحكم',

    m2Badge: 'الطريقة الثانية (جديدة)',
    m2Title: 'ماسح كاميرا QR للتاجر',
    m2Desc:
      'يعرض الزبون رمز QR الشخصي الخاص ببطاقته. يفتح التاجر ماسح الكاميرا من لوحة التاجر، ويمسح الرمز، وتظهر بيانات الزبون ورصيده فوراً، ثم يضغط زر "إضافة طابع".',
    m2Benefit1: 'مسح سريع للغاية بدون تلامس عبر الكاميرا',
    m2Benefit2: 'إظهار اسم الزبون ورصيده الحالي على الشاشة',
    m2Benefit3: 'تأكيد بنقرة واحدة مع إشعار نجاح فوري',

    cardTag: 'البطاقة الرقمية',
    cardTitle: 'بطاقة ولاء أنيقة في جيب كل زبون',
    cardDesc:
      'تصميم رقمي فاخر يعكس هوية وتميز علامتك التجارية. بدون أرقام بنكية لا داعي لها، وبتركيز كامل على سهولة عودة الزبائن.',
    cardHolder: 'صاحب البطاقة',
    cardStamps: 'الطوابع',
    cardRewardTitle: 'حالة المكافأة',
    cardUnlocked: '🎉 تم فتح المكافأة! اطلب هديتك الآن',
    cardRemaining: 'طوابع متبقية للمكافأة الخاصة',
    cardMyQr: 'رمز QR الشخصي للزبون',
    cardPresentText: 'أظهر هذا الرمز للتاجر لمسحه عبر الكاميرا فوراً',

    stampsTag: 'تجربة تفاعلية',
    stampsTitle: 'تجربة الطوابع والمكافآت التفاعلية',
    stampsSubtitle: 'انقر على أي رقم لمشاهدة تقدم الطوابع وفتح المكافأة مباشرة:',

    cxTag: 'تجربة الزبون',
    cxTitle: 'سهولة مطلقة ترضي زبائنك',
    cxDesc:
      'يبحث الزبائن دائماً عن السهولة. لا توجد كلمات مرور منسية، لا تطبيقات تستهلك الذاكرة، ولا بطاقات ورقية تضيع في الجيوب.',
    cxPoint1: 'بدون تحميل تطبيقات',
    cxPoint1Desc: 'يعمل مباشرة عبر متصفحات Safari وChrome وجميع الهواتف.',
    cxPoint2: 'إضافة للشاشة الرئيسية',
    cxPoint2Desc: 'يمكن للزبون حفظ بطاقته على شاشة هاتفه بنقرة واحدة.',
    cxPoint3: 'متاحة دائماً 24/7',
    cxPoint3Desc: 'متابعة رصيد الطوابع والمكافآت في أي وقت بكل دقة.',

    dashTag: 'لوحة تحكم التاجر',
    dashTitle: 'مساحتك الخاصة لإدارة الولاء',
    dashDesc:
      'تابع إحصائياتك الحقيقية، أدر زبائنك، اطلع على أرقام هواتفهم الكاملة، وقِس معدل عودة الزبائن بكل شفافية.',
    dashTile1: 'إجمالي الزبائن',
    dashTile2: 'الطوابع الممنوحة',
    dashTile3: 'المكافآت الممنوحة',
    dashTile4: 'زيارات هذا الشهر',

    crmTag: 'إدارة الزبائن',
    crmTitle: 'تعرّف على زبائنك الأكثر ولاءً',
    crmDesc:
      'على عكس البطاقات الورقية، تمنحك Brand Xper دليلاً متكاملاً لزبائنك مع أرقام هواتفهم الكاملة وتاريخ آخر زيارة وحالة ولائهم.',
    crmColName: 'الزبون',
    crmColPhone: 'رقم الهاتف كاملاً',
    crmColStamps: 'الطوابع',
    crmColStatus: 'الحالة',
    crmColVisit: 'آخر زيارة',
    crmTagLoyal: 'زبون دائم VIP',
    crmTagReady: 'المكافأة جاهزة',
    crmTagNew: 'عضو جديد',

    benTag: 'مزايا الأعمال',
    benTitle: 'لماذا يختار أصحاب المشاريع Brand Xper؟',
    benSubtitle: 'حل اقتصادي وذكي صُمم لتلبية احتياجات المتاجر والمشاريع اليومية.',
    ben1Title: 'زيادة تكرار الزيارات',
    ben1Desc: 'تحفيز الزبائن على العودة أسبوعياً لإكمال طوابعهم وكسب المكافأة.',
    ben2Title: 'بناء ولاء حقيقي',
    ben2Desc: 'خلق رابط وثيق يجعل متجرك هو خيارهم المفضل دائماً.',
    ben3Title: 'رقمنة كاملة واقتصادية',
    ben3Desc: 'إلغاء تكاليف الطباعة الورقية المستمرة نهائياً وبطريقة عصرية.',
    ben4Title: 'فهم نشاط الزبائن',
    ben4Desc: 'معرفة أوقات الذروة ومعدل إكمال بطاقات الولاء بالأرقام الحقيقية.',
    ben5Title: 'توثيق سريع عند الصندوق',
    ben5Desc: 'إضافة الطابع في ثوانٍ معدودة دون تأخير طوابير الزبائن.',
    ben6Title: 'صورة احترافية لعلامتك',
    ben6Desc: 'تقديم تجربة رقمية أنيقة ومبتكرة تترك انطباعاً راقياً لدى الزبائن.',
    ben7Title: 'القضاء على ضياع البطاقات',
    ben7Desc: 'البطاقة مرتبطة برقم الزبون ولا يمكن أن تضيع أو تتلف أبداً.',
    ben8Title: 'نظام مركزي موحد',
    ben8Desc: 'إدارة كل بيانات زبائنك ومكافآتك ورموز PIN من مكان واحد.',

    whoTag: 'لمن هذا النظام؟',
    whoTitle: 'مصمم لجميع الأنشطة والمشاريع التجارية',
    whoSubtitle: 'من المقاهي الراقية إلى صالونات الحلاقة والتجميل، يتكيف النظام مع كل نشاط.',
    who1: 'المقاهي ومحلات القهوة',
    who1Sub: '10 مشروبات = مشروب مجاني',
    who2: 'المطاعم والوجبات السريعة',
    who2Sub: 'وجبة أو طبق حلوى مجاني',
    who3: 'صالونات التجميل والسبا',
    who3Sub: 'جلسة عناية أو خصم خاص',
    who4: 'صالونات الحلاقة الرجالية',
    who4Sub: 'قصة شعر أو تشذيب لحية مجاناً',
    who5: 'النوادي الرياضية واللياقة',
    who5Sub: 'حصة تدريب خاصة مجانية',
    who6: 'متاجر الأزياء والملابس',
    who6Sub: 'قسيمة شراء حصرية للولاء',
    who7: 'المخابز ومحلات الحلويات',
    who7Sub: 'قطعة حلوى مجانية بالزيارة 8',
    who8: 'مراكز غسيل السيارات',
    who8Sub: 'غسيل مجاني كامل بالزيارة 6',

    whyTag: 'لماذا Brand Xper؟',
    whyTitle: 'صُمم خصيصاً لنمو مشاريعك التجارية',
    whyDesc:
      'نظام الولاء جزء من منظومة رقمية متكاملة تشمل بطاقات الأعمال الذكية NFC، الصفحات الشخصية الرقمية، واستوديو الهوية البصرية.',
    whyPoint1: 'تقنية ويب فائقة الحداثة',
    whyPoint1Desc: 'تطبيق ويب تقدمي (PWA) سريع للغاية ولا يحتاج أي تثبيت.',
    whyPoint2: 'أمان واستقلالية تامة للبيانات',
    whyPoint2Desc: 'قاعدة بيانات زبائنك ملك لك وحدك ومحمية بأعلى معايير الأمان.',
    whyPoint3: 'قابل للتوسع لمختلف الفروع',
    whyPoint3Desc: 'مناسب لمتجر فردي وكذلك لسلاسل المتاجر ذات الفروع المتعددة.',

    faqTag: 'الأسئلة الشائعة',
    faqTitle: 'الأسئلة الشائعة حول Brand Xper Loyalty',
    faqSubtitle: 'كل ما تحتاج معرفته لبدء برنامج الولاء الخاص بمتجرك بثقة.',
    faqs: [
      {
        q: 'ما هي بطاقة الولاء الرقمية؟',
        a: 'هي بطاقة ذكية تعمل عبر متصفح الهاتف تحل محل البطاقات الورقية المطبوعة. يفتحها الزبون عبر مسح رمز QR ويتابع رصيد طوابعه ومكافآته في الوقت الفعلي.',
      },
      {
        q: 'هل يحتاج الزبون لتحميل أي تطبيق؟',
        a: 'لا، على الإطلاق! يعمل النظام بتقنية الويب الفورية، ويتوافق مع جميع أجهزة iPhone وAndroid دون الحاجة للدخول إلى App Store أو Google Play.',
      },
      {
        q: 'كيف يحصل الزبون على طابعه عند الدفع؟',
        a: 'عند الدفع، يمكن للتاجر إدخال رمز PIN السري على هاتف الزبون في ثانيتين، أو فتح ماسح الكاميرا في لوحة التاجر ومسح رمز QR الخاص بالزبون بنقرة واحدة.',
      },
      {
        q: 'هل يستطيع التاجر رؤية وإدارة أرقام هواتف الزبائن؟',
        a: 'نعم، بكل تأكيد. في لوحة تحكم التاجر الخاصة بك، تظهر قائمة زبائنك بأسمائهم وأرقام هواتفهم الكاملة دون أي إخفاء، مع عدد طوابعهم وتاريخ زياراتهم.',
      },
      {
        q: 'هل يمكن للزبائن استخدام البطاقة من أي هاتف؟',
        a: 'نعم، النظام متوافق 100% مع جميع الهواتف الذكية، ويمكن للزبون حفظ البطاقة كأيقونة على الشاشة الرئيسية للوصول السريع.',
      },
      {
        q: 'كيف يعمل رمز QR الخاص بمتجري؟',
        a: 'نوفر لك رمز QR عالي الدقة لوضعه على الكاونتر أو الطاولات. عندما يمسحه الزبون بهاتفه، ينضم فوراً لبرنامجك ويحصل على بطاقته.',
      },
      {
        q: 'هل يناسب النظام مختلف الأنشطة التجارية؟',
        a: 'نعم، النظام مستخدم بنجاح في المقاهي، المطاعم، صالونات الحلاقة والتجميل، محلات التجزئة، المخابز، ومراكز اللياقة وغسيل السيارات.',
      },
    ],

    finalTag: 'ابدأ اليوم',
    finalTitle: 'ابنِ ولاء زبائنك من الزيارة الأولى وما بعدها.',
    finalSubtitle:
      'انضم للمشاريع الحديثة التي تحول الزوار العابرين إلى زبائن دائمين. أطلق برنامج الولاء الخاص بك في أقل من 24 ساعة.',
    finalCtaPrimary: 'ابدأ برنامج الولاء الخاص بك',
    finalCtaSecondary: 'تواصل مع فريق Brand Xper',
    finalMerchantNote: 'هل أنت تاجر شريك بالفعل؟',
    finalMerchantLink: 'الدخول إلى فضاء التاجر ←',
  },
};

export default function LoyaltyLandingClient() {
  const { language: globalLang, setLanguage: setGlobalLang } = useTranslation();
  const [lang, setLang] = useState<Lang>((globalLang as Lang) || 'en');

  // Sync with global i18n
  useEffect(() => {
    if (globalLang === 'ar') setLang('ar');
    else if (globalLang === 'en') setLang('en');
  }, [globalLang]);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    if (newLang === 'ar') setGlobalLang('ar');
    else setGlobalLang('en');
  };

  const isRtl = lang === 'ar';
  const t = TRANSLATIONS[lang];

  // Interactive demo states
  const [activeStamps, setActiveStamps] = useState<number>(7);
  const [stampMethodTab, setStampMethodTab] = useState<'pin' | 'scanner'>('scanner');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const targetStamps = 10;
  const isRewardUnlocked = activeStamps >= targetStamps;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className={`min-h-screen bg-white text-slate-900 font-sans selection:bg-[#844D98] selection:text-white transition-all ${
        isRtl ? 'font-cairo' : 'font-poppins'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TOP ANNOUNCEMENT BAR WITH LANGUAGE SELECTOR                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#FAF7FC] via-white to-[#FAF7FC] border-b border-[#DACBE3]/40 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600 truncate">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#844D98]/10 text-[#844D98] border border-[#844D98]/20 shrink-0">
              NEW
            </span>
            <span className="truncate font-medium">{t.heroTag}</span>
          </div>

          {/* Language Switcher (EN | FR | عربي) */}
          <div className="flex items-center gap-1.5 shrink-0 bg-white border border-[#DACBE3]/60 px-2 py-1 rounded-full shadow-xs">
            <Languages className="w-3.5 h-3.5 text-[#844D98]" />
            <button
              onClick={() => handleLangChange('en')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                lang === 'en' ? 'bg-[#844D98] text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleLangChange('fr')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                lang === 'fr' ? 'bg-[#844D98] text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              FR
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleLangChange('ar')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                lang === 'ar' ? 'bg-[#844D98] text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              عربي
            </button>
          </div>
        </div>
      </div>

      {/* Main Website Navigation */}
      <MainNavbar variant="light" />

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#FAF7FC] to-white">
        {/* Soft Ambient Floating Motion Graphic Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-[#844D98]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[#DACBE3]/40 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#844D98_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Text */}
            <div className="lg:col-span-7 space-y-7 text-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DACBE3]/80 text-xs font-bold text-[#844D98] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
                <span>{t.heroTag}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#301739] leading-[1.15]">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {t.heroSubtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#844D98]/25 hover:shadow-xl hover:shadow-[#844D98]/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{t.ctaPrimary}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#DACBE3] hover:border-[#844D98] text-[#301739] font-bold text-sm sm:text-base shadow-xs hover:bg-[#FAF7FC] transition-all"
                >
                  <span>{t.ctaSecondary}</span>
                  <ChevronDown className="w-4 h-4 text-[#844D98]" />
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#301739] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>0 App</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trust0AppSub}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#301739] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#844D98]" />
                    <span>15s</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trustOnboardSub}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#301739] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>2 Voies</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.trustDualSub}</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Real Digital Loyalty Card Smartphone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px]">
                {/* Smartphone Shell */}
                <div className="relative rounded-[40px] p-3.5 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl shadow-purple-950/20 border border-slate-700">
                  {/* Speaker Notch */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                    <div className="w-10 h-1 bg-slate-800 rounded-full" />
                  </div>

                  {/* Screen Content */}
                  <div className="rounded-[32px] bg-slate-900 overflow-hidden text-white pt-8 pb-5 px-4 shadow-inner border border-slate-800">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#844D98] to-[#301739] flex items-center justify-center font-bold text-xs text-white shadow-xs">
                          BX
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Café Signature Lounge</div>
                          <div className="text-[10px] text-purple-300">VIP Loyalty Program</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Active
                      </span>
                    </div>

                    {/* Card Front */}
                    <div className="bg-gradient-to-br from-[#301739] via-[#481d57] to-[#1e0a24] rounded-2xl p-4 border border-purple-500/30 shadow-lg mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[10px] text-purple-200 uppercase font-semibold">
                            {t.cardHolder}
                          </div>
                          <div className="text-sm font-bold text-white">Ahmed Benali</div>
                        </div>
                        <div className="text-end">
                          <div className="text-[10px] text-purple-200 uppercase font-semibold">
                            {t.cardStamps}
                          </div>
                          <div className="text-sm font-black text-amber-300">
                            {activeStamps} / {targetStamps}
                          </div>
                        </div>
                      </div>

                      {/* 10 Stamps Grid */}
                      <div className="grid grid-cols-5 gap-2 my-3">
                        {Array.from({ length: targetStamps }).map((_, i) => {
                          const isFilled = i < activeStamps;
                          return (
                            <div
                              key={i}
                              className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                                isFilled
                                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-sm shadow-amber-500/30'
                                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-500'
                              }`}
                            >
                              {isFilled ? (
                                <Star className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <span className="text-[11px] font-semibold">{i + 1}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Status */}
                      <div className="mt-3 p-2 rounded-xl bg-purple-950/60 border border-purple-400/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="text-purple-100 text-[11px]">
                            {isRewardUnlocked ? t.cardUnlocked : 'Reward: Signature Beverage'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">
                          {isRewardUnlocked ? 'UNLOCKED' : `${targetStamps - activeStamps} left`}
                        </span>
                      </div>
                    </div>

                    {/* Personal QR */}
                    <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 text-center">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-purple-400" />
                        <span>{t.cardMyQr}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                        <div className="w-20 h-20 bg-slate-950 rounded p-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-2 border-white rounded-xs" />
                            <div className="w-5 h-5 border-2 border-white rounded-xs" />
                          </div>
                          <div className="text-[8px] font-mono text-purple-300 text-center font-bold">BX-CARD</div>
                          <div className="flex justify-between">
                            <div className="w-5 h-5 border-2 border-white rounded-xs" />
                            <div className="w-3 h-3 bg-white" />
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{t.cardPresentText}</div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-white border border-[#DACBE3] rounded-2xl p-3 shadow-xl flex items-center gap-3 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">0 App Download</div>
                    <div className="text-slate-500 text-[11px]">Instant PWA on Safari & Chrome</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. WHAT IS BRAND XPER LOYALTY?                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-[#844D98]/10 px-3 py-1 rounded-full border border-[#844D98]/20">
              {t.whatTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.whatTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t.whatDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.whatCard1Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.whatCard1Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.whatCard2Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.whatCard2Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.whatCard3Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.whatCard3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. HOW IT WORKS                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-[#DACBE3]">
              {t.howTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.howTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.howSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7FC] text-[#844D98] flex items-center justify-center font-black text-lg mb-5 border border-[#DACBE3]">
                {t.step1Num}
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.step1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7FC] text-[#844D98] flex items-center justify-center font-black text-lg mb-5 border border-[#DACBE3]">
                {t.step2Num}
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.step2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7FC] text-[#844D98] flex items-center justify-center font-black text-lg mb-5 border border-[#DACBE3]">
                {t.step3Num}
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.step3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7FC] text-[#844D98] flex items-center justify-center font-black text-lg mb-5 border border-[#DACBE3]">
                {t.step4Num}
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.step4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. TWO WAYS TO ADD A STAMP                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-[#844D98]/10 px-3 py-1 rounded-full border border-[#844D98]/20">
              {t.waysTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.waysTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.waysSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Method 1: PIN Code */}
            <div className="bg-[#FAF7FC] rounded-3xl p-8 border border-[#DACBE3]/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#844D98] border border-[#DACBE3]">
                  {t.m1Badge}
                </span>
                <KeyRound className="w-5 h-5 text-[#844D98]" />
              </div>
              <h3 className="text-xl font-bold text-[#301739] mb-3">{t.m1Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{t.m1Desc}</p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.m1Benefit1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.m1Benefit2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.m1Benefit3}</span>
                </div>
              </div>
            </div>

            {/* Method 2: Customer QR Scanner */}
            <div className="bg-gradient-to-br from-[#FAF7FC] via-white to-[#FAF7FC] rounded-3xl p-8 border-2 border-[#844D98]/40 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#844D98] text-white">
                  {t.m2Badge}
                </span>
                <Camera className="w-5 h-5 text-[#844D98]" />
              </div>
              <h3 className="text-xl font-bold text-[#301739] mb-3">{t.m2Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{t.m2Desc}</p>

              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#844D98] shrink-0" />
                  <span>{t.m2Benefit1}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#844D98] shrink-0" />
                  <span>{t.m2Benefit2}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#844D98] shrink-0" />
                  <span>{t.m2Benefit3}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. DIGITAL LOYALTY CARD & 6. STAMPS & REWARDS               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-start">
              <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-[#DACBE3]">
                {t.cardTag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#301739] leading-tight">
                {t.cardTitle}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {t.cardDesc}
              </p>

              <div className="pt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t.stampsSubtitle}
                </div>
                {/* Stamp buttons 1..10 */}
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveStamps(num)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        activeStamps === num
                          ? 'bg-[#844D98] text-white shadow-md shadow-[#844D98]/30 scale-105'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#DACBE3]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Live Card Display */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#DACBE3]/80 shadow-xl">
              <div className="bg-gradient-to-br from-[#301739] via-[#481d57] to-[#1e0a24] rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
                      BX
                    </div>
                    <div>
                      <div className="text-xs text-purple-300 font-semibold">Brand Xper Loyalty</div>
                      <div className="text-base font-bold text-white">Yassine Mansour</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-purple-200 block">{t.cardStamps}</span>
                    <span className="text-xl font-black text-amber-300">{activeStamps} / 10</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950/60 rounded-full h-2.5 mb-5 overflow-hidden p-0.5 border border-purple-500/30">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(activeStamps / 10) * 100}%` }}
                  />
                </div>

                {/* 10 Stamp circles */}
                <div className="grid grid-cols-5 gap-2.5 mb-5">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const filled = idx < activeStamps;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          filled
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-900/80 border border-slate-700/60 text-slate-500'
                        }`}
                      >
                        {filled ? <Star className="w-4 h-4 fill-current" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Unlocked banner */}
                {isRewardUnlocked ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center animate-pulse">
                    <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-300" />
                      <span>{t.cardUnlocked}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-between text-xs">
                    <span className="text-purple-200">
                      {targetStamps - activeStamps} {t.cardRemaining}
                    </span>
                    <span className="font-bold text-amber-300">{(activeStamps / 10) * 100}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. CUSTOMER EXPERIENCE                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-[#844D98]/10 px-3 py-1 rounded-full border border-[#844D98]/20">
              {t.cxTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.cxTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.cxDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.cxPoint1}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.cxPoint1Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.cxPoint2}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.cxPoint2Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-8 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-6 shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#301739] mb-2">{t.cxPoint3}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.cxPoint3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 8. MERCHANT DASHBOARD & 9. CUSTOMER MANAGEMENT              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-[#DACBE3]">
              {t.dashTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.dashTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.dashDesc}
            </p>
          </div>

          {/* Premium Dashboard Mockup */}
          <div className="rounded-3xl bg-white border border-[#DACBE3]/80 shadow-2xl p-6 sm:p-8 max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#844D98]/10 flex items-center justify-center text-[#844D98]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#301739]">Merchant Portal — Signature Lounge</h3>
                  <div className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Program Live • PIN & Scanner Active</span>
                  </div>
                </div>
              </div>

              <Link
                href="/merchant/login"
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#844D98] hover:bg-[#6F2E82] flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Camera QR Scanner</span>
              </Link>
            </div>

            {/* Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-[#FAF7FC] p-4 rounded-2xl border border-[#DACBE3]/60">
                <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
                  <span>{t.dashTile1}</span>
                  <Users className="w-4 h-4 text-[#844D98]" />
                </div>
                <div className="text-2xl font-black text-[#301739] mt-1">348</div>
              </div>

              <div className="bg-[#FAF7FC] p-4 rounded-2xl border border-[#DACBE3]/60">
                <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
                  <span>{t.dashTile2}</span>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-[#301739] mt-1">1,420</div>
              </div>

              <div className="bg-[#FAF7FC] p-4 rounded-2xl border border-[#DACBE3]/60">
                <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
                  <span>{t.dashTile3}</span>
                  <Gift className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-[#301739] mt-1">86</div>
              </div>

              <div className="bg-[#FAF7FC] p-4 rounded-2xl border border-[#DACBE3]/60">
                <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
                  <span>{t.dashTile4}</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-[#301739] mt-1">612</div>
              </div>
            </div>

            {/* Customer CRM Directory with UNMASKED PHONE NUMBERS */}
            <div className="bg-white rounded-2xl border border-[#DACBE3]/60 p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-[#301739] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#844D98]" />
                  <span>{t.crmTitle}</span>
                </div>
                <span className="text-[11px] text-slate-500">Full unmasked phone numbers</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-3 font-semibold">{t.crmColName}</th>
                      <th className="pb-3 font-semibold">{t.crmColPhone}</th>
                      <th className="pb-3 font-semibold">{t.crmColStamps}</th>
                      <th className="pb-3 font-semibold">{t.crmColStatus}</th>
                      <th className="pb-3 font-semibold">{t.crmColVisit}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3 font-bold text-slate-900">Ahmed Benali</td>
                      <td className="py-3 text-slate-700 font-mono">+212 6 12 34 56 78</td>
                      <td className="py-3 font-bold text-amber-600">8 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#844D98]">
                          {t.crmTagLoyal}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">Today, 14:22</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-slate-900">Sara Mansouri</td>
                      <td className="py-3 text-slate-700 font-mono">+212 6 98 76 54 32</td>
                      <td className="py-3 font-bold text-emerald-600">10 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {t.crmTagReady}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">Yesterday, 18:45</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-slate-900">Karim Tazi</td>
                      <td className="py-3 text-slate-700 font-mono">+212 6 55 44 33 22</td>
                      <td className="py-3 font-bold text-amber-600">4 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {t.crmTagNew}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">3 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 10. BUSINESS BENEFITS                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-[#844D98]/10 px-3 py-1 rounded-full border border-[#844D98]/20">
              {t.benTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.benTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.benSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF7FC] p-6 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#844D98] flex items-center justify-center mb-4 shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.ben1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.ben1Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-6 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.ben2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.ben2Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-6 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white text-amber-500 flex items-center justify-center mb-4 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.ben3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.ben3Desc}</p>
            </div>

            <div className="bg-[#FAF7FC] p-6 rounded-3xl border border-[#DACBE3]/60 hover:border-[#844D98] transition-all">
              <div className="w-10 h-10 rounded-2xl bg-white text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#301739] mb-2">{t.ben4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t.ben4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 11. WHO IS IT FOR?                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-[#DACBE3]">
              {t.whoTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.whoTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.whoSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">☕</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who1}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who1Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">🍽️</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who2}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who2Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">💇‍♀️</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who3}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who3Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">💈</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who4}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who4Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">🏋️‍♂️</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who5}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who5Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">🛍️</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who6}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who6Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">🥐</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who7}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who7Sub}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#DACBE3]/60 shadow-xs hover:border-[#844D98] transition-colors">
              <div className="text-2xl mb-2">🚗</div>
              <h4 className="text-sm font-bold text-[#301739]">{t.who8}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{t.who8Sub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 12. WHY BRAND XPER?                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#FAF7FC] via-white to-[#FAF7FC] rounded-3xl p-8 sm:p-12 border border-[#DACBE3]/80">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-[#844D98] uppercase tracking-wider">
                {t.whyTag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#301739] mt-2 mb-4">
                {t.whyTitle}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                {t.whyDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#DACBE3]/60">
                  <div className="text-xs font-bold text-[#844D98] mb-1">{t.whyPoint1}</div>
                  <div className="text-xs text-slate-500">{t.whyPoint1Desc}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#DACBE3]/60">
                  <div className="text-xs font-bold text-[#844D98] mb-1">{t.whyPoint2}</div>
                  <div className="text-xs text-slate-500">{t.whyPoint2Desc}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#DACBE3]/60">
                  <div className="text-xs font-bold text-[#844D98] mb-1">{t.whyPoint3}</div>
                  <div className="text-xs text-slate-500">{t.whyPoint3Desc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 13. FAQ                                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-[#844D98] tracking-wider uppercase bg-white px-3 py-1 rounded-full border border-[#DACBE3]">
              {t.faqTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#301739] mt-3 mb-4">
              {t.faqTitle}
            </h2>
            <p className="text-slate-600 text-base">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {t.faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-[#DACBE3]/60 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-6 text-start flex items-center justify-between text-sm sm:text-base font-bold text-[#301739] hover:text-[#844D98] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#844D98] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 14. FINAL CTA                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-br from-[#FAF7FC] via-white to-[#FAF7FC] border border-[#DACBE3]/80 shadow-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#844D98]/10 text-[#844D98] border border-[#844D98]/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{t.finalTag}</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-[#301739] tracking-tight mb-6">
              {t.finalTitle}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.finalSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white bg-[#844D98] hover:bg-[#6F2E82] shadow-xl shadow-[#844D98]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Award className="w-5 h-5 text-amber-300" />
                <span>{t.finalCtaPrimary}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-[#DACBE3] transition-all"
              >
                <span>{t.finalCtaSecondary}</span>
                <ArrowUpRight className="w-4 h-4 text-[#844D98]" />
              </Link>
            </div>

            <div className="mt-8 text-xs text-slate-500">
              {t.finalMerchantNote}{' '}
              <Link href="/merchant/login" className="text-[#844D98] underline font-semibold hover:text-[#6F2E82]">
                {t.finalMerchantLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200/80 bg-[#FAF7FC] py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-[#301739]">
                <span>brand</span>
                <span className="text-[#844D98]">x</span>
                <span>pere</span>
              </span>
              <span className="text-[10px] font-bold text-[#844D98] bg-[#844D98]/10 px-2 py-0.5 rounded-full border border-[#844D98]/20">
                LOYALTY SERVICE
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-medium">
              <Link href="/" className="hover:text-[#844D98] transition-colors">
                Home
              </Link>
              <Link href="/agency" className="hover:text-[#844D98] transition-colors">
                Agency Studio
              </Link>
              <Link href="/loyalty" className="text-[#844D98] font-bold transition-colors">
                Loyalty Card
              </Link>
              <Link href="/merchant/login" className="hover:text-[#844D98] transition-colors">
                Merchant Portal
              </Link>
              <Link href="/contact" className="hover:text-[#844D98] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-400">
            <div>© {new Date().getFullYear()} BRANDXPER SARL. All rights reserved.</div>
            <div>Marrakech • Casablanca • Morocco & Worldwide</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
