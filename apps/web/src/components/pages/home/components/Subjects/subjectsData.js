export const BRANCH_IDS = {
  SCIENTIFIC: "cmucyxxtv0000w54owhg7x4ps", // الفرع العلمي
  LITERARY: "cmucyxxxh000fw54oga97hl9s",   // الفرع الأدبي
  SHARIA: "cmucyxy100015w54otk25jzq2",     // الفرع الشرعي
  LEADERSHIP: "cmucyxxz9000sw54oakenocsq", // فرع "صناعي" بالباك اند (تأكدي من التسمية مع الفريق)
};

export const subjectsByBranch = {
  [BRANCH_IDS.SCIENTIFIC]: [
    {
      id: "biology",
      title: "الأحياء",
      description:
        "العلم الذي يدرس الكائنات الحية والخلايا وأدق التفاصيل إلى أعقد الأنظمة الحيوية",
      icon: "/Subject/biology.png",
    },
    {
      id: "math-sci",
      title: "الرياضيات",
      description:
        "لغة الكون والمنطق؛ العلم الذي يدرس الأرقام والأشكال والأنماط لتفسير العالم وحل المشكلات من حولنا",
      icon: "/Subject/math.png",
    },
    {
      id: "islamic-sci",
      title: "التربية الإسلامية",
      description:
        "منهج الحياة القويم؛ التي تبني الأخلاق الفاضلة، وتعمّق الفهم للأحكام والقيم الإسلامية لنفع الفرد والمجتمع",
      icon: "/Subject/quran.png",
    },
    {
      id: "english-sci",
      title: "لغة إنجليزية",
      description:
        "جسر التواصل العالمي؛ الأداة التي تفتح لك أبواب المعرفة والعلوم والثقافات المختلفة حول العالم",
      icon: "/Subject/english.png",
    },
    {
      id: "arabic-sci",
      title: "اللغة العربية",
      description:
        "لغة الضاد؛ الفن الذي يجمع بين جمال البيان، وبلاغة التعبير، وثراء المفردات للتواصل والتعبير عن الفكر",
      icon: "/Subject/arabic.png",
    },
    {
      id: "chemistry-sci",
      title: " الكيمياء",
      description: " العلم الذي يدرس المادة وتغيراتها؛ وكيف تتفاعل العناصر والجزيئات ونستخدمها في حياتنا اليومية",
      icon: "/Subject/chemistry.png",
    },
    {
      id: "technology-sci",
      title: "تكنولوجيا",
      description:
        " العلم الذي يحول الأفكار والبيانات إلى أدوات وحلول برمجية تجعل حياتنا أسهل وأكثر كفاءة",
      icon: "/Subject/technology.png",
    },
    {
      id: "physics-sci",
      title: "الفيزياء ",
      description:
        " العلم الذي يشرح كيف يعمل الكون؛ من حركة أصغر الذرات إلى تفاعل أكبر المجرات",
      icon: "/Subject/physics.png",
    },
  ],
  [BRANCH_IDS.LITERARY]: [
    {
      id: "history",
      title: "التاريخ",
      description: "رحلة عبر الزمن لفهم الحضارات والأحداث التي شكّلت واقعنا اليوم",
      icon: "/Subject/chemistry.png",
    },
    {
      id: "geography",
      title: "الجغرافيا",
      description: "استكشاف الأرض وتضاريسها وعلاقة الإنسان بالمكان من حوله",
      icon: "/Subject/chemistry.png",
    },
    {
      id: "arabic-lit",
      title: "اللغة العربية",
      description: "تعمّق أكبر في الأدب والبلاغة والنصوص العربية الأصيلة",
      icon: "/Subject/arabic.png",
    },
    {
      id: "english-lit",
      title: "لغة إنجليزية",
      description: "مهارات لغوية متقدمة للتواصل العالمي والقراءة النقدية",
      icon: "/Subject/english.png",
    },
    {
      id: "islamic-lit",
      title: "التربية الإسلامية",
      description: "ترسيخ القيم والأخلاق الإسلامية في الحياة اليومية",
      icon: "/Subject/quran.png",
    },
  ],
  [BRANCH_IDS.SHARIA]: [
    {
      id: "fiqh",
      title: "الفقه",
      description: "دراسة الأحكام الشرعية العملية المستنبطة من الأدلة التفصيلية",
      icon: "/Subject/quran.png",
    },
    {
      id: "tafsir",
      title: "التفسير",
      description: "فهم معاني القرآن الكريم وأسباب النزول والدلالات الشرعية",
      icon: "/Subject/quran.png",
    },
    {
      id: "hadith",
      title: "الحديث الشريف",
      description: "دراسة السنة النبوية ومصادرها وطرق التوثيق والاستدلال بها",
      icon: "/Subject/quran2.png",
    },
    {
      id: "arabic-sharia",
      title: "اللغة العربية",
      description: "إتقان أدوات اللغة اللازمة لفهم النصوص الشرعية بدقة",
      icon: "/Subject/arabic.png",
    },
    {
      id: "aqidah",
      title: "العقيدة",
      description: "ترسيخ أصول الإيمان وفق منهج أهل السنة والجماعة",
      icon: "/Subject/quran2.png",
    },
  ],
  [BRANCH_IDS.LEADERSHIP]: [
    {
      id: "business",
      title: "ريادة الأعمال",
      description: "أساسيات بناء المشاريع وتحويل الأفكار إلى فرص اقتصادية ناجحة",
      icon: "/Subject/technology.png",
    },
    {
      id: "economics",
      title: "الاقتصاد",
      description: "فهم الأسواق والموارد وكيفية اتخاذ القرارات المالية الرشيدة",
      icon: "/Subject/finincial.png",
    },
    {
      id: "math-lead",
      title: "الرياضيات",
      description: "أدوات كمية أساسية لتحليل البيانات ودعم القرار الريادي",
      icon: "/Subject/math.png",
    },
    {
      id: "english-lead",
      title: "لغة إنجليزية",
      description: "لغة الأعمال العالمية للتواصل مع الأسواق والشركاء الدوليين",
      icon: "/Subject/english.png",
    },
    {
      id: "islamic-lead",
      title: "التربية الإسلامية",
      description: "قيم النزاهة والأمانة كأساس لريادة أعمال مسؤولة وأخلاقية",
      icon: "/Subject/quran.png",
    },
  ],
};

export const defaultSubjects = subjectsByBranch[BRANCH_IDS.SCIENTIFIC];