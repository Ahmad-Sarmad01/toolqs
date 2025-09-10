import Link from "next/link";
import Head from "next/head";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ToolQS – Free Online Tools for Work & Study",
  description:
    "ToolQS offers free online tools for students, professionals, and businesses. Quickly calculate GPA, generate QR codes, manage PDFs, and more.",
  keywords: [
    "online tools",
    "free tools",
    "GPA calculator",
    "QR generator",
    "PDF tools",
    "Loan calculator",
    "Resume builder",
    "Word counter",
    "Unit converter",
    "Image compressor",
    "productivity tools",
  ],
  openGraph: {
    title: "ToolQS – Free Online Tools for Work & Study",
    description:
      "All-in-one free online tools for students, professionals, and businesses. GPA, QR, PDF, Loan, Resume, and more.",
    url: "https://toolqs.com",
    type: "website",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("ToolQS – Free Online Tools for Work & Study")}`,
        width: 1200,
        height: 630,
        alt: "ToolQS – Free Online Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolQS – Free Online Tools for Work & Study",
    description:
      "All-in-one free online tools for students, professionals, and businesses. GPA, QR, PDF, Loan, Resume, and more.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  return (
    <div className="font-sans text-gray-900">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ToolQS",
              "url": "https://toolqs.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://toolqs.com/tools?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            ToolQS – Quick & Smart Solutions for Work and Study
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl mx-auto">
            All-in-one free online tools for students, professionals, and businesses.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/tools"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
            >
              Explore Tools
            </Link>
            <Link
              href="/blog"
              className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard name="GPA Calculator" href="/tools/gpa-calculator" />
            <ToolCard name="QR Generator" href="/tools/qr-code" />
            <ToolCard name="PDF Tools" href="/tools/pdf-tools" />
            <ToolCard name="Loan Calculator" href="/tools/loan-calculator" />
            <ToolCard name="Resume Builder" href="/tools/resume-builder" />
            <ToolCard name="Word Counter" href="/tools/word-counter" />
            <ToolCard name="Unit Converter" href="/tools/unit-converter" />
            <ToolCard name="Image Compressor" href="/tools/image-compress" />
          </div>
        </div>
      </section>

      {/* Why Choose ToolQS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose ToolQS?</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            ToolQS is designed for students, professionals, and businesses who
            need reliable online tools — fast, free, and accessible anywhere.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Free Forever</h3>
              <p className="text-gray-700">
                No hidden charges. All tools are 100% free to use.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Fast & Simple</h3>
              <p className="text-gray-700">
                Get your work done instantly with an easy-to-use interface.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Student & Business Friendly</h3>
              <p className="text-gray-700">
                From GPA to PDFs, we’ve got solutions for study and work life.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Secure & Private</h3>
              <p className="text-gray-700">
                Your data stays private. We don’t store personal inputs or share them.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Accessible Anywhere</h3>
              <p className="text-gray-700">
                Use ToolQS on any device—desktop, tablet, or mobile—without installation.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Regularly Updated</h3>
              <p className="text-gray-700">
                We continuously improve our tools and add new ones to keep up with your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center relative overflow-hidden">

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">
            Start Using ToolQS Today
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            Quick, free, and easy-to-use online tools for work, study, and productivity. Boost your efficiency in just a few clicks!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/tools"
              className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              Browse All Tools
            </Link>
          </div>
          <p className="mt-6 text-gray-200 text-sm md:text-base">
            Free & Forever&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;Fast & Simple&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;Works on Any Device
          </p>
        </div>
      </section>

    </div>
  );
}

function ToolCard({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center"
      aria-label={`Open ${name}`}
    >
      <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
    </Link>
  );
}
