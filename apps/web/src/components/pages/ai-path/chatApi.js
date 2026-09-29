const API_URL = import.meta.env.VITE_API_URL;

async function parseErrorMessage(res) {
  try {
    const data = await res.json();
    return data.message || `حدث خطأ (status ${res.status})`;
  } catch {
    return `حدث خطأ (status ${res.status})`;
  }
}

// إنشاء جلسة محادثة جديدة لمادة معينة (أو إرجاع الجلسة النشطة لو موجودة)
export async function createChatSession(subjectId) {
  const res = await fetch(`${API_URL}/api/v1/chat/sessions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId }),
  });

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// جلب كل الجلسات (للقائمة الجانبية)
export async function listChatSessions() {
  const res = await fetch(`${API_URL}/api/v1/chat/sessions`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// جلب جلسة واحدة مع كل الرسائل
export async function getChatSession(id) {
  const res = await fetch(`${API_URL}/api/v1/chat/sessions/${id}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// إغلاق/أرشفة جلسة
export async function closeChatSession(id) {
  const res = await fetch(`${API_URL}/api/v1/chat/sessions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// إرسال رسالة نصية بجلسة محادثة
export async function sendChatMessage(sessionId, message) {
  const res = await fetch(
    `${API_URL}/api/v1/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// رفع ملف (PDF/صورة) بجلسة محادثة
export async function uploadChatFile(sessionId, file) {
  const formData = new FormData();
  formData.append("file", file);

  // ملاحظة: ما بنحط Content-Type يدوي هون — المتصفح بيحطه
  // تلقائياً مع الـ boundary الصحيح لما يكون الجسم FormData
  const res = await fetch(
    `${API_URL}/api/v1/chat/sessions/${sessionId}/upload`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json();
}

// دالة مساعدة لعرض رسالة خطأ موحّدة بالواجهة
export function describeError(err) {
  return err?.message || "حدث خطأ غير متوقع، حاول مرة أخرى";
}