import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog/posts'

const LAST_MODIFIED = {
  homepage: new Date('2025-10-18'),
  login: new Date('2025-10-18'),
  signup: new Date('2025-10-18'),
  termsOfService: new Date('2025-10-18'),
  privacyPolicy: new Date('2025-10-18'),
  contact: new Date('2025-10-18'),
  blog: new Date('2025-10-21'),
} as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://domari.app'

  const blogSlugs = getAllSlugs()
  const blogPosts = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date('2025-10-21'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

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
      url: `${baseUrl}/blog`,
      lastModified: LAST_MODIFIED.blog,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts,
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
