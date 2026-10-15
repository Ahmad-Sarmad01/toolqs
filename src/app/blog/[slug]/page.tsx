import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MDXClient from "@/components/MDXClient";
import RelatedPosts from "@/components/RelatedPosts";

const postsDir = path.join(process.cwd(), "src/content/blog");

interface PostData {
  title: string;
  date?: string;
  description?: string;
  keywords?: string[];
}

function getPost(slug: string): { data: PostData } | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  return { data } as { data: PostData };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return {
      title: "Post not found",
      description: "This blog post does not exist.",
    };
  }

  const siteUrl = "https://toolqs.com"; 
  const url = `${siteUrl}/blog/${slug}`;

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
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = getPost(slug);

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
        <MDXClient slug={slug} />
      </article>

      {post.data.keywords?.length ? (
        <div className="mt-6 text-sm text-gray-500">
          <strong>Keywords:</strong> {post.data.keywords.join(", ")}
        </div>
      ) : null}

      <RelatedPosts currentSlug={slug} />
    </main>
  );
}
