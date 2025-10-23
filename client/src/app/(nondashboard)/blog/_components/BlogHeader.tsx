import { Calendar, Clock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import Link from "next/link";

interface BlogHeaderProps {
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  readingTime: string;
}

export default function BlogHeader({
  title,
  category,
  author,
  publishedAt,
  readingTime,
}: BlogHeaderProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="mb-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-foreground transition-colors">
          Blog
        </Link>
      </nav>

      <div className="mb-4">
        <CategoryBadge category={category} />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">By {author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <time dateTime={publishedAt}>{formattedDate}</time>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{readingTime}</span>
        </div>
      </div>
    </header>
  );
}
