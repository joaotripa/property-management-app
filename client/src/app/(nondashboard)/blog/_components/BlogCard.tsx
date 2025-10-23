import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { BlogPostMetadata } from "@/lib/blog/posts";

interface BlogCardProps {
  post: BlogPostMetadata;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group h-full bg-card rounded-3xl border border-border p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/20">
        <div className="mb-4">
          <CategoryBadge category={post.category} />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h2>

        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
