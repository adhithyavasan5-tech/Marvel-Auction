import React, { useEffect, useRef } from 'react';

/**
 * GoldenDynastySection
 *
 * A premium reference‑inspired section placed directly below the hero banner.
 * It displays three themed images with subtle gold borders, hover zoom, and
 * scroll‑reveal animations. The layout is responsive and respects the user's
 * reduced‑motion preference.
 */
const GoldenDynastySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) {
      const children = containerRef.current.children;
      Array.from(children).forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);

  const images: string[] = [
   
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 space-y-8" aria-label="Golden Dynasty showcase">
      <h2 className="text-center text-3xl font-cinzel font-bold text-[#F5F0E7] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
       
      </h2>
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {images.map((src, idx) => (
          <div
            key={src}
            className="relative overflow-hidden rounded-xl border-4 border-gold-500"
          >
            <img
              src={src}
              alt={`Golden Dynasty ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-105"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#FFD700]/10 via-transparent to-[#FFD700]/0" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GoldenDynastySection;
