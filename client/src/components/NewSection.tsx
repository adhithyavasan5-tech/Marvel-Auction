import React from 'react';
import { motion } from 'framer-motion';

// URLs for the three images as required
const IMAGE_URLS = [
  'https://i.pinimg.com/1200x/46/49/9f/46499fd00af99589194b497fbf83ce1c.jpg',
  'https://i.pinimg.com/736x/a8/5d/bb/a85dbbb04aedbe08f263807904878c84.jpg',
  'https://i.pinimg.com/1200x/ac/bb/11/acbb1115d46ddc475fa3b24adf04d3e5.jpg',
];

/**
 * NewSection – a premium Marvel‑inspired visual block placed directly
 * below the landing page hero. It displays three curated images with
 * staggered entrance animations, subtle zoom on hover, and gold‑tinted
 * borders/effects to match the existing theme.
 */
export const NewSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-[#0A0B0F] overflow-hidden" aria-label="Marvel showcase">
      {/* Ambient gold particles – simple CSS animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C6A15B]/30 rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#C6A15B]/20 rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-12">
        <motion.h2
          className="text-4xl font-cinzel text-[#F0D79A] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          LEGACY OF THE DYNASTY
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {IMAGE_URLS.map((src, idx) => (
            <motion.div
              key={src}
              className="relative rounded-xl overflow-hidden border border-[#C6A15B]/30 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
            >
              <img
                src={src}
                alt={`Marvel legacy ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J2dyYXknIC8+PHRleHQgeD0nNTAlJyB5PSc1MCUnIGR5PScuMzVlbScgZm9udC1zaXplPScxNnB4JyBmb250LWZhbWlseT0nQXJpYWwsIHNlcmlmJz5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
