import React, { ReactNode } from 'react';

/**
 * AppWrapper – provides the global cinematic backdrop (dark base, grain, vignette).
 * It does **not** affect any business logic; it only adds presentational layers.
 */
export const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-[var(--color-obsidian)] text-[var(--color-ivory)] font-sans overflow-x-hidden">
      {/* Content layer */}
      <div className="relative z-10">{children}</div>
      {/* Grain overlay – very low opacity */}
      <div
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />
      {/* Vignette overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
};
