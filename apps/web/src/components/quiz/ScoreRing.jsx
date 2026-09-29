import { scoreTone } from "../../../lib/quiz";
// حلقة دائرية لعرض النسبة المئوية
export default function ScoreRing({ percent, size = 140, stroke = 12, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const tone = scoreTone(percent);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * clamped) / 100}
          className={`${tone.text} transition-[stroke-dashoffset] duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#002C5A]" style={{ fontSize: size / 4.6 }}>
          {percent}%
        </span>
        {label !== "" && <span className={`text-xs font-semibold ${tone.text}`}>{label ?? tone.label}</span>}
      </div>
    </div>
  );
}