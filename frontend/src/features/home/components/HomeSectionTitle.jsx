import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function HomeSectionTitle({ title, actionLabel, actionTo, titleId, centered = false }) {
  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center mb-12 sm:mb-16 font-sans text-center">
        <h2 
          id={titleId} 
          className="text-[32px] sm:text-[40px] font-black text-primary tracking-tight uppercase mb-4"
        >
          {title}
        </h2>
        <div className="w-20 h-1 bg-accent mb-6"></div>
        {actionLabel && actionTo && (
          <Link 
            to={actionTo} 
            className="group flex items-center gap-2 text-xs font-black text-text-secondary hover:text-accent transition-colors uppercase tracking-[0.2em]"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between mb-8 sm:mb-10 font-sans">
      <div className="relative">
        <h2 
          id={titleId} 
          className="text-2xl sm:text-3xl font-black text-primary tracking-tight"
        >
          {title}
        </h2>
        <div className="absolute -bottom-2 left-0 w-12 h-1 bg-accent rounded-full"></div>
      </div>
      
      {actionLabel && actionTo && (
        <Link 
          to={actionTo} 
          className="group flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-accent transition-colors"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export default React.memo(HomeSectionTitle);
