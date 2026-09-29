import CountUpNumber from "./CountUpNumber";

const stats = [
  { value: 300, suffix: "", label: "طالب ملتحق" },
  { value: 32, suffix: "", label: "دورة متخصصة" },
  { value: 25, suffix: "", label: "معلم متخصص" },
  { value: 10, suffix: "", label: "أعوام من الابتكار التعليمي" },
];

export default function StatsSection() {
  return (
    <section className="px-4 py-8 sm:px-8 my-14">
      <div
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-6 px-12 py-10 sm:gap-x-16 sm:px-16"
        style={{
          borderRadius: "0px 320px 320px 640px",
          backgroundColor: "#00D4FF1A",
          boxShadow: "0 20px 40px -15px rgba(0, 44, 90, 0.18)",
        }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="text-3xl font-black text-[#002C5A] sm:text-4xl">
              <CountUpNumber end={stat.value} suffix={stat.suffix} duration={3200} />
            </span>
            <span className="mt-1 max-w-[110px] text-xs font-medium text-[#767676] sm:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
