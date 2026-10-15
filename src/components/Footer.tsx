import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-indigo-900 text-gray-300 pt-2 pb-6">

      <div className="flex flex-col items-center md:items-center gap-3 md:gap-4 text-center">
        <img src="/logo.png" alt="ToolQS Logo" className="h-25" />
      </div>
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center md:flex-row justify-between gap-8">
          <p className="text-sm md:text-base">
            © {new Date().getFullYear()} ToolQS. All rights reserved.
          </p>

        <div className="flex flex-col items-center md:flex-row md:items-center gap-6 md:gap-10 text-sm">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center">
            <a href="/faq" className="hover:text-white transition">FAQ</a>
            <a href="/blog" className="hover:text-white transition">Blog</a>
            <a href="/about" className="hover:text-white transition">About</a>
            <a href="/contact" className="hover:text-white transition">Contact</a>
          </div>

          <div className="flex gap-4 text-gray-300">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0 w-full sm:w-auto justify-center">
          <input
            type="email"
            placeholder="Enter your email please"
            className="px-3 py-2 rounded-l-md text-white outline-1 outline-blue-500 focus:outline"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition font-semibold">
            Subscribe
          </button>
        </div>

      </div>

      <div className="mt-8 text-center text-white text-xs">
        Designed and built by <a href="https://www.linkedin.com/in/muhammad-ahmad-849b2a2a8/?isSelfProfile=false" className="hover:text-gray-300 transition">Ahmad</a>
      </div>
    </footer>
  );
}
