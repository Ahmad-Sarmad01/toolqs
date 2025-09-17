import Link from "next/link";
import Head from "next/head";
import { Metadata } from "next";
import { Calculator, QrCode, FileText, Wallet, FileUser, Type, Ruler, Image, Gift, Zap, GraduationCap, Shield, Activity, Globe, RefreshCw, FilePlus, Scissors, FileInput } from "lucide-react";

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

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ToolCard name="GPA Calculator" href="/tools/gpa-calculator" icon={Calculator} description="Easily calculate your GPA." />
            <ToolCard name="QR Generator" href="/tools/qr-code" icon={QrCode} description="Generate QR codes in seconds." />
            <ToolCard name="PDF Merger" href="/tools/pdf-merger" icon={FilePlus} description="Combine multiple PDF files into one." />
            <ToolCard name="PDF Splitter" href="/tools/pdf-splitter" icon={Scissors} description="Split PDFs into individual pages or sections." />
            <ToolCard name="Word to PDF Converter" href="/tools/word-to-pdf" icon={FileText} description="Convert Word documents into PDFs easily." />
            <ToolCard name="PDF to Word Converter" href="/tools/pdf-to-word" icon={FileInput} description="Extract text and content by converting PDFs into Word." />
            <ToolCard name="Image to PDF Converter" href="/tools/image-to-pdf" icon={Image} description="Turn images (JPG, PNG, etc.) into a single PDF."/>
            <ToolCard name="Loan Calculator" href="/tools/loan-calculator" icon={Wallet} description="Plan your loan repayments." />
            <ToolCard name="Calorie Counter" href="/tools/calorie-counter" icon={Activity} description="Track daily calorie intake and monitor nutrition easily." />
            <ToolCard name="Word Counter" href="/tools/word-counter" icon={Type} description="Count words and characters." />
            <ToolCard name="Unit Converter" href="/tools/unit-converter" icon={Ruler} description="Convert units instantly." />
            <ToolCard name="Image Compressor" href="/tools/image-compress" icon={Image} description="Reduce image file size." />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose ToolQS?</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            ToolQS is designed for students, professionals, and businesses who
            need reliable online tools — fast, free, and accessible anywhere.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <Gift className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Free Forever</h3>
              <p className="text-gray-700">No hidden charges. All tools are 100% free to use.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <Zap className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Fast & Simple</h3>
              <p className="text-gray-700">Get your work done instantly with an easy-to-use interface.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <GraduationCap className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Student & Business Friendly</h3>
              <p className="text-gray-700">From GPA to PDFs, we’ve got solutions for study and work life.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <Shield className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Secure & Private</h3>
              <p className="text-gray-700">Your data stays private. We don’t store personal inputs or share them.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Accessible Anywhere</h3>
              <p className="text-gray-700">Use ToolQS on any device—desktop, tablet, or mobile—without installation.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center">
              <RefreshCw className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-xl mb-3 text-blue-700">Regularly Updated</h3>
              <p className="text-gray-700">We continuously improve our tools and add new ones to keep up with your needs.</p>
            </div>
          </div>
        </div>
      </section>

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

function ToolCard({ name, href, icon: Icon, description }: { name: string; href: string; icon: React.ElementType; description: string; }) {
  return (
    <Link
      href={href}
      className="block bg-white p-6 rounded-xl shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center"
      aria-label={`Open ${name}`}
    >
      <Icon className="w-10 h-10 text-blue-600 mb-4" />
      <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </Link>
  );
}
