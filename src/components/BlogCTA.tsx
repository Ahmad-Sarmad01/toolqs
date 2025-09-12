"use client";

import Link from "next/link";

export default function BlogCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-center">
        <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ToolQS – Quick & Smart Solutions for Everyone
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
                Bookmark ToolQS and make it your daily hub for free online tools.
                Share it with friends, classmates, or colleagues — because powerful
                tools should be accessible to all.
            </p>
            <Link
                href="/blog"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
                Read Blog
            </Link>
        </div>
    </section>
  );
}