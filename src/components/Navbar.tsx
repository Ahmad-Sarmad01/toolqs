"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // helper: close menu after click
  const handleLinkClick = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ToolQS Logo"
              width={170}
              height={70}
              priority
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link href="/">Home</Link>
            <div className="relative group">
              <button className="hover:text-blue-600 hover:cursor-pointer flex items-center">
              <Link href="/tools"> Tools ▾</Link>
              </button>
              <div className="absolute hidden group-hover:grid bg-white shadow-lg rounded-md mt-1 -left-105 w-180 p-3 grid-cols-3 gap-2 z-50">
                <Link href="/tools/gpa-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">GPA Calculator</Link>
                <Link href="/tools/qr-code" className="px-3 py-2 hover:bg-gray-100 rounded-md">QR Generator</Link>
                <Link href="/tools/pdf-merger" className="px-3 py-2 hover:bg-gray-100 rounded-md">PDF Merger</Link>
                <Link href="/tools/pdf-splitter" className="px-3 py-2 hover:bg-gray-100 rounded-md">PDF Splitter</Link>
                <Link href="/tools/word-to-pdf" className="px-3 py-2 hover:bg-gray-100 rounded-md">Word to PDF</Link>
                <Link href="/tools/pdf-to-word" className="px-3 py-2 hover:bg-gray-100 rounded-md">PDF to Word</Link>
                <Link href="/tools/image-to-pdf" className="px-3 py-2 hover:bg-gray-100 rounded-md">Image to PDF</Link>
                <Link href="/tools/image-background-remover" className="px-3 py-2 hover:bg-gray-100 rounded-md">Background Remover</Link>
                <Link href="/tools/unit-converter" className="px-3 py-2 hover:bg-gray-100 rounded-md">Unit Converter</Link>
                <Link href="/tools/word-counter" className="px-3 py-2 hover:bg-gray-100 rounded-md">Word Counter</Link>
                <Link href="/tools/image-compress" className="px-3 py-2 hover:bg-gray-100 rounded-md">Image Compressor</Link>
                <Link href="/tools/loan-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">Loan Calculator</Link>
                <Link href="/tools/calorie-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">Calorie Calculator</Link>
                <Link href="/tools/grade-calculator" className="px-3 py-2 hover:bg-gray-100 rounded-md">Grade Calculator</Link>
              </div>
            </div>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 text-2xl">
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <Link href="/" onClick={handleLinkClick} className="block px-4 py-2">Home</Link>
          <Link href="/tools/gpa-calculator" onClick={handleLinkClick} className="block px-4 py-2">GPA Calculator</Link>
          <Link href="/tools/qr-code" onClick={handleLinkClick} className="block px-4 py-2">QR Generator</Link>
          <Link href="/tools/pdf-merger" onClick={handleLinkClick} className="block px-4 py-2">PDF Merger</Link>
          <Link href="/tools/pdf-splitter" onClick={handleLinkClick} className="block px-4 py-2">PDF Splitter</Link>
          <Link href="/tools/word-to-pdf" onClick={handleLinkClick} className="block px-4 py-2">Word to PDF</Link>
          <Link href="/tools/pdf-to-word" onClick={handleLinkClick} className="block px-4 py-2">PDF to Word</Link>
          <Link href="/tools/image-to-pdf" onClick={handleLinkClick} className="block px-4 py-2">Image to PDF</Link>
          <Link href="/tools/image-background-remover" onClick={handleLinkClick} className="block px-4 py-2">Background Remover</Link>
          <Link href="/tools/unit-converter" onClick={handleLinkClick} className="block px-4 py-2">Unit Converter</Link>
          <Link href="/tools/word-counter" onClick={handleLinkClick} className="block px-4 py-2">Word Counter</Link>
          <Link href="/tools/image-compress" onClick={handleLinkClick} className="block px-4 py-2">Image Compressor</Link>
          <Link href="/tools/loan-calculator" onClick={handleLinkClick} className="block px-4 py-2">Loan Calculator</Link>
          <Link href="/tools/calorie-calculator" onClick={handleLinkClick} className="block px-4 py-2">Calorie Calculator</Link>
          <Link href="/tools/grade-calculator" onClick={handleLinkClick} className="block px-4 py-2">Grade Calculator</Link>
          <Link href="/blog" onClick={handleLinkClick} className="block px-4 py-2">Blog</Link>
          <Link href="/about" onClick={handleLinkClick} className="block px-4 py-2">About</Link>
          <Link href="/contact" onClick={handleLinkClick} className="block px-4 py-2">Contact</Link>
        </div>
      )}
    </nav>
  );
}
