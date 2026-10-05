// AIAssistantPage.jsx — الملف الرئيسي (state + API calls فقط، والعرض مفوّض للـSidebar/ChatArea)
// مكانه: src/components/pages/ai-path/AIAssistantPage.jsx  (App.jsx بيستورده لراوت /ai-path)
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";

import AppShell from "@/components/layout/AppShell";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../ui/ToastProvider";
import { useSubjects } from "../home/components/Subjects/useSubjects";
import { AI_TOOLS } from "../home/components/Book/aiTools";
import {
  closeChatSession,
  createChatSession,
  describeError,
  getChatSession,
  listChatSessions,
  sendChatMessage,
  uploadChatFile,
} from "./chatApi";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function AIAssistantPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation(); // AiStudyLab بيبعت { tool, subjectId, subjectTitle }
  const { showToast } = useToast();
  const { selectedBranch } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useSubjects(selectedBranch?.id);

  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [activeTool, setActiveTool] = useState(location.state?.tool ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // درج الموبايل
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // طي السايدبار بالديسكتوب

  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const openedFromParam = useRef(false);

  const refreshSessions = useCallback(async () => {
    try {
      setSessions(await listChatSessions());
    } catch {
      // القائمة الجانبية ليست حرجة
    }
  }, []);

  const openSession = useCallback(
    async (subjectId) => {
      setLoadingSession(true);
      setError("");
      setSidebarOpen(false);
      try {
        const created = await createChatSession(subjectId);
        const full = await getChatSession(created.id);
        setActive(full);
        setMessages(full.messages ?? []);
        setParams({ subject: subjectId }, { replace: true });
        refreshSessions();
      } catch (err) {
        showToast({ type: "error", message: describeError(err) });
      } finally {
        setLoadingSession(false);
      }
    },
    [refreshSessions, setParams, showToast]
  );

  async function viewSession(id) {
    setLoadingSession(true);
    setError("");
    setSidebarOpen(false);
    try {
      const full = await getChatSession(id);
      setActive(full);
      setMessages(full.messages ?? []);
      if (full.isActive) setParams({ subject: full.subjectId }, { replace: true });
      else setParams({}, { replace: true });
    } catch (err) {
      showToast({ type: "error", message: describeError(err) });
    } finally {
      setLoadingSession(false);
    }
  }

  useEffect(() => { refreshSessions(); }, [refreshSessions]);

  // فتح مادة تلقائياً: إما جاية من AiStudyLab (location.state) أو من ?subject=
  useEffect(() => {
    if (openedFromParam.current) return;
    const state = location.state;
    const subjectId = state?.subjectId ?? params.get("subject");
    if (!subjectId) return;
    openedFromParam.current = true;
    openSession(subjectId).then(() => {
      const tool = AI_TOOLS.find((t) => t.id === state?.tool);
      if (tool) setInput(tool.demo(`كتاب ${state?.subjectTitle ?? ""}`.trim()).you);
    });
  }, [params, location.state, openSession]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text) {
    if (sending) return;
    if (!active) {
      showToast({ type: "info", message: "اختر مادة أولاً من المدار أو من زر \"اختيار المادة\"" });
      return;
    }
    const content = (text ?? input).trim();
    if (!content && !file) return;

    setError("");
    setSending(true);
    const pendingFile = file;
    setInput("");
    setFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "";

    const optimistic = pendingFile
      ? { role: "STUDENT", type: "FILE_UPLOAD", content: pendingFile.name, fileMimeType: pendingFile.type }
      : { role: "STUDENT", type: "TEXT", content };
    setMessages((m) => [...m, optimistic]);

    try {
      const reply = pendingFile
        ? await uploadChatFile(active.id, pendingFile)
        : await sendChatMessage(active.id, content);
      setMessages((m) => [...m, { ...reply, createdAt: new Date().toISOString() }]);
      refreshSessions();
    } catch (err) {
      setError(describeError(err));
      setMessages((m) => m.slice(0, -1));
      if (!pendingFile) setInput(content);
    } finally {
      setSending(false);
    }
  }

  async function closeActive() {
    if (!active) return;
    try {
      await closeChatSession(active.id);
      showToast({ type: "success", message: "تم إغلاق المحادثة وحفظ رسائلها" });
      setActive(null);
      setMessages([]);
      setParams({}, { replace: true });
      refreshSessions();
    } catch (err) {
      showToast({ type: "error", message: describeError(err) });
    }
  }

  const activeSubjectIcon = subjects.find((s) => s.id === active?.subjectId)?.icon;

  const sidebarProps = {
    subjects, subjectsLoading,
    activeSubjectId: active?.subjectId,
    onPickSubject: openSession,
    loadingSession,
    sessions,
    activeSessionId: active?.id,
    onViewSession: viewSession,
  };

  return (
    <AppShell>
    {/* الارتفاع: غيّر 6rem/7.5rem حسب طول الهيدر عندك */}
    {/* عرض 1280px متوسّط حتى لو الـAppShell أضيق (margin-inline-start بيشتغل مع RTL و LTR) */}
    {/* الارتفاع: غيّر 8rem/8.5rem حسب الهيدر + padding الـAppShell عندك */}
    <div
      dir="rtl"
      style={{ width: "min(1280px, 96vw)", marginInlineStart: "calc(50% - min(1280px, 96vw) / 2)" }}
      className="flex h-[calc(100dvh-8rem)] min-h-[440px] gap-0 lg:h-[calc(100dvh-8.5rem)] lg:gap-4"
    >
      {/* المحادثة (يمين بالـRTL، أول عنصر بالـDOM) */}
      <ChatArea
        active={active}
        messages={messages}
        sending={sending}
        error={error}
        loadingSession={loadingSession}
        input={input}
        setInput={setInput}
        file={file}
        setFile={setFile}
        onSend={() => send()}
        onCloseActive={closeActive}
        onOpenMobileSidebar={() => setSidebarOpen(true)}
        subjects={subjects}
        subjectsLoading={subjectsLoading}
        onPickSubject={openSession}
        sessions={sessions}
        onViewSession={viewSession}
        activeSubjectIcon={activeSubjectIcon}
        scrollRef={scrollRef}
        fileRef={fileRef}
        textareaRef={textareaRef}
        showToast={showToast}
        tools={AI_TOOLS}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />

      {/* السايدبار (شمال بالـRTL) — قابل للطي بالديسكتوب */}
      <aside
        className={`hidden shrink-0 overflow-hidden rounded-[32px] bg-[#0F2A4A] shadow-sm transition-all duration-300 ease-in-out lg:block ${
          sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "lg:w-72 lg:opacity-100"
        }`}
      >
        <div className="h-full w-72">
          <Sidebar {...sidebarProps} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} />
        </div>
      </aside>

      {/* درج الموبايل */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-[#0F2A4A] shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق"
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <X size={18} />
        </button>
        <Sidebar {...sidebarProps} />
      </aside>
    </div>
    </AppShell>
  );
}