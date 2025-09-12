"use client";

import Head from "next/head";
import Link from "next/link";
import { Calculator, FileText, Briefcase, Layers, QrCode, Image, Scissors, FilePlus, Scale, File, WholeWord, FileSpreadsheet } from "lucide-react";
import BlogCTA from "@/components/BlogCTA";

const tools = [
  {
    name: "GPA / CGPA Calculator",
    slug: "gpa-calculator",
    description: "Calculate your GPA or CGPA online accurately with support for global and Pakistan grading systems. Ideal for students, universities, and academic professionals to track grades, credit hours, and performance.",
    icon: Calculator,
  },
  {
    name: "PDF Merger",
    slug: "pdf-merger",
    description: "Merge multiple PDF files into a single PDF quickly and securely. Perfect for students, professionals, and businesses looking for a fast online PDF merging tool without installation.",
    icon: Layers,
  },
  {
    name: "PDF Splitter",
    slug: "pdf-splitter",
    description: "Split PDF documents into separate pages or extract specific sections. Use our online PDF splitter for easy, secure, and fast PDF editing without any software.",
    icon: Scissors,
  },
  {
    name: "QR Code Generator",
    slug: "qr-code",
    description: "Generate QR codes for URLs, text, WiFi credentials, and more. Download high-quality PNG or SVG QR codes instantly for personal or business use.",
    icon: QrCode,
  },
  {
    name: "Image Compressor",
    slug: "image-compress",
    description: "Compress JPG, PNG, or WebP images online to reduce file size without losing quality. Perfect for websites, emails, and social media sharing.",
    icon: Image,
  },
  {
    name: "Word to PDF Converter",
    slug: "word-to-pdf",
    description: "Convert Word documents (.doc / .docx) to PDF format online. Secure, fast, and preserves formatting for students, professionals, and businesses.",
    icon: FileSpreadsheet,
  },
  {
    name: "PDF to Word Converter",
    slug: "pdf-to-word",
    description: "Convert PDF files into editable Word documents online. Maintain formatting while editing content quickly for work, school, or personal projects.",
    icon: FileText,
  },
  {
    name: "Image to PDF Converter",
    slug: "image-to-pdf",
    description: "Turn JPG, PNG, or WebP images into a PDF document online. Each image becomes a new page, perfect for creating reports, portfolios, or presentations.",
    icon: FilePlus,
  },
  {
    name: "Word / Character Counter",
    slug: "word-counter",
    description: "Count words, characters, and estimate reading time in real time online. Ideal for writers, students, bloggers, and content creators.",
    icon: WholeWord,
  },
  {
    name: "Loan / EMI Calculator",
    slug: "loan-calculator",
    description: "Calculate monthly loan EMI, interest, and principal with amortization tables. Plan your finances effectively using our free online loan calculator.",
    icon: Calculator,
  },
  {
    name: "Resume / CV Builder",
    slug: "resume-builder",
    description: "Create professional resumes and CVs online using clean templates. Export to PDF, optimize for recruiters, and land your dream job quickly.",
    icon: Briefcase,
  },
  {
    name: "Unit Converter",
    slug: "unit-converter",
    description: "Convert units of length, weight, temperature, area, and more online instantly. Perfect for students, engineers, and professionals requiring quick conversions.",
    icon: Scale,
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

  return (
    <>
      <Head>
        <title>Free Online Tools - ToolQS</title>
        <meta
          name="description"
          content="ToolQS offers free online tools for students, professionals, and businesses. Calculate GPA, merge or split PDFs, convert Word to PDF, generate QR codes, compress images, and more. Fast, secure, and user-friendly."
        />
        <meta
          name="keywords"
          content="online tools, free GPA calculator, PDF merger, PDF splitter, Word to PDF converter, PDF to Word converter, QR code generator, image compressor, image to PDF, resume builder, word counter, unit converter, ToolQS"
        />
        <link rel="canonical" href="https://toolqs.com/tools" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsSchema) }}
        />
      </Head>

      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-28 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Free Online Tools by ToolQS
          </h1>
          <h2 className="text-3xl font-bold mb-8">All Free Online Tools</h2>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
            ToolQS offers free, reliable, and easy-to-use online tools for students,
            professionals, and businesses. From GPA calculators to PDF utilities,
            find everything you need in one place.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {tools.map((tool, idx) => (
            <Link
              key={idx}
              href={`/tools/${tool.slug}`}
              className="flex flex-col justify-between min-h-[350px] p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition transform text-center
                        border border-transparent hover:ring-1 hover:ring-blue-400
                        bg-gradient-to-r from-white via-blue-50 to-white
                        hover:bg-gradient-to-r hover:from-white hover:via-blue-100 hover:to-white"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <tool.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-xl mb-2 text-blue-700">{tool.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{tool.description}</p>
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
            At ToolQS, we believe powerful tools should be accessible to everyone —
            without cost, subscriptions, or hidden fees. Whether you are a student
            looking to calculate your GPA, a professional needing a PDF tool, or a
            business generating QR codes, ToolQS is here to simplify your workflow.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Our tools are built to be fast, secure, and mobile-friendly so you can
            use them anytime, anywhere. Plus, we’re always expanding — adding new
            utilities regularly based on user feedback.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            ToolQS provides free online tools to make your workflow easier. Quickly calculate GPA, manage documents, create QR codes, compress images, and convert files online.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            All our tools are browser-based, secure, and mobile-friendly. No downloads or subscriptions required — just fast, reliable, and easy-to-use utilities at your fingertips.
          </p>
        </div>
      </section>

      <BlogCTA />
    </>
  );
}
