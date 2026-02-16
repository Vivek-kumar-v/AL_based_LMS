import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Vivek Kumar
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Built with ❤️ for ConceptVault
            </p>

            <a
              href="mailto:patelvivek8874@gmail.com"
              className="inline-block mt-3 text-sm font-bold text-blue-600 hover:underline"
            >
              patelvivek8874@gmail.com
            </a>
          </div>

          {/* Right Links */}
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.linkedin.com/in/vivek-kumar-b52882290/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-bold hover:bg-blue-600 hover:text-white transition"
            >
              LinkedIn
            </a>

            <a
              href="https://github.com/Vivek-kumar-v"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-bold hover:bg-black hover:text-white transition"
            >
              GitHub
            </a>

            <a
              href="https://www.instagram.com/the__vivek_9/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-bold hover:bg-pink-600 hover:text-white transition"
            >
              Instagram
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-200 dark:bg-gray-800 my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            © {year} <span className="font-bold">Vivek Kumar</span>. All rights
            reserved.
          </p>

          <p className="font-semibold">
            ConceptVault • Smart Notes • OCR • AI ✨
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
