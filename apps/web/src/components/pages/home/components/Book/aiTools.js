import { Brain, FileText, Lightbulb, MessageCircleQuestion, Pencil, Target } from "lucide-react";

// demo(b): مثال محادثة قصير بيظهر للطالب قبل ما يبدأ (b = اسم الكتاب)
export const AI_TOOLS = [
  {
    id: "test",
    title: "اختبرني",
    chip: "اختبرني",
    description: "أنشئ اختبارًا يناسب المادة والمستوى الذي تريد التدرب عليه.",
    icon: Brain,
    color: "#2DD4BF",
    deep: "#0F8B78",
    demo: (b) => ({
      you: `اختبرني من ${b}`,
      ai: "تمام! جهّزت لك ١٠ أسئلة من السهل للصعب. جاهزين نبدأ؟",
    }),
  },
  {
    id: "summary",
    title: "لخّص الدرس",
    chip: "لخّص",
    description: "حوّل الدرس الطويل إلى أفكار مرتبة وسهلة للمراجعة.",
    icon: FileText,
    color: "#60A5FA",
    deep: "#2F6FDB",
    demo: (b) => ({
      you: `لخّصلي آخر درس في ${b}`,
      ai: "تم! لخّصته بـ ٥ نقاط رئيسية، وأضفت لك أهم القوانين للحفظ.",
    }),
  },
  {
    id: "ask",
    title: "اسألني",
    chip: "اسألني",
    description: "اكتب سؤالك بالطريقة التي تناسبك واحصل على شرح واضح.",
    icon: MessageCircleQuestion,
    color: "#A78BFA",
    deep: "#6D4AFF",
    demo: (b) => ({
      you: "ما فهمت هاي الفكرة، ممكن تشرحها؟",
      ai: `أكيد! بشرحها بمثال بسيط من ${b}، وبعدها بسألك سؤال صغير نتأكد.`,
    }),
  },
  {
    id: "solve",
    title: "حل معي",
    chip: "حل معي",
    description: "لا أعطيك الإجابة فقط؛ أمشي معك حتى تفهم طريقة الحل.",
    icon: Lightbulb,
    color: "#FBBF24",
    deep: "#B77900",
    demo: () => ({
      you: "هاي المسألة محيّرتني، من وين أبدأ؟",
      ai: "ولا يهمك! شو أول شي بتلاحظه فيها؟ خلّينا نمشي خطوة خطوة.",
    }),
  },
  {
    id: "weakness",
    title: "راجع نقاط ضعفي",
    chip: "نقاط ضعفي",
    description: "اكتشف المواضيع التي تحتاج تركيزًا أكبر بناءً على أدائك.",
    icon: Target,
    color: "#FB7185",
    deep: "#BE3B55",
    demo: () => ({
      you: "وين نقاط ضعفي؟",
      ai: "حسب آخر كويزاتك، في ٣ مواضيع بدها تركيز. بنبدأ بأصعبها؟",
    }),
  },
  {
    id: "plan",
    title: "أنشئ خطتي",
    chip: "خطتي",
    description: "ابنِ خطة دراسة قابلة للتعديل حسب وقتك وأهدافك.",
    icon: Pencil,
    color: "#C4B5FD",
    deep: "#7C5CE6",
    demo: () => ({
      you: "عندي امتحان بعد ١٤ يوم",
      ai: "جهّزت لك خطة ١٤ يوم، ساعة ونص كل يوم. بتحب نعدّلها؟",
    }),
  },
];