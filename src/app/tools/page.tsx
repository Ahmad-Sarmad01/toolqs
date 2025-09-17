"use client";

import Head from "next/head";
import Link from "next/link";
import { Calculator, FileText, Briefcase, Layers, QrCode, Image, Scissors, FilePlus, Scale, WholeWord, GraduationCap, FileSpreadsheet, Activity } from "lucide-react";
import BlogCTA from "@/components/BlogCTA";

const tools = [
  {
    name: "GPA / CGPA Calculator",
    slug: "gpa-calculator",
    description:
      "Calculate GPA and CGPA online with support for global and Pakistan grading systems. Ideal for students, universities, and academic professionals.",
    icon: Calculator,
  },
  {
    name: "PDF Merger",
    slug: "pdf-merger",
    description:
      "Merge multiple PDF files into a single PDF online. Fast, secure, and free — perfect for students, professionals, and businesses.",
    icon: Layers,
  },
  {
    name: "PDF Splitter",
    slug: "pdf-splitter",
    description:
      "Split PDF documents into individual pages or extract specific sections. Easy, secure, and browser-based PDF splitting tool.",
    icon: Scissors,
  },
  {
    name: "QR Code Generator",
    slug: "qr-code",
    description:
      "Generate QR codes for URLs, text, WiFi credentials, and more. Download in PNG or SVG instantly — perfect for personal or business use.",
    icon: QrCode,
  },
  {
    name: "Image Compressor",
    slug: "image-compress",
    description:
      "Compress JPG, PNG, or WebP images online to reduce file size without losing quality. Great for web, email, and social media.",
    icon: Image,
  },
  {
    name: "Word to PDF Converter",
    slug: "word-to-pdf",
    description:
      "Convert Word documents (.doc / .docx) to PDF format online. Secure, fast, and formatting-preserving Word to PDF converter.",
    icon: FileSpreadsheet,
  },
  {
    name: "PDF to Word Converter",
    slug: "pdf-to-word",
    description:
      "Convert PDF files into editable Word documents online. Preserve layout and formatting while making edits.",
    icon: FileText,
  },
  {
    name: "Image to PDF Converter",
    slug: "image-to-pdf",
    description:
      "Turn JPG, PNG, or WebP images into a single PDF file. Perfect for reports, portfolios, and online sharing.",
    icon: FilePlus,
  },
  {
    name: "Word / Character Counter",
    slug: "word-counter",
    description:
      "Count words, characters, and estimate reading time instantly online. Built for writers, students, and bloggers.",
    icon: WholeWord,
  },
  {
    name: "Loan / EMI Calculator",
    slug: "loan-calculator",
    description:
      "Calculate monthly loan EMI, interest, and principal with amortization tables. Free financial planning tool.",
    icon: Calculator,
  },
  {
    name: "Resume / CV Builder",
    slug: "resume-builder",
    description:
      "Create professional resumes and CVs online using templates. Export to PDF and optimize for recruiters.",
    icon: Briefcase,
  },
  {
    name: "Unit Converter",
    slug: "unit-converter",
    description:
      "Convert units of length, weight, temperature, area, and more online. Perfect for students, engineers, and professionals.",
    icon: Scale,
  },
  {
    name: "Calorie Counter",
    slug: "calorie-counter",
    description:
      "Track daily calorie intake and monitor nutrition easily. Great for fitness enthusiasts, health-conscious individuals, and diet planners.",
    icon: Activity, 
  },
  {
    name: "Grade Calculator",
    slug: "grade-calculator",
    description:
      "Easily calculate grades from marks or percentages. Perfect for students and teachers to quickly assess performance.",
    icon: GraduationCap, 
  },
  {
    name: "Background Remover",
    slug: "image-background-remover",
    description:
      "Easily calculate grades from marks or percentages. Perfect for students and teachers to quickly assess performance.",
    icon: GraduationCap, 
  },
];

export default function ToolsPage() {
  const toolsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `https://toolqs.com/tools/${tool.slug}`,
      description: tool.description,
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free Online Tools - ToolQS",
    url: "https://toolqs.com/tools",
    description:
      "ToolQS offers the best free online tools including GPA calculator, PDF merger, QR code generator, image compressor, resume builder, and more. Fast, secure, and user-friendly.",
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "ToolQS",
      url: "https://toolqs.com",
    },
  };

  return (
    <>
      <Head>
        <title>Free Online Tools - GPA Calculator, PDF Tools, QR Codes | ToolQS</title>
        <meta
          name="description"
          content="ToolQS provides the best free online tools for students, professionals, and businesses. Merge PDFs, calculate GPA, generate QR codes, compress images, and more. Fast, secure, and mobile-friendly."
        />
        <meta
          name="keywords"
          content="online tools, free GPA calculator, PDF merger, PDF splitter, Word to PDF converter, PDF to Word converter, QR code generator, image compressor, image to PDF, resume builder, word counter, unit converter, ToolQS"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ToolQS" />
        <link rel="canonical" href="https://toolqs.com/tools" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Online Tools - ToolQS" />
        <meta
          property="og:description"
          content="Discover the best free online tools: GPA calculator, PDF merger, QR code generator, resume builder, unit converter, and more. Fast, reliable, and secure."
        />
        <meta property="og:url" content="https://toolqs.com/tools" />
        <meta property="og:site_name" content="ToolQS" />
        <meta property="og:image" content="https://toolqs.com/og-image.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Tools - ToolQS" />
        <meta
          name="twitter:description"
          content="ToolQS offers free online tools: GPA calculator, PDF merger, QR code generator, resume builder, word counter, and more."
        />
        <meta name="twitter:image" content="https://toolqs.com/og-image.jpg" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([toolsSchema, webPageSchema]),
          }}
        />
      </Head>

      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-28 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Free Online Tools by ToolQS
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Explore All Free Tools in One Place
          </h2>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
            ToolQS provides powerful, reliable, and user-friendly online tools —
            from GPA calculators to PDF utilities and QR code generators. All free,
            secure, and mobile-friendly.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tools.map((tool, idx) => (
            <Link
              key={idx}
              href={`/tools/${tool.slug}`}
              aria-label={`Use ${tool.name}`}
              className="flex flex-col justify-between min-h-[350px] p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition transform text-center
                        border border-transparent hover:ring-1 hover:ring-blue-400
                        bg-gradient-to-r from-white via-blue-50 to-white
                        hover:bg-gradient-to-r hover:from-white hover:via-blue-100 hover:to-white"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <tool.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2 text-blue-700">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {tool.description}
                </p>
              </div>
              <button className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Use Now
              </button>
            </Link>
          ))}
        </div>
      </section>

      <section className="pt-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <p className="text-gray-700 leading-relaxed text-lg">
            At ToolQS, we believe essential tools should be free and accessible to
            everyone. Whether calculating GPA, merging PDFs, or generating QR codes,
            our goal is to simplify your digital tasks.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Every tool is fast, secure, and mobile-friendly — no downloads or
            subscriptions required. We constantly expand our library based on user
            feedback, ensuring ToolQS stays your go-to online toolbox.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            ToolQS makes workflows easier with simple, browser-based utilities. From
            GPA calculators to resume builders, we’re here to help you get things
            done faster.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            No hidden fees, no signups — just the tools you need, when you need
            them.
          </p>
        </div>
      </section>

      <BlogCTA />
    </>
  );
}
