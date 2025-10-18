import { MetadataRoute } from 'next'

const LAST_MODIFIED = {
  homepage: new Date('2025-10-18'),
  login: new Date('2025-10-18'),
  signup: new Date('2025-10-18'),
  termsOfService: new Date('2025-10-18'),
  privacyPolicy: new Date('2025-10-18'),
  contact: new Date('2025-10-18'),
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://domari.app'

  return [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED.homepage,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: LAST_MODIFIED.login,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: LAST_MODIFIED.signup,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: LAST_MODIFIED.termsOfService,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: LAST_MODIFIED.privacyPolicy,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: LAST_MODIFIED.contact,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
