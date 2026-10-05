// ChatArea.jsx — "مدار المعرفة": ١ اختر المادة ← ٢ اكتب سؤالك، وأدوات AI بتدور حول الـOrb
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle, ArrowDown, ArrowLeft, BookOpen, Calculator, ChevronDown, ChevronRight,
  ClipboardCheck, FileText, Heart, History, Loader2, Plus, X,
} from "lucide-react";
import SubjectMenu, { SubjectChips, SubjectIcon } from "./SubjectMenu";
import { EASE, Mark, MessageBubble, Orb, Orbit, StepBadge, StepHead } from "./Chatparts";

const SUGGESTIONS = [
  { id: "math", text: "كيف أحل مسألة رياضيات بدقة؟", icon: Calculator, color: "#2DD4BF", deep: "#0F8B78" },
  { id: "exam", text: "كيف أبدأ مراجعة ليلة الامتحان؟", icon: ClipboardCheck, color: "#60A5FA", deep: "#2563EB" },
  { id: "summary", text: "لخص لي أهم نقاط هذا الدرس", icon: FileText, color: "#A78BFA", deep: "#6D4AFF" },
  { id: "anxiety", text: "كيف أتعامل مع قلق الامتحانات؟", icon: Heart, color: "#FB7185", deep: "#E11D48" },
];

const ACCEPTED_FILES = "application/pdf,image/png,image/jpeg,image/webp,image/gif";
const chipBase = "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-[13px] font-black shadow-sm transition hover:-translate-y-0.5";
const chipStyle = (color, deep) => ({ borderColor: `${color}80`, background: `${color}1F`, color: deep });
const popBox = "absolute bottom-full z-30 mb-2 rounded-2xl border border-slate-100 bg-white shadow-xl";

export default function ChatArea({
  active, messages, sending, error, loadingSession, input, setInput, file, setFile,
  onSend, onCloseActive, onOpenMobileSidebar, subjects, subjectsLoading, onPickSubject,
  sessions, onViewSession, activeSubjectIcon, scrollRef, fileRef, textareaRef, showToast,
  tools = [], activeTool, onToolChange,
}) {
  const reduce = useReducedMotion();
  const [pop, setPop] = useState(null); // "history" | "subject"
  const [nudge, setNudge] = useState(0); // كل ما يزيد، شرائح المواد بتهتز
  const subjectsRef = useRef(null);
  const locked = !active; // بدون مادة الحقل مقفول
  const currentTool = tools.find((t) => t.id === activeTool);
  const ToolIcon = currentTool?.icon;
  const togglePop = (name) => setPop((p) => (p === name ? null : name));
  const rise = (delay) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } };

  // الحقل بيكبر مع الكتابة
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input, textareaRef]);

  // بنرجّع الطالب للخطوة ١: بننزّل المواد لنص الشاشة وبنهزّها
  function nudgeSubjects(message = "اختر مادتك أولاً وبعدين اكتب سؤالك") {
    setPop(null);
    setNudge((n) => n + 1);
    subjectsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    showToast({ type: "info", message });
  }

  // اختيار أداة من المدار: بتعبّي مثال الأداة بالحقل كبداية سؤال جاهزة
  function pickTool(t) {
    if (activeTool === t.id) return onToolChange(null);
    onToolChange(t.id);
    if (!input.trim() && !file) setInput(t.demo(active ? `كتاب ${active.subject.name}` : "كتابك").you);
    if (active) textareaRef.current?.focus();
    else nudgeSubjects("اختر المادة وسؤالك جاهز بالحقل");
  }

  function applySuggestion(text) {
    setInput(text);
    if (active) textareaRef.current?.focus();
    else nudgeSubjects("اختر المادة وسؤالك جاهز بالحقل");
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f && f.size > 15 * 1024 * 1024) showToast({ type: "error", message: "حجم الملف يجب ألا يتجاوز 15 ميجابايت" });
    else if (f) setFile(f);
    e.target.value = "";
  }

  const composer = (
    <div>
      {file && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-[#E8F7F3] px-3 py-2 text-[13px] font-bold text-[#0F8B78]">
          <FileText size={15} />
          <span className="max-w-[200px] truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} aria-label="إزالة الملف" className="text-slate-400 hover:text-rose-500"><X size={14} /></button>
        </div>
      )}

      {currentTool && (
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[13px] font-black" style={chipStyle(currentTool.color, currentTool.deep)}>
            <ToolIcon size={15} strokeWidth={2.5} aria-hidden="true" />
            {currentTool.title}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-600">{currentTool.description}</span>
          <button type="button" onClick={() => onToolChange(null)} aria-label="إلغاء الأداة" className="shrink-0 text-slate-400 hover:text-rose-500"><X size={15} /></button>
        </div>
      )}

      {/* الإطار المتدرّج: باهت ومقفول لحد ما الطالب يختار المادة */}
      <div className={`relative transition-all duration-500 ${locked ? "opacity-60 saturate-50" : ""}`}>
        <div className="rounded-[30px] bg-gradient-to-l from-[#A78BFA] via-[#60A5FA] to-[#2DD4BF] p-[2.5px] shadow-[0_24px_50px_-24px_rgba(96,165,250,.85)] transition-shadow duration-500 focus-within:shadow-[0_28px_60px_-18px_rgba(96,165,250,1)]">
          <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="flex items-end gap-2 rounded-[28px] bg-white p-2">
            <input ref={fileRef} type="file" accept={ACCEPTED_FILES} className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              disabled={locked}
              onClick={() => fileRef.current?.click()}
              aria-label="إرفاق ملف امتحان (PDF أو صورة)"
              title="إرفاق ملف امتحان (PDF أو صورة)"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F7F3] text-[#0F8B78] transition hover:rotate-90 hover:bg-[#2DD4BF] hover:text-[#0F2A4A]"
            >
              <Plus size={21} strokeWidth={2.5} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  onSend();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={locked ? "اختر المادة أولاً، وبعدها اكتب سؤالك هنا..." : file ? "اضغط إرسال لتحليل الملف..." : "اكتب سؤالك هنا..."}
              disabled={!!file || locked}
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-1 py-3 text-[16px] font-bold leading-6 text-[#0F2A4A] outline-none placeholder:font-bold placeholder:text-slate-500 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={locked || sending || (!input.trim() && !file)}
              aria-label="إرسال"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F2A4A] to-[#0F8B78] text-white shadow-lg shadow-[#0F8B78]/30 transition hover:-translate-x-0.5 hover:scale-105 disabled:scale-100 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {sending ? <Loader2 size={19} className="animate-spin" /> : <ArrowLeft size={20} strokeWidth={2.5} />}
            </button>
          </form>
        </div>

        {/* غطاء شفاف: أي ضغطة على الحقل المقفول بترجّع الطالب للخطوة ١ */}
        {locked && (
          <button type="button" onClick={() => nudgeSubjects()} aria-label="اختر المادة أولاً" className="absolute inset-0 z-10 cursor-pointer rounded-[30px]" />
        )}
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2">
        {sessions.length > 0 && (
          <div className="relative">
            <button type="button" className={chipBase} style={chipStyle("#60A5FA", "#2563EB")} onClick={() => togglePop("history")}>
              <History size={15} strokeWidth={2.5} aria-hidden="true" />
              الأسئلة السابقة
            </button>
            {pop === "history" && (
              <div className={`${popBox} right-0 max-h-64 w-64 overflow-y-auto p-2`}>
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setPop(null); onViewSession(s.id); }}
                    className="block w-full truncate rounded-xl px-3 py-2 text-right text-[13px] font-bold text-slate-600 hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
                  >
                    {s.subject.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* تغيير المادة: بس لما في مادة مفتوحة (قبلها المواد معروضة بالشاشة) */}
        {active && (
          <div className="relative">
            <button type="button" title="تغيير المادة" className={chipBase} style={chipStyle("#2DD4BF", "#0F8B78")} onClick={() => togglePop("subject")}>
              <BookOpen size={15} strokeWidth={2.5} aria-hidden="true" />
              {active.subject.name}
              <ChevronDown size={14} strokeWidth={2.5} aria-hidden="true" />
            </button>
            {pop === "subject" && (
              <div className={`${popBox} left-1/2 w-72 -translate-x-1/2`}>
                <SubjectMenu
                  subjects={subjects}
                  loading={subjectsLoading}
                  activeSubjectId={active.subjectId}
                  onPick={(id) => { setPop(null); onPickSubject(id); }}
                  disabled={loadingSession}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section dir="rtl" className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white font-[Cairo,Tajawal,system-ui,sans-serif] shadow-sm ring-1 ring-slate-100 sm:rounded-[32px]">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 lg:hidden">
        <button type="button" onClick={onOpenMobileSidebar} aria-label="المواد والمحادثات" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7FAFC] text-slate-600">
          <ChevronRight size={20} />
        </button>
        <p className="flex-1 truncate text-[15px] font-black text-[#0F2A4A]">{active ? `مساعدك في مادة ${active.subject.name}` : "مسار التميز AI"}</p>
        {active?.isActive && <button type="button" onClick={onCloseActive} className="text-[13px] font-bold text-slate-500 hover:text-rose-600">إغلاق</button>}
      </header>

      {active?.isActive && (
        <div className="hidden items-center justify-between border-b border-slate-100 px-6 py-3 lg:flex">
          <div className="flex items-center gap-3">
            {activeSubjectIcon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F7F3] p-2">
                <SubjectIcon key={activeSubjectIcon} src={activeSubjectIcon} />
              </span>
            )}
            <div>
              <p className="text-[16px] font-black text-[#0F2A4A]">مساعدك في مادة {active.subject.name}</p>
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#0F8B78]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2DD4BF] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2DD4BF]" />
                </span>
                جاهز يجاوبك
              </p>
            </div>
          </div>
          <button type="button" onClick={onCloseActive} className="rounded-full px-3 py-1.5 text-[13px] font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600">
            إغلاق المحادثة
          </button>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden bg-[#F7FAFC]">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#2DD4BF]/20 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#A78BFA]/20 blur-3xl" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: "radial-gradient(rgba(15,42,74,.07) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />

        <div ref={scrollRef} className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden px-4 py-4 [scrollbar-width:thin] sm:px-8">
          {loadingSession ? (
            <div className="my-auto flex items-center justify-center"><Orb size={84} busy icon={20} /></div>
          ) : !active ? (
            /* الشاشة الترحيبية: ١ اختر المادة ← ٢ اكتب سؤالك (مقفول لحد ما تختار) */
            <div className="mx-auto my-auto grid w-full max-w-5xl items-center gap-x-10 gap-y-5 lg:grid-cols-[1fr_auto]">
              <Orbit tools={tools} activeTool={activeTool} onPick={pickTool} className="order-last lg:order-none" />

              <motion.div {...rise(0)} className="text-center lg:col-start-1 lg:row-start-1 lg:self-end lg:text-right">
                <h1 className="text-[24px] font-black leading-[1.5] text-[#0F2A4A] sm:text-[30px]">
                  مرحباً! أنا مساعد{" "}
                  <motion.span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(90deg,#6D4AFF,#2DD4BF,#6D4AFF)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text" }}
                    animate={reduce ? undefined : { backgroundPositionX: ["0%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    مسار التميز AI
                  </motion.span>
                  <br />
                  من أي مادة نبدأ اليوم؟
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-[16px] font-bold leading-8 text-[#334155] lg:mx-0">
                  اختر <Mark color="#2DD4BF">مادتك</Mark> أولاً، وبعدها اكتب <Mark color="#A78BFA">سؤالك</Mark> أو جرّب{" "}
                  <Mark color="#60A5FA">أداة من المدار</Mark>.
                </p>
              </motion.div>

              <motion.div {...rise(0.12)} ref={subjectsRef} className="w-full lg:col-start-1 lg:row-start-2">
                <StepHead n={1} state="current" title="اختر مادتك" hint="ابدأ من هون" hintClass="rounded-full bg-[#FBBF24]/25 px-2.5 py-0.5 font-black text-[#B45309]" />
                <motion.div key={nudge} animate={nudge && !reduce ? { x: [0, -10, 10, -7, 7, 0] } : undefined} transition={{ duration: 0.5 }}>
                  <SubjectChips subjects={subjects} loading={subjectsLoading} onPick={onPickSubject} disabled={loadingSession} />
                </motion.div>
              </motion.div>

              <motion.div {...rise(0.24)} className="w-full lg:col-start-1 lg:row-start-3">
                <StepHead n={2} state="locked" title="اكتب سؤالك" hint="بينفتح بعد اختيار المادة" hintClass="font-bold text-slate-400" />
                {composer}
              </motion.div>
            </div>
          ) : messages.length === 0 && !sending ? (
            /* مادة مفتوحة وما في رسائل: الخطوة ٢ + المدار + اقتراحات */
            <motion.div {...rise(0)} className="mx-auto my-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center">
              {active.isActive && (
                <div className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-[13px] font-black text-[#0F2A4A] shadow-sm ring-1 ring-slate-100">
                  <StepBadge n={1} state="done" />
                  {active.subject.name}
                  <span aria-hidden="true" className="h-px w-5 bg-slate-300" />
                  <StepBadge n={2} state="current" />
                  اكتب سؤالك
                </div>
              )}

              {active.isActive ? <Orbit tools={tools} activeTool={activeTool} onPick={pickTool} /> : <Orb size={92} />}
              <div>
                <h2 className="text-[22px] font-black text-[#0F2A4A]">جاهزين نبدأ في {active.subject.name}!</h2>
                {active.isActive && <p className="mt-1 text-[16px] font-bold leading-8 text-[#334155]">اكتب سؤالك، أو جرّب واحد من هدول:</p>}
              </div>
              {active.isActive && (
                <>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {SUGGESTIONS.map(({ id, text, icon: Icon, color, deep }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => applySuggestion(text)}
                        className="flex items-center gap-2 rounded-full border-2 bg-white px-3.5 py-2 text-[13px] font-black text-[#0F2A4A] transition hover:-translate-y-0.5"
                        style={{ borderColor: `${color}66`, boxShadow: `0 12px 22px -18px ${color}` }}
                      >
                        <Icon size={16} strokeWidth={2.5} style={{ color: deep }} aria-hidden="true" />
                        {text}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-[13px] font-black text-[#0F8B78]">
                    <ArrowDown size={15} strokeWidth={2.5} className="animate-bounce" aria-hidden="true" />
                    الحقل بانتظارك تحت
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
              {messages.map((m, i) => <MessageBubble key={m.id ?? `local-${i}`} message={m} subjectIcon={activeSubjectIcon} />)}
              {sending && (
                <div className="flex items-end gap-2.5">
                  <Orb size={36} busy icon={11} />
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <span className="text-[13px] font-bold text-slate-500">يفكّر</span>
                    {["#A78BFA", "#60A5FA", "#2DD4BF"].map((c, d) => (
                      <span key={c} className="h-2 w-2 animate-bounce rounded-full" style={{ background: c, animationDelay: `${d * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* الفوتر بس لما في مادة مفتوحة — بالشاشة الترحيبية الحقل موجود بالمنتصف */}
      {active && (
        <footer className="border-t border-slate-100 bg-white px-3 py-3 sm:px-6">
          {error && (
            <p role="alert" className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-600">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {active.isActive ? (
            <div className="mx-auto max-w-3xl">{composer}</div>
          ) : (
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-[#F7FAFC] p-3 text-[15px] font-bold text-slate-600">
              هذه المحادثة مغلقة
              <button type="button" onClick={() => onPickSubject(active.subjectId)} className="rounded-full bg-[#0F2A4A] px-4 py-2 text-[13px] font-black text-white transition hover:bg-[#0F8B78]">
                محادثة جديدة
              </button>
            </div>
          )}
        </footer>
      )}
    </section>
  );
}