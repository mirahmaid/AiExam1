import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section
      dir="rtl"
      className="w-full max-w-[1200px] mx-auto px-4 py-16 bg-white overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-[#00D4FF1A] rounded-[40px] md:rounded-[50px] px-6 py-12 md:py-16 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(22,35,63,0.06)] relative overflow-hidden"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="font-Ubuntu text-[#16233f] font-bold text-2xl md:text-[34px] leading-snug mb-4"
        >
          جاهز لبدء التميز ؟
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="font-Ubuntu text-[#4b5975] text-sm md:text-base leading-relaxed max-w-[700px] mb-8"
        >
          انضم إلى منصة مسار التميز وابدأ رحلة تعليمية ممتعة ومميزة في المواد الدراسية والدورات التدريبية، مع دروس مبسطة، تمارين تفاعلية، واختبارات تساعدك على رفع تحصيلك الأكاديمي والوصول إلى هدفك في أي وقت ومن أي مكان.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            to="/register"
            className="font-Ubuntu inline-block bg-[#16233f] hover:bg-[#1e3056] text-white font-bold text-base md:text-lg px-28 py-2.5 rounded-full transition-all duration-300 shadow-[0_8px_25px_rgba(22,35,63,0.2)] hover:scale-105"
          >
            سجل الآن
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
