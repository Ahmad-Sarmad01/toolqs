import Head from "next/head";
import Link from "next/link";
import { Metadata } from "next";
import { GraduationCap, QrCode, FileText, Calculator, FileBadge, Type, Ruler, Image } from "lucide-react";

export const metadata: Metadata = {
  title: "About | ToolQS - Free Online Tools Hub",
  description:
    "Learn about ToolQS – your free hub of online tools like GPA calculator, QR generator, PDF tools, loan calculator, resume builder, and more. Simple, fast, and forever free.",
  keywords: [
    "about ToolQS",
    "free online tools hub",
    "productivity tools",
    "GPA calculator",
    "QR generator",
    "PDF tools",
    "resume builder",
    "unit converter",
  ],
  openGraph: {
    title: "About | ToolQS - Free Online Tools Hub",
    description:
      "ToolQS is a free hub of smart, online tools designed for students, professionals, and businesses. Always free, fast, and secure.",
    url: "https://toolqs.com/about",
    type: "website",
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("About ToolQS | Free Online Tools Hub")}`,
        width: 1200,
        height: 630,
        alt: "About ToolQS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | ToolQS - Free Online Tools Hub",
    description:
      "Discover why ToolQS exists — free online tools for study, work, and productivity. Secure, fast, and forever free.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  return (
    <div className="font-sans text-gray-900">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ToolQS",
              "url": "https://toolqs.com",
              "logo": "https://toolqs.com/logo.png",
              "sameAs": [
                "https://facebook.com/toolqs",
                "https://twitter.com/toolqs",
                "https://instagram.com/toolqs",
                "https://linkedin.com/company/toolqs"
              ],
              "description":
                "ToolQS is a free online hub offering productivity tools like GPA calculators, QR code generators, PDF tools, resume builders, and more.",
            }),
          }}
        />
      </Head>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            About ToolQS
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
            ToolQS is your go-to hub of free online tools designed to save time,
            simplify work, and boost productivity — whether you’re a student,
            professional, or business owner.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We built ToolQS with a simple mission: to make powerful online tools
            accessible to everyone, completely free. From academic calculators
            to professional utilities, ToolQS is designed to be{" "}
            <strong>fast, reliable, and available anywhere</strong>.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AboutCard
              icon={<GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="GPA Calculator"
              description="Quickly calculate your Grade Point Average with accuracy — perfect for students who want fast results."
            />
            <AboutCard
              icon={<QrCode className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="QR Code Generator"
              description="Create custom QR codes in seconds for links, text, or contact info — free and easy to use."
            />
            <AboutCard
              icon={<FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="PDF Tools"
              description="Compress, merge, or convert PDF files instantly. Simple and secure tools for everyday work and study."
            />
            <AboutCard
              icon={<Calculator className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="Loan Calculator"
              description="Plan your finances with ease — calculate monthly payments and interest with our smart loan tool."
            />
            <AboutCard
              icon={<FileBadge className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="Resume Builder"
              description="Build a professional resume in minutes with our free, easy-to-use online resume generator."
            />
            <AboutCard
              icon={<Type className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="Word Counter"
              description="Count words, characters, and reading time instantly — a must-have tool for writers and students."
            />
            <AboutCard
              icon={<Ruler className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="Unit Converter"
              description="Convert units across categories like length, weight, temperature, and more in one click."
            />
            <AboutCard
              icon={<Image className="w-8 h-8 text-blue-600 mx-auto mb-3" />}
              title="Image Compressor"
              description="Reduce image file size without losing quality — perfect for web uploads, emails, and storage saving."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Why Choose <span className="text-[#0c2a4b]">Tool</span><span className="text-[#0cdcff]">QS</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            ToolQS is your all-in-one hub for <strong>free online tools</strong> —
            from GPA calculators and PDF converters to productivity boosters and
            everyday utilities. Here’s why millions of users trust us:
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left md:text-center">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-xl mb-2">💸 100% Free & Accessible</h3>
              <p className="text-gray-700">
                All tools are completely free to use, with no hidden fees,
                subscriptions, or sign-ups required.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-xl mb-2">📱 Cross-Device Friendly</h3>
              <p className="text-gray-700">
                Works smoothly on <strong>desktop, tablet, and mobile</strong> — no
                installation or app download needed.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-xl mb-2">🔒 Secure & Private</h3>
              <p className="text-gray-700">
                We respect your privacy — <strong>no data tracking</strong>, no file
                storage, and your information always stays safe.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-xl mb-2">⚡ Fast & Always Updated</h3>
              <p className="text-gray-700">
                Enjoy <strong>lightning-fast performance</strong> with regularly added
                features, tools, and updates to stay ahead.
              </p>
            </div>
          </div>
        </div>
      </section>

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
            href="/tools"
            className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            Explore Tools
          </Link>
        </div>
      </section>
    </div>
  );
}

function AboutCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition text-center">
      <div>{icon}</div>
      <h3 className="font-semibold text-xl mb-3 text-blue-700">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}
