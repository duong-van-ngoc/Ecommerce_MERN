import React from "react";
import { Star } from "lucide-react";
import HomeSectionTitle from "@/features/home/components/HomeSectionTitle";

function HomeTestimonials({ testimonials }) {
  return (
    <section className="home-section" aria-labelledby="home-testimonials-title">
      <HomeSectionTitle title="Khách hàng nói gì" titleId="home-testimonials-title" />

      <div className="home-testimonial-grid">
        {testimonials.map((testimonial) => (
          <article key={testimonial.id} className="home-testimonial-card">
            <div className="home-testimonial-stars" aria-label={`${testimonial.rating} sao`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill={index < testimonial.rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p>{testimonial.content}</p>
            <div>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default React.memo(HomeTestimonials);
