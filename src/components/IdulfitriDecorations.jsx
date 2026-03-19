/**
 * Idulfitri Decorations Component
 * Component dekoratif dengan elemen-elemen Idulfitri
 */

import React from 'react';
import { GradientBlur, FloatingElement, GlowEffect } from './ReactBitsComponents';

export const IdulfitriDecorationsV2 = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Floating lanterns and symbols */}
      <div className="absolute top-20 left-10">
        <FloatingElement emoji="🏮" delay={0} opacity={0.6} />
      </div>
      
      <div className="absolute top-32 right-12">
        <FloatingElement emoji="🌙" delay={0.5} opacity={0.5} />
      </div>
      
      <div className="absolute bottom-32 left-1/4">
        <FloatingElement emoji="✨" delay={1} opacity={0.4} />
      </div>
      
      <div className="absolute bottom-20 right-1/4">
        <FloatingElement emoji="🌟" delay={0.3} opacity={0.55} />
      </div>

      {/* Background gradient decorations */}
      <div className="absolute -top-40 -left-40">
        <GradientBlur color="emerald" position="top-left" />
      </div>
      
      <div className="absolute -bottom-40 -right-40">
        <GradientBlur color="emerald" position="bottom-right" />
      </div>

      {/* Additional glow effects */}
      <div className="absolute top-1/3 right-1/4">
        <GlowEffect color="emerald" size="md" />
      </div>
    </div>
  );
};

export default IdulfitriDecorationsV2;
