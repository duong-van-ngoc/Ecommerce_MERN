import React from "react";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

const BENEFIT_ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  return: RotateCcw,
};

function HomeBenefits({ benefits }) {
  return (
    <section className="home-benefits-section" aria-label="Lý do chọn chúng tôi">
      <div className="home-benefits-grid">
        {benefits.map((benefit) => {
          const Icon = BENEFIT_ICONS[benefit.icon] || ShieldCheck;

          return (
            <article key={benefit.id} className="home-benefit-card">
              <span>
                <Icon size={32} aria-hidden="true" />
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default React.memo(HomeBenefits);
