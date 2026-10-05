import { ArrowUp } from "lucide-react";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    hover: "hover:bg-[#E7F1FF] hover:text-[#2F6FDB]",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    hover: "hover:bg-[#F0EBFF] hover:text-[#6D4AFF]",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 3.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    hover: "hover:bg-[#E7F1FF] hover:text-[#2F6FDB]",
    path: "M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.589 9 4.706V8z",
  },
  {
    label: "X",
    href: "https://twitter.com",
    hover: "hover:bg-[#0F2A4A] hover:text-white",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

function FooterBottom() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-5 sm:flex-row">
      <p className="text-center text-sm font-medium text-[#64748B] sm:text-right">
        © 2026 مسار التميز. جميع الحقوق محفوظة.
      </p>

      <div className="flex items-center gap-2.5">
        {SOCIALS.map(({ label, href, hover, path }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F6FA] text-[#64748B] transition-all duration-300 hover:-translate-y-1 ${hover}`}
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d={path} />
            </svg>
          </a>
        ))}

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#E2E8F0]" />

        {/* العودة للأعلى */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="العودة للأعلى"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2A4A] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#0F8B78] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0F8B78]/30"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}

export default FooterBottom;