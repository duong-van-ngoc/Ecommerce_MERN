// @deprecated Home currently uses "@/features/home/components/BannerSlider".
// Keep this legacy hero component until historical usage is confirmed safe to remove.
import React from "react";
import { Link } from "react-router-dom";

function HomeHero({ hero }) {
  return (
    <section className="home-hero-section" aria-labelledby="home-hero-title">
      <div className="home-hero-card">
        <img src={hero.image} alt={hero.imageAlt} className="home-hero-image" />
        <div className="home-hero-overlay">
          <span>{hero.eyebrow}</span>
          <h1 id="home-hero-title">{hero.title}</h1>
          <p>{hero.description}</p>
          <Link to={hero.ctaTo} className="home-primary-button">
            {hero.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HomeHero);
