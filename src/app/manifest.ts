import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BRANDXPER | Premium Digital Agency & Smart NFC Cards',
    short_name: 'BRANDXPER',
    description: 'Premier digital agency and smart NFC business card platform. Marrakech, Morocco.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070714',
    theme_color: '#070714',
    icons: [
      {
        src: '/brandxpere-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brandxpere-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
