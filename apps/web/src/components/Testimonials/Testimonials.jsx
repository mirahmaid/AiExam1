import { motion } from "framer-motion";

import { testimonials } from "../../data";
import TestimonialCard from "./TestimonialCard";

// عدد القصص الظاهرة (غيّره إذا بدك أكثر أو أقل)
const MAX_STORIES = 3;

function Testimonials() {
  const stories = testimonials.slice(0, MAX_STORIES);

  if (!stories.length) return null;

  return (
    <section
      id="success-stories"
      dir="rtl"
      className="w-full bg-[#F7FAFC] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-black leading-[1.45] text-[#0F2A4A] sm:text-4xl">
            وراء كل إنجاز
            <span className="text-[#0F8B78]"> قصة تستحق أن تُروى</span>
          </h2>

          <p className="mt-4 text-base font-medium leading-7 text-[#475569] sm:text-lg">
            طلاب بدأوا من نفس المكان، وكل واحد كمّل رحلته بطريقته.
          </p>

          {/* مسار صغير بمحطاته الثلاث */}
          <div aria-hidden="true" className="mt-6 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2DD4BF]" />
            <span className="w-8 border-t-2 border-dashed border-[#0F2A4A]/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#A78BFA]" />
            <span className="w-8 border-t-2 border-dashed border-[#0F2A4A]/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
          </div>
        </div>

        <motion.ul
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="grid gap-5 md:grid-cols-3"
        >
          {stories.map((item, index) => (
            <TestimonialCard key={item.id} item={item} index={index} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export default Testimonials;