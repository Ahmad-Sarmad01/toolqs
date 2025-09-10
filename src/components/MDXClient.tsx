"use client";

import { useEffect, useState } from "react";

export default function MDXClient({ slug }: { slug: string }) {
  const [Post, setPost] = useState<any>(null);

  useEffect(() => {
    import(`@/content/blog/${slug}.mdx`)
      .then((mod) => setPost(() => mod.default))
      .catch((err) => console.error("Failed to load MDX:", err));
  }, [slug]);

  if (!Post) return <p>Loading...</p>;

  return <Post />;
}
