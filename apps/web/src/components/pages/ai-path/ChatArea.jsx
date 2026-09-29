// ChatArea.jsx — منطقة المحادثة: الرسائل + شاشة الترحيب + الـcomposer بأسفل (متل الفيجما)
import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import SubjectMenu from "./SubjectMenu";

// ⚠️ أضفت أيقونة ولون لكل اقتراح متل ما هو بالفيجما (4 دوائر ملوّنة)
const WELCOME_SUGGESTIONS = [
  { id: "math", text: "كيف أحل مسألة رياضيات بدقة؟", icon: Calculator, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { id: "exam", text: "كيف أبدأ مراجعة ليلة الامتحان؟", icon: ClipboardCheck, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { id: "summary", text: "لخص لي أهم نقاط هذا الدرس", icon: FileText, iconBg: "bg-rose-50", iconColor: "text-rose-500" },
  { id: "anxiety", text: "كيف أتعامل مع قلق الامتحانات؟", icon: Heart, iconBg: "bg-pink-50", iconColor: "text-pink-500" },
];

const ACCEPTED_FILES = "application/pdf,image/png,image/jpeg,image/webp,image/gif";

export default function ChatArea({
  active,
  messages,
  sending,
  error,
  loadingSession,
  input,
  setInput,
  file,
  setFile,
  onSend,
  onCloseActive,
  onOpenMobileSidebar,
  subjects,
  subjectsLoading,
  onPickSubject,
  sessions,
  onViewSession,
  activeSubjectIcon,
  scrollRef,
  fileRef,
  textareaRef,
  showToast,
}) {
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f && f.size > 15 * 1024 * 1024) {
      showToast({ type: "error", message: "حجم الملف يجب ألا يتجاوز 15 ميجابايت" });
    } else if (f) {
      setFile(f);
    }
    e.target.value = "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSend();
  }

  const composer = (
    <div>
      {file && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-[#002C5A]/[0.05] px-3 py-2 text-xs text-[#002C5A]">
          <FileText size={15} />
          <span className="max-w-[200px] truncate">{file.name}</span>
          <button type="button" onClick={() => setFile(null)} aria-label="إزالة الملف" className="text-slate-400 hover:text-rose-500">
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-1.5 transition-all focus-within:border-[#12897A] focus-within:ring-4 focus-within:ring-[#12897A]/10"
      >
        <input ref={fileRef} type="file" accept={ACCEPTED_FILES} className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="إرفاق ملف امتحان (PDF أو صورة)"
          title="إرفاق ملف امتحان (PDF أو صورة)"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#002C5A]"
        >
          <Plus size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={file ? "اضغط إرسال لتحليل الملف..." : "اكتب سؤالك للمساعد الذكي هنا..."}
          disabled={!!file}
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={sending || (!input.trim() && !file)}
          aria-label="إرسال"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002C5A] text-white transition-all hover:bg-[#12897A] disabled:bg-slate-200 disabled:text-slate-400"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowLeft size={19} />}
        </button>
      </form>

      {/* ثلاث شرائح تحت الـinput متل الفيجما: الأسئلة السابقة / اختبرني / اختيار المادة */}
      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2">
        {sessions.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setHistoryPopoverOpen((v) => !v); setSubjectPopoverOpen(false); }}
              className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-[#12897A]/40 hover:text-[#12897A]"
            >
              الأسئلة السابقة
            </button>
            {historyPopoverOpen && (
              <div className="absolute bottom-full right-0 z-10 mb-2 max-h-64 w-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-lg">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setHistoryPopoverOpen(false); onViewSession(s.id); }}
                    className="block w-full truncate rounded-xl px-3 py-2 text-right text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {s.subject.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ⚠️ ماكو حالياً endpoint لبدء اختبار من الشات — حطيتها متل باقي الـplaceholders بالسايدبار */}
        <button
          type="button"
          onClick={() => showToast({ type: "info", message: "ميزة الاختبار داخل المحادثة قريباً" })}
          className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-[#12897A]/40 hover:text-[#12897A]"
        >
          اختبرني
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setSubjectPopoverOpen((v) => !v); setHistoryPopoverOpen(false); }}
            className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-[#12897A]/40 hover:text-[#12897A]"
          >
            اختيار المادة
          </button>
          {subjectPopoverOpen && (
            <div className="absolute bottom-full left-1/2 z-10 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-slate-100 bg-white shadow-lg">
              <SubjectMenu
                subjects={subjects}
                loading={subjectsLoading}
                activeSubjectId={active?.subjectId}
                onPick={(id) => { setSubjectPopoverOpen(false); onPickSubject(id); }}
                disabled={loadingSession}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-sm ring-1 ring-slate-100 sm:rounded-3xl">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="المواد والمحادثات"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600"
        >
          <ChevronRight size={20} />
        </button>
        <p className="flex-1 truncate text-sm font-bold text-[#002C5A]">
          {active ? `مساعدك في مادة ${active.subject.name}` : "مسار التميز AI"}
        </p>
        {active?.isActive && (
          <button type="button" onClick={onCloseActive} className="text-xs font-medium text-slate-400 hover:text-rose-600">
            إغلاق
          </button>
        )}
      </header>

      {active?.isActive && (
        <div className="hidden items-center justify-between border-b border-slate-100 px-6 py-3 lg:flex">
          <p className="text-sm font-bold text-[#002C5A]">مساعدك في مادة {active.subject.name}</p>
          <button
            type="button"
            onClick={onCloseActive}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            إغلاق المحادثة
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#F7FAFC] px-4 py-6 sm:px-8">
        {loadingSession ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-[#12897A]" size={28} />
          </div>
        ) : !active ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <h1 className="text-xl font-bold text-[#002C5A] sm:text-3xl -mt-10">
              مرحباً! أنا مساعد{" "}
              <span className="text-[#22B573]">مسار التميز AI</span>.
              <br />
              كيف يمكنني مساعدتك اليوم؟
            </h1>
            <p className="mt-3 text-base font-medium leading-7 text-[#345B7F] whitespace-nowrap">
              مساعدك الذكي لإجابة الأسئلة الدراسية، شرح المسائل، وتلخيص الدروس
            </p>
            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              {WELCOME_SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSubjectPopoverOpen(true); showToast({ type: "info", message: "اختاري مادة أولاً للبدء" }); }}
                    className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-[#00D4FF0D] px-4 py-3 text-right text-xs font-semibold text-slate-600 transition-all hover:border-[#12897A]/40 hover:text-[#12897A]"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.iconBg} ${s.iconColor}`}>
                      <Icon size={16} />
                    </span>
                    <span>{s.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m, i) => (
              <MessageBubble key={m.id ?? `local-${i}`} message={m} subjectIcon={activeSubjectIcon} />
            ))}
            {sending && (
              <div className="flex items-end gap-2.5">
                <BotAvatar />
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-[#12897A]" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
        {error && (
          <p role="alert" className="mx-auto mb-3 flex max-w-3xl items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {active && !active.isActive ? (
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
            هذه المحادثة مغلقة
            <button
              type="button"
              onClick={() => onPickSubject(active.subjectId)}
              className="rounded-full bg-[#002C5A] px-4 py-2 text-xs font-semibold text-white"
            >
              محادثة جديدة
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">{composer}</div>
        )}
      </footer>
    </section>
  );
}

function BotAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#002C5A] to-[#12897A] text-white">
      <Bot size={16} />
    </span>
  );
}

function RichText({ text }) {
  return (
    <div dir="auto" className="whitespace-pre-wrap break-words text-sm leading-7">
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold text-[#002C5A]">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}

function MessageBubble({ message, subjectIcon }) {
  const isStudent = message.role === "STUDENT";
  const questions = message.metadata?.questions;
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })
    : "";

  if (isStudent) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#002C5A] px-4 py-2.5 text-white shadow-md shadow-[#002C5A]/15 sm:max-w-[75%]">
          {message.type === "FILE_UPLOAD" ? (
            <p className="flex items-center gap-2 text-sm"><FileText size={16} />{message.content}</p>
          ) : (
            <p dir="auto" className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</p>
          )}
          {time && <p className="mt-1 text-left text-[10px] text-white/50">{time}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-end gap-2.5">
      <div className={`max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ring-1 sm:max-w-[80%] ${
        message.type === "ERROR" ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-white text-slate-700 ring-slate-100"
      }`}>
        {questions?.length ? (
          <div>
            <div className="mb-3 flex items-center gap-3">
              {subjectIcon && (
                <span className="relative h-9 w-9 shrink-0 rounded-xl bg-[#E8F7F3] p-1.5">
                  <img src={subjectIcon} alt="" className="h-full w-full object-contain" />
                </span>
              )}
              <div>
                <p className="font-bold text-[#002C5A]">جهّزت لك {questions.length} أسئلة تدريبية</p>
                <p className="text-xs text-slate-400">هنا نص الأسئلة اللي جهزها المساعد</p>
              </div>
            </div>
            <ol className="mb-4 flex flex-col gap-2">
              {questions.slice(0, 3).map((q, i) => (
                <li key={q.id ?? i} className="line-clamp-2 rounded-xl bg-[#00D4FF0D] px-3 py-2 text-xs leading-6 text-slate-600" dir="auto">
                  <b className="text-[#002C5A]">{i + 1}.</b> {q.questionText}
                </li>
              ))}
              {questions.length > 3 && <li className="text-center text-xs text-slate-400">+ {questions.length - 3} أسئلة أخرى</li>}
            </ol>
          </div>
        ) : (
          <RichText text={message.content} />
        )}
        {time && <p className="mt-1 text-[10px] text-slate-400">{time}</p>}
      </div>
      <BotAvatar />
    </div>
  );
}