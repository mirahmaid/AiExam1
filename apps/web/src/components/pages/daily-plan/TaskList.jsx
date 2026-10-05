import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, Bot, ChevronLeft, Clock3, ListChecks, Plus, RotateCcw, Trash2 } from "lucide-react";
import TaskCheck from "./TaskCheck";

const KINDS = {
  quiz: { Icon: ListChecks, tone: "from-[#E8F7F3] to-[#C5E7DE] text-[#0F8B78]" },
  ai: { Icon: Bot, tone: "from-violet-50 to-violet-100 text-violet-500" },
  read: { Icon: BookOpen, tone: "from-amber-50 to-amber-100 text-amber-500" },
  review: { Icon: RotateCcw, tone: "from-rose-50 to-rose-100 text-rose-500" },
};

const SUGGESTIONS = ["حل ورقة عمل", "راجع ملخص الدرس", "احفظ القوانين"];

export default function TaskList({
  tasks,
  custom,
  isDone,
  isLoading,
  completed,
  total,
  percent,
  onToggle,
  onToggleCustom,
  onRemoveCustom,
  onAdd,
}) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (onAdd(text)) setText("");
  }

  return (
    <section className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F2A4A] text-white">
            <ListChecks size={17} aria-hidden="true" />
          </span>
          <h2 className="text-[18px] font-black text-[#0F2A4A]">مهام اليوم</h2>
        </div>
        <span className="rounded-full bg-[#E8F7F3] px-3 py-1 text-[12px] font-black text-[#0F8B78]">
          {completed}/{total} مكتملة
        </span>
      </div>

      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-[#2DD4BF] to-[#0F8B78]"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-[22px] bg-[#F7FAFC]" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence>
            {tasks.map((t, i) => (
              <TaskRow key={t.id} task={t} index={i} done={isDone(t)} onToggle={() => onToggle(t.id)} reduce={reduce} />
            ))}
            {custom.map((c) => (
              <CustomRow
                key={c.id}
                item={c}
                onToggle={() => onToggleCustom(c.id)}
                onRemove={() => onRemoveCustom(c.id)}
                reduce={reduce}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <form onSubmit={submit} className="mt-5">
        <div className="flex gap-2 rounded-full bg-[#F7FAFC] p-1.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-[#0F8B78]/40 focus-within:shadow-[0_12px_30px_-16px_rgba(15,139,120,.6)]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={120}
            placeholder="أضف مهمة خاصة بك..."
            aria-label="مهمة جديدة"
            className="min-w-0 flex-1 bg-transparent px-4 text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-400"
          />
          <motion.button
            type="submit"
            disabled={!text.trim()}
            aria-label="إضافة مهمة"
            whileHover={reduce ? undefined : { rotate: 90 }}
            whileTap={{ scale: 0.88 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F8B78] text-white shadow-md shadow-[#0F8B78]/25 transition-colors hover:bg-[#0F2A4A] disabled:opacity-40"
          >
            <Plus size={20} aria-hidden="true" />
          </motion.button>
        </div>

        {custom.length === 0 && !isLoading && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">اقتراحات سريعة:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-full bg-[#F7FAFC] px-3 py-1.5 text-[12px] font-black text-slate-500 transition hover:-translate-y-0.5 hover:bg-[#E8F7F3] hover:text-[#0F8B78]"
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}

function TaskRow({ task, index, done, onToggle, reduce }) {
  const { Icon, tone } = KINDS[task.kind] ?? KINDS.quiz;

  return (
    <motion.li
      layout
      initial={reduce ? false : { opacity: 0, x: 28 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { delay: reduce ? 0 : index * 0.06, type: "spring", stiffness: 240, damping: 22 },
      }}
      exit={{ opacity: 0, x: -40 }}
      whileHover={reduce || done ? undefined : { y: -3 }}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-[22px] border-2 p-3.5 transition-colors sm:gap-4 ${
        done
          ? "border-transparent bg-[#E8F7F3]/70"
          : "border-transparent bg-[#F7FAFC] hover:border-[#BFE8DD] hover:bg-white hover:shadow-[0_18px_35px_-24px_rgba(15,42,74,.45)]"
      }`}
    >
      {/* لمعة تمرّ عند الـ hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />

      <TaskCheck done={done} onToggle={onToggle} label={done ? "إلغاء الإكمال" : "تعليم كمكتملة"} />

      <span
        className={`relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105 sm:flex ${
          done ? "from-slate-100 to-slate-100 text-slate-400" : tone
        }`}
      >
        <Icon size={19} aria-hidden="true" />
      </span>

      <div className="relative min-w-0 flex-1">
        <p className={`text-[14px] font-black leading-6 transition-colors ${done ? "text-slate-400 line-through" : "text-[#0F2A4A]"}`}>
          {task.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] font-bold text-slate-400">
          <span>{task.hint}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={11} aria-hidden="true" />
            {task.minutes} دقيقة
          </span>
        </p>
      </div>

      {task.href && !done && (
        <Link
          to={task.href}
          className="relative flex shrink-0 items-center gap-1 rounded-full bg-[#0F2A4A] px-4 py-2 text-[13px] font-black text-white transition hover:bg-[#0F8B78]"
        >
          ابدأ
          <ChevronLeft size={14} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
        </Link>
      )}
    </motion.li>
  );
}

function CustomRow({ item, onToggle, onRemove, reduce }) {
  return (
    <motion.li
      layout
      initial={reduce ? false : { opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group flex items-center gap-3 rounded-[22px] border-2 border-dashed p-3.5 transition-colors sm:gap-4 ${
        item.done ? "border-[#BFE8DD] bg-[#E8F7F3]/60" : "border-slate-200 bg-white hover:border-[#0F8B78]/40"
      }`}
    >
      <TaskCheck done={item.done} onToggle={onToggle} label={item.done ? "إلغاء الإكمال" : "تعليم كمكتملة"} />
      <p className={`flex-1 text-[14px] font-black ${item.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.text}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label="حذف المهمة"
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </motion.li>
  );
}