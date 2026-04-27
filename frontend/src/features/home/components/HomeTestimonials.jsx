import React from "react";
import { Star, Quote } from "lucide-react";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";
import { motion } from "framer-motion";

function HomeTestimonials({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-8 py-24 sm:py-32 bg-white" aria-labelledby="home-testimonials-title">
      <HomeSectionTitle 
        title="Khách hàng nói gì" 
        titleId="home-testimonials-title" 
        centered={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
        {testimonials.map((testimonial, index) => (
          <motion.article 
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-col h-full"
          >
            <div className="flex gap-1 mb-8" aria-label={`${testimonial.rating} sao`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < testimonial.rating ? "fill-primary text-primary" : "fill-slate-100 text-slate-100"}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="text-primary/70 text-lg leading-relaxed italic mb-10 flex-grow font-medium">
              "{testimonial.content}"
            </p>

            <div className="flex items-center gap-6 pt-10 border-t border-slate-100">
              <div className="w-14 h-14 rounded-full bg-surface-bright flex items-center justify-center text-primary font-black uppercase text-xl border border-slate-100">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-[13px] font-black text-primary tracking-[0.1em] uppercase">{testimonial.name}</h4>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mt-1">{testimonial.role}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default React.memo(HomeTestimonials);
