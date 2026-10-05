
import { motion, useReducedMotion } from "framer-motion"; 
import { ArrowLeft, PencilLine, PlayCircle, Timer, Trophy } from "lucide-react"; 
import { Link } from "react-router-dom"; 
 
// نفس محطات ألوان الـ Hero 
const STEPS = [ 
  { label: "افهم", icon: PlayCircle, color: "#2DD4BF" }, 
  { label: "تدرّب", icon: PencilLine, color: "#60A5FA" }, 
  { label: "اختبر", icon: Timer, color: "#A78BFA" }, 
  { label: "تفوّق", icon: Trophy, color: "#FBBF24" }, 
]; 
 
const TRAIL_TIME = 1.6; // مدة رسم الخط 
 
export default function CTASection() { 
  const reduce = useReducedMotion(); 
 
  return ( 
    <section dir="rtl" className="bg-[#F7FAFC] px-5 py-10 md:py-12"> 
      <div className="mx-auto max-w-[1180px]"> 
        <motion.div 
          initial={reduce ? false : { opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, amount: 0.25 }} 
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} 
          className="relative overflow-hidden rounded-[32px] bg-[#0B1F3A] px-6 py-10 text-center shadow-[0_30px_80px_-45px_rgba(11,31,58,0.8)] md:px-12 md:py-12" 
        > 
          {/* شبكة النقاط (نفس خلفية خريطة الـ Hero) */} 
          <div 
            aria-hidden="true" 
            className="absolute inset-0" 
            style={{ 
              backgroundImage: 
                "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)", 
              backgroundSize: "22px 22px", 
            }} 
          /> 
 
          {/* إضاءة البداية (تيل) والهدف (عنبر) */} 
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#2DD4BF]/20 blur-3xl" 
          /> 
          <div 
            aria-hidden="true" 
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#FBBF24]/15 blur-3xl" 
          /> 
 
          <div className="relative z-10"> 
            <h2 className="mx-auto max-w-[720px] text-3xl font-black leading-[1.45] text-white md:text-5xl md:leading-[1.4]"> 
              مستعد تخلي 
              <span className="text-[#5EEAD4]"> دراستك أذكى؟</span> 
            </h2> 
 
            <p className="mx-auto mt-5 max-w-[600px] text-base font-medium leading-8 text-white/75 md:text-lg"> 
              ابدأ رحلتك مع مسار التميز، وافهم دروسك، تدرّب عليها، واختبر مستواك 
              بخطوات بسيطة تقرّبك من هدفك. 
            </p> 
 
            {/* المسار: خطوات الرحلة الأربع */} 
            <div className="relative mx-auto mt-8 max-w-[560px]"> 
              <div 
                aria-hidden="true" 
                className="absolute inset-x-5 top-5 -translate-y-1/2 border-t-2 border-dashed border-white/20" 
              /> 
 
              <motion.div 
                aria-hidden="true" 
                initial={reduce ? false : { scaleX: 0 }} 
                whileInView={{ scaleX: 1 }} 
                viewport={{ once: true }} 
                transition={{ 
                  duration: TRAIL_TIME, 
                  delay: 0.3, 
                  ease: "linear", 
                }} 
                className="absolute inset-x-5 top-5 h-[3px] origin-right -translate-y-1/2 rounded-full bg-gradient-to-l from-[#2DD4BF] via-[#A78BFA] to-[#FBBF24]" 
              /> 
 
              <ul className="relative flex justify-between"> 
                {STEPS.map(({ label, icon: Icon, color }, index) => ( 
                  <li 
                    key={label} 
                    className="flex flex-col items-center gap-2.5" 
                  > 
                    <motion.span 
                      initial={reduce ? false : { scale: 0.3, opacity: 0 }} 
                      whileInView={{ scale: 1, opacity: 1 }} 
                      viewport={{ once: true }} 
                      transition={{ 
                        type: "spring", 
                        stiffness: 240, 
                        damping: 15, 
                        delay: 0.3 + (index / (STEPS.length - 1)) * TRAIL_TIME, 
                      }} 
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B1F3A] ring-4 ring-[#0B1F3A]" 
                      style={{ 
                        backgroundColor: color, 
                        boxShadow: `0 0 24px ${color}80`, 
                      }} 
                    > 
                      <Icon size={18} strokeWidth={2.2} aria-hidden="true" /> 
                    </motion.span> 
 
                    <span className="text-sm font-black" style={{ color }}> 
                      {label} 
                    </span> 
                  </li> 
                ))} 
              </ul> 
            </div> 
 
            {/* الزر */} 
            <Link 
              to="/register" 
              className="group mx-auto mt-8 flex w-fit items-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black text-[#0F2A4A] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#E6F8F2] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30" 
            > 
              ابدأ رحلتك الآن 
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2A4A] text-white transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-[#0F8B78]"> 
                <ArrowLeft size={16} aria-hidden="true" /> 
              </span> 
            </Link> 
          </div> 
        </motion.div> 
      </div> 
    </section> 
  ); 
}

