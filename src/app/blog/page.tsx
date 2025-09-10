import Link from "next/link";
import { getAllPosts } from "@/lib/getPosts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
          Our Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Insights, tips, and guides on productivity, learning, and the best
          online tools to make your work and studies easier.
        </p>
      </div>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
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
    </main>
  );
}
