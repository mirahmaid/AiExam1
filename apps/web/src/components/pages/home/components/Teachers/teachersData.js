// أسماء التراكات الأربعة عندك بالكود
export const TRACK_LABELS = {
  scientific: "علمي",
  literary: "أدبي",
  sharia: "شرعي",
  entrepreneurship: "ريادة أعمال",
};

// معرّفات الفروع الحقيقية كما هي مخزنة بقاعدة البيانات (GET /api/v1/branches)
// ⚠️ لو حدا حذف هاي الفروع وعمل seed جديد بمعرّفات مختلفة، لازم تحدّث هاي القيم
export const BRANCH_IDS = {
  SCIENTIFIC: "cmucyxxtv0000w54owhg7x4ps", // الفرع العلمي
  LITERARY: "cmucyxxxh000fw54oga97hl9s",   // الفرع الأدبي
  SHARIA: "cmucyxy100015w54otk25jzq2",     // الفرع الشرعي
  LEADERSHIP: "cmucyxxz9000sw54oakenocsq", // فرع "صناعي" بالباك اند (تأكدي من التسمية مع الفريق)
};