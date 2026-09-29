import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <img src="/logo.png" alt="مسار التميز" className="h-9 w-auto lg:h-14" />
    </Link>
  );
}

export default Logo;