import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import BlogCard from "./_components/BlogCard";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, guides, and insights for rental property investors. Learn how to track income, maximize ROI, and make smarter investment decisions.",
  keywords: [
    "rental property blog",
    "property investment tips",
    "landlord advice",
    "real estate investing",
    "property management guides",
    "rental income tracking",
    "ROI optimization",
  ],
  openGraph: {
    title: "Blog | Domari",
    description:
      "Tips, guides, and insights for rental property investors. Learn how to track income, maximize ROI, and make smarter investment decisions.",
    url: "https://domari.app/blog",
    type: "website",
    images: [
      {
        url: "/domari-logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Domari Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Domari",
    description:
      "Tips, guides, and insights for rental property investors. Learn how to track income, maximize ROI, and make smarter investment decisions.",
    images: ["/domari-logo-icon.png"],
  },
  alternates: {
    canonical: "https://domari.app/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Domari Blog",
    description:
      "Tips, guides, and insights for rental property investors and landlords.",
    url: "https://domari.app/blog",
    publisher: {
      "@type": "Organization",
      name: "Domari",
      logo: {
        "@type": "ImageObject",
        url: "https://domari.app/domari-logo-icon.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="bg-background flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our blog for rental property investors: strategies, tips,
              and guides to track income, manage expenses, and improve ROI.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No blog posts yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
