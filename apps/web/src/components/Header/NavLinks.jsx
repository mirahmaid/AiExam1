import { useState } from "react";

const links = [
  { href: "#hero", label: "الرئيسية" },
  { href: "#features", label: "لماذا منصتنا" },
  { href: "#contact", label: "تواصل معنا" },
  { href: "#success-stories", label: "قصص النجاح" },
  { href: "#asked-questions", label: "الاسئلة الشائعة" },
];

function NavLinks() {
  const [activeTab, setActiveTab] = useState("الرئيسية");

  return (
    <nav className="hidden items-center gap-14 text-sm font-medium text-slate-600 lg:flex">
      {links.map((link) => {
        const isActive = activeTab === link.label;

        return (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setActiveTab(link.label)}
            className={`relative py-1 transition-colors ${
              isActive
                ? "font-bold text-[#002C5A]"
                : "hover:text-slate-900"
            }`}
          >
            {link.label}

            {isActive && (
              <span className="absolute -bottom-0 right-0 left-0 h-0.5 rounded-full bg-[#002C5A]" />
            )}
          </a>
        );
      })}
    </nav>
  );
}

export default NavLinks;