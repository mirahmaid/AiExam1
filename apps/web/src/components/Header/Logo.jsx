import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link
      to="/"
      aria-label="مسار التميز"
      className="group relative flex shrink-0 items-center"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-3xl bg-[#38B793]/0 blur-2xl transition-all duration-500 group-hover:bg-[#38B793]/10"
      />

      <img
        src="/logo.png"
        alt="مسار التميز"
        className="relative h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.025] sm:h-12 lg:h-[58px]"
      />
    </Link>
  );
}

export default Logo;