"use client";

import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useState } from "react";
import Head from "next/head";


const faqs = [
  {
    question: "Is ToolQS free to use?",
    answer:
      "Yes! ToolQS is 100% free to use. We provide reliable online tools without hidden costs, subscriptions, or trial limitations.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required. All tools are available instantly without registration — whether it’s our [GPA Calculator](/tools/gpa-calculator), [QR Code Generator](/tools/qr-code-generator), or [Word Counter](/tools/word-counter).",
  },
  {
    question: "Will my data be stored or shared?",
    answer:
      "No. ToolQS does not collect, store, or share your inputs. For example, when you use the [PDF Compressor](/tools/pdf-compressor), your files are processed securely and never saved on our servers.",
  },
  {
    question: "What types of tools does ToolQS provide?",
    answer:
      "We provide a wide range of tools: [academic tools](/tools/gpa-calculator), [document utilities](/tools/pdf-merger), [career tools](/tools/resume-builder), [QR code tools](/tools/qr-code-generator), and [productivity helpers](/tools/word-counter).",
  },
  {
    question: "Can I use ToolQS on mobile or tablet?",
    answer:
      "Absolutely! ToolQS is fully responsive and works smoothly on desktop, tablet, and mobile devices without downloading any app.",
  },
  {
    question: "Do you plan to add more tools?",
    answer:
      "Yes! We regularly add new tools based on user feedback. For instance, recently we added the [Unit Converter](/tools/unit-converter) and [Resume Builder](/tools/resume-builder).",
  },
  {
    question: "Is ToolQS safe for students and professionals?",
    answer:
      "Yes. ToolQS is built with security in mind. Students can safely use our [GPA Calculator](/tools/gpa-calculator) and [Word Counter](/tools/word-counter), while professionals trust our [Resume Builder](/tools/resume-builder) and [PDF tools](/tools/pdf-compressor).",
  },
  {
    question: "How can I contact ToolQS support?",
    answer:
      "You can reach us at [support@toolqs.com](mailto:support@toolqs.com) or via our [Contact Page](/contact). We typically reply within 24–48 hours.",
  },
  {
    question: "Is ToolQS available worldwide?",
    answer:
      "Yes. ToolQS can be accessed from anywhere with an internet connection — making it a go-to solution for students, freelancers, and businesses worldwide.",
  },
  {
    question: "Do you offer premium or paid features?",
    answer:
      "Currently, all tools on ToolQS are free. In the future, we may introduce premium features, but the core tools like the [QR Code Generator](/tools/qr-code-generator) and [PDF Merger](/tools/pdf-merger) will always remain free.",
  },
  {
    question: "Can businesses use ToolQS tools?",
    answer:
      "Yes. Many small businesses use our [QR Code Generator](/tools/qr-code-generator) for promotions, [PDF utilities](/tools/pdf-compressor) for document handling, and [Unit Converter](/tools/unit-converter) for quick calculations.",
  },
  {
    question: "Where can I stay updated on new tools?",
    answer:
      "Check our [Blog](/blog) for updates, tutorials, and tool announcements. You can also follow us on social media for new launches.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer.replace(/<[^>]+>/g, ""), // remove links for schema text
      },
    })),
  };

  return (
    <>
      {/* SEO Meta */}
      <Head>
        <title>FAQ - ToolQS | Frequently Asked Questions</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about ToolQS. Learn about our free tools, privacy, mobile access, and support options."
        />
        <meta
          name="keywords"
          content="ToolQS FAQ, free online tools, GPA calculator, QR code generator, resume builder, toolqs support"
        />
        <link rel="canonical" href="https://toolqs.com/faq" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            Have questions about ToolQS? Explore answers below to learn how our
            tools work, how we protect your privacy, and how you can get support
            when you need it.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-6 shadow hover:shadow-md bg-white transition"
              >
                <button
                  className="flex justify-between w-full text-left text-lg font-semibold text-blue-700"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  {faq.question}
                  <span className="text-xl">
                    {openIndex === idx ? "−" : "+"}
                  </span>
                </button>
{openIndex === idx && (
  <div className="mt-4 text-gray-700 leading-relaxed">
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => (
          <Link
            href={props.href || "#"}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {props.children}
          </Link>
        ),
      }}
    >
      {faq.answer}
    </ReactMarkdown>
  </div>
)}

              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
