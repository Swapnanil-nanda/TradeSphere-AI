import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tradesphere.ai';
  const routes = [
    '',
    '/features',
    '/markets',
    '/learning',
    '/about',
    '/contact',
    '/disclaimer',
    '/privacy',
    '/terms',
    '/login',
    '/register',
    '/terminal'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/markets' ? 'always' : 'weekly',
    priority: route === '' ? 1.0 : route === '/terminal' ? 0.9 : 0.8
  }));
}
