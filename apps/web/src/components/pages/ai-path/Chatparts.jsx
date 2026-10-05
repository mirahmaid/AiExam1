// ChatParts.jsx — الأجزاء البصرية المنقولة من ChatArea
import { motion, useReducedMotion } from "framer-motion";
import { Check, FileText, Lock, Sparkles } from "lucide-react";
import { SubjectIcon } from "./SubjectMenu";

export const EASE = [0.22, 1, 0.36, 1];
const AURA = "conic-gradient(from 0deg,#A78BFA,#60A5FA,#2DD4BF,#FBBF24,#A78BFA)";

/* تظليل ملوّن تحت الكلمة */
export function Mark({ color, children }) {
  return (
    <span className="rounded-sm px-0.5 font-black text-[#0F2A4A]" style={{ backgroundImage: `linear-gradient(transparent 58%, ${color}59 58%)` }}>
      {children}
    </span>
  );
}

/* رقم الخطوة: done (✓) / current (نابض) / locked (قفل) */
export function StepBadge({ n, state = "current" }) {
  const cls = "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black";
  if (state === "done") return <span className={`${cls} bg-[#2DD4BF] text-[#0F2A4A]`} aria-label="تمّت الخطوة"><Check size={15} strokeWidth={3} /></span>;
  if (state === "locked") return <span className={`${cls} bg-slate-200 text-slate-500`} aria-label="مقفولة"><Lock size={13} strokeWidth={2.5} /></span>;
  return (
    <span className={`${cls} bg-[#0F2A4A] text-white`}>
      <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[#0F2A4A]/30" />
      <span className="relative">{n.toLocaleString("ar-EG")}</span>
    </span>
  );
}

/* عنوان الخطوة: الرقم + العنوان + ملاحظة صغيرة */
export function StepHead({ n, state, title, hint, hintClass }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <StepBadge n={n} state={state} />
      <p className={`text-[16px] font-black ${state === "locked" ? "text-slate-400" : "text-[#0F2A4A]"}`}>{title}</p>
      <span className={`text-[12px] ${hintClass}`}>{hint}</span>
    </div>
  );
}

/* الكرة الحيّة (هوية المساعد) */
export function Orb({ size = 104, busy = false, icon = 26 }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <motion.span
        className="absolute inset-[-6%] rounded-full opacity-80 blur-xl"
        style={{ background: AURA }}
        animate={reduce ? undefined : { rotate: 360, scale: busy ? [1, 1.2, 1] : [1, 1.06, 1] }}
        transition={{ rotate: { duration: busy ? 3 : 14, repeat: Infinity, ease: "linear" }, scale: { duration: busy ? 1 : 4, repeat: Infinity } }}
      />
      <motion.span
        className="absolute inset-[6%] rounded-full"
        style={{ background: AURA }}
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: busy ? 4 : 20, repeat: Infinity, ease: "linear" }}
      />
      <span className="absolute inset-[17%] flex items-center justify-center rounded-full bg-[#0F2A4A] text-[#9FF6E9] shadow-[inset_0_2px_12px_rgba(159,246,233,.25)]">
        <Sparkles size={icon} />
      </span>
    </div>
  );
}

/* المدار: أدوات AI بتدور حول الكرة (نفس ألوان وأيقونات AI_TOOLS) */
export function Orbit({ tools = [], activeTool, onPick, className = "" }) {
  const reduce = useReducedMotion();
  const spin = { duration: 100, repeat: Infinity, ease: "linear" };
  return (
    <div className={`relative mx-auto h-[240px] w-[240px] shrink-0 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center ${className}`}>
      <div className="absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 scale-[.77]">
        <span aria-hidden="true" className="absolute inset-[22px] rounded-full border-2 border-dashed border-[#0F2A4A]/10" />
        <span aria-hidden="true" className="absolute inset-[70px] rounded-full border border-[#2DD4BF]/25" />
        <div className="absolute inset-0 flex items-center justify-center"><Orb size={104} /></div>
        <motion.div className="absolute inset-0" animate={reduce ? undefined : { rotate: 360 }} transition={spin}>
          {tools.map((t, i) => {
            const a = (360 / tools.length) * i;
            const Icon = t.icon;
            const on = activeTool === t.id;
            return (
              <div
                key={t.id}
                className="absolute left-1/2 top-1/2 -ml-[28px] -mt-[28px] h-[56px] w-[56px] hover:z-20"
                style={{ transform: `rotate(${a}deg) translateY(-128px) rotate(${-a}deg)` }}
              >
                <motion.button
                  type="button"
                  onClick={() => onPick(t)}
                  aria-pressed={on}
                  aria-label={`${t.chip}: ${t.title}`}
                  animate={reduce ? undefined : { rotate: -360 }}
                  transition={spin}
                  whileHover={{ scale: 1.18 }}
                  className="group relative flex h-full w-full items-center justify-center rounded-2xl border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2DD4BF]/40"
                  style={{
                    borderColor: on ? t.deep : `${t.color}80`,
                    background: on ? t.deep : `linear-gradient(${t.color}26,${t.color}26) #fff`,
                    color: on ? "#fff" : t.deep,
                    boxShadow: `0 14px 26px -14px ${t.deep}`,
                  }}
                >
                  <Icon size={24} strokeWidth={2.4} aria-hidden="true" />
                  <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0F2A4A] px-3 py-1 text-[13px] font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    {t.chip}
                  </span>
                </motion.button>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

/* الرسائل */
function RichText({ text }) {
  return (
    <div dir="auto" className="whitespace-pre-wrap break-words text-[15px] font-medium leading-8">
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-black text-[#0F2A4A]">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </div>
  );
}

export function MessageBubble({ message, subjectIcon }) {
  const isStudent = message.role === "STUDENT";
  const questions = message.metadata?.questions;
  const time = message.createdAt ? new Date(message.createdAt).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" }) : "";
  const enter = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: EASE } };

  if (isStudent) {
    return (
      <motion.div {...enter} className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#0F2A4A] to-[#16406E] px-4 py-2.5 text-white shadow-lg shadow-[#0F2A4A]/20 sm:max-w-[75%]">
          {message.type === "FILE_UPLOAD" ? (
            <p className="flex items-center gap-2 text-[15px] font-bold"><FileText size={16} />{message.content}</p>
          ) : (
            <p dir="auto" className="whitespace-pre-wrap break-words text-[15px] font-medium leading-8">{message.content}</p>
          )}
          {time && <p className="mt-1 text-left text-[11px] text-white/60">{time}</p>}
        </div>
      </motion.div>
    );
  }

  const isError = message.type === "ERROR";
  return (
    <motion.div {...enter} className="flex items-end justify-end gap-2.5">
      <div className={`relative max-w-[90%] overflow-hidden rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ring-1 sm:max-w-[80%] ${isError ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-white text-slate-700 ring-slate-100"}`}>
        {!isError && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#A78BFA] via-[#60A5FA] to-[#2DD4BF]" />}
        {questions?.length ? (
          <div>
            <div className="mb-3 flex items-center gap-3">
              {subjectIcon && (
                <span className="h-9 w-9 shrink-0 rounded-xl bg-[#E8F7F3] p-1.5"><SubjectIcon key={subjectIcon} src={subjectIcon} /></span>
              )}
              <div>
                <p className="text-[15px] font-black text-[#0F2A4A]">جهّزت لك {questions.length} أسئلة تدريبية</p>
                <p className="text-[13px] font-medium text-slate-500">هنا نص الأسئلة اللي جهزها المساعد</p>
              </div>
            </div>
            <ol className="mb-2 flex flex-col gap-2">
              {questions.slice(0, 3).map((q, i) => (
                <li key={q.id ?? i} dir="auto" className="line-clamp-2 rounded-xl bg-[#F7FAFC] px-3 py-2 text-[13px] font-medium leading-6 text-slate-600">
                  <b className="text-[#0F8B78]">{i + 1}.</b> {q.questionText}
                </li>
              ))}
              {questions.length > 3 && <li className="text-center text-[13px] font-bold text-slate-500">+ {questions.length - 3} أسئلة أخرى</li>}
            </ol>
          </div>
        ) : (
          <RichText text={message.content} />
        )}
        {time && <p className="mt-1 text-[11px] text-slate-500">{time}</p>}
      </div>
      <Orb size={36} icon={11} />
    </motion.div>
  );
}