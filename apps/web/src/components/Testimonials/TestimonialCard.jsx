function TestimonialCard({ item, isActive }) {
  return (
    <article
      className={[
        "flex flex-col items-center text-center",
        "w-full min-h-[420px]",
        "rounded-[28px] p-6 pt-5",
        "shadow-[0_10px_30px_rgba(0,44,90,0.06)]",
        "transition-all duration-300",
        isActive
          ? "bg-[#00D4FF1A] shadow-[0_14px_36px_rgba(0,44,90,0.12)] scale-[1.02]"
          : "bg-white",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="self-start font-serif text-[38px] font-extrabold leading-none text-[#002C5A] mb-1 opacity-90 -mt-8"
      >
        ”
      </span>

      <div className="relative w-[110px] h-[110px] rounded-2xl overflow-hidden mb-4 flex-shrink-0">
        <img
          src={item.image || item.avatar}
          alt={item.name}
          className="w-full h-full object-cover block"
        />

        {item.percentage && (
          <span className="absolute bottom-1 right-1 bg-[#38B793] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
            {item.percentage}
          </span>
        )}
      </div>

      <h3 className="text-[#002C5A] font-extrabold text-lg mb-1">{item.name}</h3>

      {item.track && (
        <p className="text-[#38B793] text-[13px] font-semibold mb-4">{item.track}</p>
      )}

      <p className="text-[#767676] text-[12.5px] leading-[1.9] text-center px-1">
        {item.text}
      </p>
    </article>
  );
}

export default TestimonialCard;