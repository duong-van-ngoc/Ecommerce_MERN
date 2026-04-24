import React from "react";
import { Link } from "react-router-dom";

function HomeSectionTitle({ title, actionLabel, actionTo, titleId }) {
  return (
    <div className="home-section-title">
      <h2 id={titleId}>{title}</h2>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="home-section-link">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default React.memo(HomeSectionTitle);
