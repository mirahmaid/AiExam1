// AIAssistantSection.jsx — الملف الرئيسي (state + API calls فقط، والعرض مفوّض للـSidebar/ChatArea)
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../ui/ToastProvider";
import { useSubjects } from "../home/components/Subjects/useSubjects";
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

export default function AIAssistantSection() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const subjectId = params.get("subject");
    if (subjectId && !openedFromParam.current) {
      openedFromParam.current = true;
      openSession(subjectId);
    }
  }, [params, openSession]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text) {
    if (sending) return;
    if (!active) {
      showToast({ type: "info", message: "اختاري مادة أولاً من زر \"اختيار المادة\"" });
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
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-7xl gap-0 px-0 sm:px-4 lg:h-[calc(100dvh-5rem)] lg:gap-4 lg:px-8 lg:py-4">
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
      />

      {/* السايدبار (شمال بالـRTL) — قابل للطي بالديسكتوب */}
      <aside
        className={`hidden shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 ease-in-out lg:block ${
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
        className={`fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق"
          className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500"
        >
          <X size={18} />
        </button>
        <Sidebar {...sidebarProps} />
      </aside>
    </div>
  );
}