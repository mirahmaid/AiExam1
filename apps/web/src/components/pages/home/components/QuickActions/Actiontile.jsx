import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/* مشاهد صغيرة حيّة: كل بطاقة إلها شخصيتها */
function Scene({ type, color, deep, reduce }) {
  if (type === "orbit")
    return (
      <div className="relative h-14 w-14">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-dashed"
          style={{ borderColor: `${color}90` }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
            style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          />
        </motion.span>
        <span className="absolute inset-4 rounded-full" style={{ background: `${color}55` }} />
      </div>
    );

  if (type === "books")
    return (
      <div className="flex h-14 items-end gap-1.5">
        {[34, 48, 40].map((h, i) => (
          <span
            key={i}
            className="w-3.5 rounded-t-md transition-transform duration-500 ease-[cubic-bezier(.3,1.9,.5,1)] group-hover:-translate-y-2.5"
            style={{
              height: h,
              background: i === 1 ? deep : color,
              transitionDelay: `${i * 70}ms`,
              rotate: `${(i - 1) * 6}deg`,
            }}
          />
        ))}
      </div>
    );

  if (type === "check")
    return (
      <svg viewBox="0 0 56 56" className="h-14 w-14" aria-hidden="true">
        <rect x="6" y="6" width="44" height="44" rx="14" fill="none" stroke={color} strokeWidth="3" strokeDasharray="5 6" />
        <path
          d="M17 29 L25 37 L40 19"
          fill="none"
          stroke={deep}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:40] [stroke-dashoffset:40] transition-[stroke-dashoffset] duration-500 group-hover:[stroke-dashoffset:0]"
        />
      </svg>
    );

  // chat
  return (
    <div
      className="flex h-9 items-center gap-1.5 rounded-2xl rounded-br-sm px-3.5"
      style={{ background: `${color}30` }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ background: deep }}
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ActionTile({ action, index, onClick, reduce }) {
  const { icon: Icon, color, deep, soft } = action;
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spot = useMotionTemplate`radial-gradient(240px circle at ${mx}% ${my}%, ${color}55, transparent 70%)`;

  const move = (e) => {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - b.left) / b.width) * 100);
    my.set(((e.clientY - b.top) / b.height) * 100);
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerMove={move}
      initial={reduce ? false : { opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className="group relative flex min-h-[176px] flex-col justify-between overflow-hidden rounded-[28px] border-2 bg-white p-5 text-right transition-[border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-4"
      style={{
        borderColor: "rgba(15,42,74,0.08)",
        boxShadow: "0 18px 40px -28px rgba(15,42,74,0.55)",
        "--c": color,
        "--d": deep,
        "--s": soft,
        "--tw-ring-color": `${color}66`,
      }}
    >
      {/* spotlight يتبع المؤشر */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spot }}
      />
      {/* حد ملوّن يظهر عند الـ hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[26px] border-2 border-transparent transition-colors duration-300 group-hover:border-[var(--c)]"
      />
      {/* أيقونة كبيرة باهتة بالخلفية */}
      <Icon
        aria-hidden="true"
        size={120}
        strokeWidth={1.2}
        className="pointer-events-none absolute -bottom-6 -left-6 opacity-[0.07] transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:opacity-[0.16]"
        style={{ color: deep }}
      />

      <div className="relative flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110"
          style={{ background: soft, color: deep }}
        >
          <Icon size={22} strokeWidth={2.3} aria-hidden="true" />
        </span>
        <Scene type={action.scene} color={color} deep={deep} reduce={reduce} />
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[19px] font-black leading-tight text-[#0F2A4A]">{action.title}</h3>
          <p className="mt-1 text-[13px] font-medium leading-6 text-[#64748B]">{action.text}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--s)] text-[var(--d)] transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-[var(--c)] group-hover:text-[#0B1F3A]">
          <ArrowUpLeft size={18} aria-hidden="true" />
        </span>
      </div>
    </motion.button>
  );
}