import Link from "next/link";
import { getAllPosts } from "@/lib/getPosts";
import { Metadata } from "next";
import ExploreCTA from "@/components/ExploreCTA";

export const metadata: Metadata = {
  title: "Blog | ToolQS – Productivity, Learning & Online Tools",
  description:
    "Read insights, guides, and tips on productivity, study hacks, and the best online tools from ToolQS.",
  keywords: [
    "blog",
    "online tools blog",
    "productivity tips",
    "learning hacks",
    "free tools guides"
  ],
  openGraph: {
    title: "Blog | ToolQS – Productivity, Learning & Online Tools",
    description:
      "Guides and insights on productivity, study, and online tools.",
    url: "https://toolqs.com/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | ToolQS – Productivity, Learning & Online Tools",
    description:
      "Tips and guides on productivity, learning, and the best online tools.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-8xl mx-auto pt-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Our Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Insights, tips, and guides on productivity, learning, and the best
          online tools to make your work and studies easier.
        </p>
      </div>

      <div className="px-6 md:px-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="mt-auto inline-block text-blue-600 font-semibold"
            >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(post.date).toLocaleDateString()}
              </p>
              {post.description && (
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.description}
                </p>
              )}
              {post.keywords && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  {post.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="inline-block text-blue-600 font-semibold hover:underline">Read More →</span>
            </Link>
          </article>
        ))}
      </div>
      <div className="mt-10">
      <ExploreCTA />
      </div>
    </main>
  );
}
