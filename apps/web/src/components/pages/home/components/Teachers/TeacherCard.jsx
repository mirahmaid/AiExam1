import { useState } from "react";
import { getTeacherPhotoUrl } from "./teachersApi";
import { useInView } from "./useInView";

export default function TeacherCard({ teacher, index = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const { ref, inView } = useInView();

  const initials = teacher.name
    .replace(/^أ\.?\s*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w)
    .join("");

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${index * 90}ms` : "0ms" }}
      className={`group flex flex-col items-center justify-center 
        w-[270px] h-[350px] 
        rounded-[32px] bg-white 
        shadow-[0_0_30px_rgba(0,0,0,0.12)]
        p-6
        transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-2
        ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
      `}
    >
      <div className="relative mb-4 h-[130px] w-[130px] overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-inner transition-shadow duration-500 group-hover:ring-[#002C5A]/10">
        {!imgFailed ? (
          <img
            src={getTeacherPhotoUrl(teacher.id)}
            alt={teacher.name}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#002C5A] to-[#0F2A4A] text-xl font-semibold text-white">
            {initials}
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-[#002C5A] transition-colors duration-300">
        {teacher.name}
      </h3>
      <p className="relative mt-3 text-xl font-medium text-[#002C5A] transition-colors duration-300">
        {teacher.title}
        <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-0 bg-[#12897A] transition-all duration-500 group-hover:w-10" />
      </p>
      {teacher.bio && (
        <p className="mt-3 mx-auto w-[222px] h-[54px] text-center text-[16px] leading-[110%] font-normal line-clamp-3 overflow-hidden text-[#002C5A]">
          {teacher.bio}
        </p>
      )}
    </div>
  );
}
