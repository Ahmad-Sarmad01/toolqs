import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

const postsDir = path.join(process.cwd(), "src/content/blog");

function getAllPosts() {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      return {
        slug: file.replace(/\.mdx$/, ""),
        ...data,
      } as {
        slug: string;
        title: string;
        description?: string;
        date?: string;
        keywords?: string[];
      };
    });
}

export default function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const allPosts = getAllPosts();

  const related = allPosts
    .filter((p) => p.slug !== currentSlug)
    .sort(
      (a, b) =>
        new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-semibold mb-4">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {related.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="border rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-medium text-lg">{post.title}</h3>
              {post.date && (
                <p className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </p>
              )}
              <span className="inline-block text-blue-600 font-semibold hover:underline">Read More →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
