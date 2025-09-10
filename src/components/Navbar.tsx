"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link href="/">
            <Image src="/logo.png" alt="ToolQS Logo" width={170} height={70} priority />
          </Link>

          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link href="/">Home</Link>
            <div className="relative group">
            <Link href="/tools">
              <button className="hover:text-blue-600 hover:cursor-pointer flex items-center">
                Tools ▾
              </button>
            </Link>
              <div className="absolute hidden group-hover:grid bg-white shadow-lg rounded-md mt-1 -left-50 w-130 p-3 grid-cols-3 gap-2 z-50">
                <Link href="/tools/gpa-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">GPA Calculator</Link>
                <Link href="/tools/qr-code" className="px-5 py-2 hover:bg-gray-100 rounded-md">QR Generator</Link>
                <Link href="/tools/pdf-tools" className="px-3 py-2 hover:bg-gray-100 rounded-md">PDF Tools</Link>
                <Link href="/tools/unit-converter" className="px-3 py-2 hover:bg-gray-100 rounded-md">Unit Converter</Link>
                <Link href="/tools/word-counter" className="px-3 py-2 hover:bg-gray-100 rounded-md">Word Counter</Link>
                <Link href="/tools/resume-builder" className="px-3 py-2 hover:bg-gray-100 rounded-md">Resume Builder</Link>
                <Link href="/tools/image-compressor" className="px-3 py-2 hover:bg-gray-100 rounded-md">Image Compressor</Link>
                <Link href="/tools/loan-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">Loan Calculator</Link>
              </div>
            </div>

            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800">
              ☰
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <Link href="/" className="block px-4 py-2">Home</Link>
          <Link href="/tools/gpa-calculator" className="block px-4 py-2">GPA Calculator</Link>
          <Link href="/tools/qr-code" className="block px-4 py-2">QR Generator</Link>
          <Link href="/tools/pdf-tools" className="block px-4 py-2">PDF Tools</Link>
          <Link href="/tools/unit-converter" className="block px-4 py-2">Unit Converter</Link>
          <Link href="/tools/gpa-calculator" className="block px-4 py-2">Word Counter</Link>
          <Link href="/tools/qr-code" className="block px-4 py-2">Resume Builder</Link>
          <Link href="/tools/pdf-tools" className="block px-4 py-2">Image Compressor</Link>
          <Link href="/tools/unit-converter" className="block px-4 py-2">Loan Calculator</Link>
          <Link href="/blog" className="block px-4 py-2">Blog</Link>
          <Link href="/about" className="block px-4 py-2">About</Link>
          <Link href="/contact" className="block px-4 py-2">Contact</Link>
        </div>
      )}
    </nav>
  );
}
