function FooterLinksColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-3">

      <h3 className="relative -top-[25px] text-base font-bold text-[#002C5A]">
        {title}
      </h3>

      <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="transition-colors hover:text-[#002C5A]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default FooterLinksColumn;