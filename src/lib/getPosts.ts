
import fs from "fs";
import path from "path";
import matter from "gray-matter";

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  keywords?: string[];
};

const postsDir = path.join(process.cwd(), "src/content/blog");

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(postsDir);

  return files
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const filePath = path.join(postsDir, fileName);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        ...data,
        slug,
      } as BlogPost;
    });
}
