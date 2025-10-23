import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";
import { compileMdxContent } from "@/lib/blog/mdx";
import BlogHeader from "../_components/BlogHeader";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords || [
      "rental property tracker",
      "property investment tracker",
      "rental income tracker",
      "property expense tracker",
      "property cash flow tracker",
      "rental property ROI calculator",
      "rental property tracking app",
      "real estate portfolio tracker",
      "landlord tools",
      "landlord dashboard",
      post.category.toLowerCase(),
    ],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://domari.app/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [
            {
              url: "/domari-logo-icon.png",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : ["/domari-logo-icon.png"],
    },
    alternates: {
      canonical: `https://domari.app/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { content } = await compileMdxContent(post.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Domari",
      logo: {
        "@type": "ImageObject",
        url: "https://domari.app/domari-logo-icon.png",
      },
    },
    image: post.image
      ? `https://domari.app${post.image}`
      : "https://domari.app/domari-logo-icon.png",
    url: `https://domari.app/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://domari.app/blog/${slug}`,
    },
    articleSection: post.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://domari.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://domari.app/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://domari.app/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-background flex-grow">
        <article className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <BlogHeader
            title={post.title}
            category={post.category}
            author={post.author}
            publishedAt={post.publishedAt}
            readingTime={post.readingTime}
          />

          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-foreground prose-strong:font-semibold prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:text-foreground prose-li:mb-2 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-6">
            {content}
          </div>
        </article>
      </div>
    </>
  );
}
