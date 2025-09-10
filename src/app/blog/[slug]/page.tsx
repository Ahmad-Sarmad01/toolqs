import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MDXClient from "@/components/MDXClient";
import RelatedPosts from "@/components/RelatedPosts";

const postsDir = path.join(process.cwd(), "src/content/blog");

function getPost(slug: string) {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  return { data } as {
    data: {
      title: string;
      date?: string;
      description?: string;
      keywords?: string[];
    };
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) {
    return {
      title: "Post not found",
      description: "This blog post does not exist.",
    };
  }

  const siteUrl = "https://yourdomain.com";
  const url = `${siteUrl}/blog/${params.slug}`;

  return {
    title: post.data.title,
    description: post.data.description,
    keywords: post.data.keywords,
    openGraph: {
      title: post.data.title,
      description: post.data.description,
      type: "article",
      url,
      publishedTime: post.data.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.data.title,
      description: post.data.description,
    },
  };
}

interface BlogPageProps {
  params: { slug: string };
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = getPost(params.slug);
  if (!post) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-4">{post.data.title}</h1>

      {post.data.date && (
        <p className="text-gray-500 mb-4">
          {new Date(post.data.date).toLocaleDateString()}
        </p>
      )}

      {post.data.description && (
        <p className="text-lg text-gray-700 mb-8">{post.data.description}</p>
      )}

      <article className="prose prose-lg">
        <MDXClient slug={params.slug} />
      </article>

      {post.data.keywords && post.data.keywords.length > 0 && (
        <div className="mt-6 text-sm text-gray-500">
          <strong>Keywords:</strong> {post.data.keywords.join(", ")}
        </div>
      )}
      <RelatedPosts currentSlug={params.slug} />
    </main>
  );
}
