import { useEffect, useState } from "react";
import { getTeachers } from "./teachersApi";
import { TRACK_LABELS } from "./teachersData";
import TeacherCard from "./TeacherCard";

export default function TeachersSection({ track, title, description }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTeachers() {
      setIsLoading(true);
      setErrorOccurred(false);
      try {
        const data = await getTeachers({ track });
        if (isMounted) setTeachers(data);
      } catch (error) {
        console.error("Error loading teachers:", error);
        if (isMounted) setErrorOccurred(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, [track]);

  const sectionTitle =
    title ?? (track ? `معلمو قسم ${TRACK_LABELS[track]}` : "نخبة المعلمين");

  const sectionDescription =
    description ?? "نخبة المعلمين المتخصصين لمرافقتك في رحلتك التعليمية";

  return (
    <section dir="rtl" className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      <div className="mb-8 md:mb-14 text-center">
        <h2 className="text-3xl font-bold text-[#002C5A] transition-all duration-400 group-hover:-translate-y-0.5 group-hover:text-[#12897A]">
          {sectionTitle}
        </h2>
        <p className="mt-4 line-clamp-4 leading-none text-2xl text-[#002C5A] transition-all duration-500 group-hover:text-slate-600 pb-5">
          {sectionDescription}
        </p>
      </div>

      {isLoading ? (
        <TeachersSectionSkeleton />
      ) : errorOccurred ? (
        <p className="text-center text-red-600">
          تعذّر تحميل قائمة المعلمين حالياً، حاول مجدداً لاحقاً.
        </p>
      ) : teachers.length === 0 ? (
        <p className="text-center text-slate-500">
          {track
            ? "لا يوجد معلمون مرتبطون بهذا الفرع حالياً."
            : "لا يوجد معلمون لعرضهم حالياً."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 max-w-2xl md:max-w-6xl mx-auto">
          {teachers.map((teacher, index) => (
            <div key={teacher.id} className="w-full max-w-[267px] mx-auto flex">
              <TeacherCard teacher={teacher} index={index} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function TeachersSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 max-w-2xl md:max-w-6xl mx-auto animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-[32px] bg-white shadow-[0_0_30px_rgba(0,0,0,0.12)] p-6 w-[267px] h-[337px] mx-auto"
        >
          <div className="mb-4 h-[130px] w-[130px] rounded-full bg-slate-200" />
          <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}