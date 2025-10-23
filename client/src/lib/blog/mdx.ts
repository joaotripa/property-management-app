import { compileMDX } from "next-mdx-remote/rsc";
import BlogImage from "@/components/blog/BlogImage";

interface MdxCompileResult {
  content: React.ReactElement;
  frontmatter: Record<string, unknown>;
}

export async function compileMdxContent(
  source: string
): Promise<MdxCompileResult> {
  const { content, frontmatter } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
    },
    components: {
      Image: BlogImage,
    },
  });

  return {
    content,
    frontmatter: frontmatter as Record<string, unknown>,
  };
}
