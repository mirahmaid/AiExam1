import { Quote, Trophy } from "lucide-react";

// ألوان محطات المسار في الـ Hero (بطاقة لكل لون)
const ACCENTS = ["#2DD4BF", "#A78BFA", "#FBBF24"];

function TestimonialCard({ item, index = 0 }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const photo = item.image || item.avatar;

  return (
    <li className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#DCE7F0] bg-white p-7 shadow-[0_20px_50px_-35px_rgba(15,42,74,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(15,42,74,0.4)]">
      {/* شريط لوني علوي */}
      <span
        aria-hidden="true"
        className="absolute inset-x-7 top-0 h-[4px] rounded-b-full"
        style={{ backgroundColor: accent }}
      />

      {/* علامة اقتباس خفيفة */}
      <Quote
        size={44}
        aria-hidden="true"
        className="absolute left-6 top-7 -scale-x-100"
        style={{ color: accent, opacity: 0.22 }}
      />

      {/* النص */}
      <div>
        {item.percentage && (
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#0F2A4A] px-3.5 py-1.5 text-sm font-black text-white">
            <Trophy size={15} aria-hidden="true" style={{ color: accent }} />
            {item.percentage}
          </span>
        )}

        <p className="line-clamp-4 text-base font-medium leading-8 text-[#1E3A57]">
          {item.text}
        </p>
      </div>

      {/* الطالب */}
      <div className="mt-6 flex items-center gap-3.5 border-t border-[#E7EEF4] pt-5">
        {photo ? (
          <img
            src={photo}
            alt={item.name}
            className="h-12 w-12 rounded-full object-cover ring-[3px] ring-offset-2"
            style={{ "--tw-ring-color": accent }}
          />
        ) : (
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-base font-black text-[#0F2A4A]"
            style={{ backgroundColor: `${accent}40` }}
          >
            {item.name?.charAt(0)}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-base font-black text-[#0F2A4A]">
            {item.name}
          </p>

          {item.track && (
            <p className="mt-0.5 truncate text-sm font-bold text-[#0F8B78]">
              {item.track}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export default TestimonialCard;