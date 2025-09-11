import { Metadata } from "next";
import ContactForm from "./ContactForm";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Contact | ToolQS – Support, Feedback & Business Inquiries",
  description:
    "Contact ToolQS for support, feedback, or business inquiries. We're here to help students, professionals, and businesses with free online tools.",
  keywords: [
    "contact ToolQS",
    "ToolQS support",
    "ToolQS feedback",
    "business inquiries ToolQS",
    "contact free tools site",
  ],
  openGraph: {
    title: "Contact | ToolQS – Support, Feedback & Business Inquiries",
    description:
      "Get in touch with ToolQS for support, suggestions, or business opportunities.",
    url: "https://toolqs.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | ToolQS – Support, Feedback & Business Inquiries",
    description:
      "Get in touch with ToolQS for support, suggestions, or business opportunities.",
  },
};

export default function ContactPage() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "name": "Contact ToolQS",
              "url": "https://toolqs.com/contact",
              "mainEntity": {
                "@type": "Organization",
                "name": "ToolQS",
                "url": "https://toolqs.com",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "email": "support@toolqs.com",
                  "availableLanguage": ["English"],
                },
              },
            }),
          }}
        />
      </Head>
      <ContactForm />
    </>
  );
}
