import "./globals.css";
import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import type { Metadata } from "next";
import Footer from "../components/Footer";
import MDXProviderWrapper from "../components/MDXProviderWrapper";

export const metadata: Metadata = {
  title: "ToolQS – Quick Solutions for Work and Study",
  description:
    "All-in-one free online tools: calculators, PDF utilities, QR generator, and more.",
  icons: {
    icon: "/Favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <MDXProviderWrapper>{children}</MDXProviderWrapper>
        </main>
        <Footer />
      </body>
    </html>
  );
}
