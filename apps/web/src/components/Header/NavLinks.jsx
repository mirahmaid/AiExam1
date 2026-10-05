import { useState } from "react";

const links = [
  {
    href: "#hero",
    label: "الرئيسية",
  },
  {
    href: "#features",
    label: "لماذا منصتنا",
  },
  {
    href: "#contact",
    label: "تواصل معنا",
  },
  {
    href: "#success-stories",
    label: "قصص النجاح",
  },
  {
    href: "#asked-questions",
    label: "الأسئلة الشائعة",
  },
];

function NavLinks() {
  const [activeTab, setActiveTab] = useState("الرئيسية");

  return (
    <nav className="hidden items-center gap-1.5 lg:flex">
      {links.map((link) => {
        const isActive = activeTab === link.label;

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setActiveTab(link.label)}
            className={`group relative px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
              isActive
                ? "text-[#0F8B78]"
                : "text-[#64748B] hover:text-[#0F2A4A]"
            }`}
          >
            <span className="relative">
              {link.label}

              <span
                className={`absolute -bottom-2 right-1/2 h-1 w-1 translate-x-1/2 rounded-full bg-[#12897A] transition-all duration-300 ${
                  isActive
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-50"
                }`}
              />
            </span>
          </a>
        );
      })}
    </nav>
  );
}

export default NavLinks;