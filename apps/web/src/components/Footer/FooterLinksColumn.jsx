import { Link } from "react-router-dom";

const linkClass =
  "group flex w-fit items-center gap-2.5 text-[15px] font-semibold text-[#475569] transition-colors duration-300 hover:text-[#0F8B78]";

function FooterLinksColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-5 text-base font-black text-[#0F2A4A]">{title}</h3>

      <ul className="flex flex-col gap-3.5">
        {links.map(({ href, label }) => {
          const dot = (
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#CBD5E1] transition-all duration-300 group-hover:bg-[#2DD4BF] group-hover:ring-4 group-hover:ring-[#2DD4BF]/15"
            />
          );

          return (
            <li key={href}>
              {/* الروابط اللي بتبدأ بـ / صفحات، والباقي أقسام بنفس الصفحة */}
              {href.startsWith("/") ? (
                <Link to={href} className={linkClass}>
                  {dot}
                  {label}
                </Link>
              ) : (
                <a href={href} className={linkClass}>
                  {dot}
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FooterLinksColumn;