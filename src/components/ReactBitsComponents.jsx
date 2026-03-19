/**
 * React Bits Components Wrappers
 * File ini berisi custom wrapper dan utility components
 */

/**
 * Custom wrapper untuk animasi pixel-based effects
 * Anda bisa membuat custom animation menggunakan CSS atau library lain
 */
export const PixelTransitionWrapper = ({ children, duration = 300 }) => {
  return (
    <div 
      style={{
        animation: `pixelFade ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Floating decorative element dengan animasi
 */
export const FloatingElement = ({ emoji, delay = 0, opacity = 0.6 }) => {
  return (
    <div
      className="animate-bounce pointer-events-none"
      style={{
        animationDelay: `${delay}s`,
        opacity: opacity,
      }}
    >
      <span className="text-5xl">{emoji}</span>
    </div>
  );
};

/**
 * Gradient blur background decoration
 */
export const GradientBlur = ({ color = 'emerald', position = 'top-left' }) => {
  const positionClass = {
    'top-left': '-top-40 -left-40',
    'bottom-right': '-bottom-40 -right-40',
    'center': 'top-1/3 right-1/4',
  }[position] || '-top-40 -left-40';

  const colorClass = {
    emerald: 'bg-emerald-300/15',
    teal: 'bg-teal-300/15',
    green: 'bg-green-300/15',
  }[color] || 'bg-emerald-300/15';

  return (
    <div 
      className={`absolute ${positionClass} w-96 h-96 ${colorClass} blur-3xl rounded-full pointer-events-none`}
    />
  );
};

/**
 * Animated glow effect
 */
export const GlowEffect = ({ color = 'emerald', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96',
  }[size] || 'w-72 h-72';

  const colorClass = {
    emerald: 'bg-emerald-200/10',
    teal: 'bg-teal-200/10',
    green: 'bg-green-200/10',
  }[color] || 'bg-emerald-200/10';

  return (
    <div 
      className={`absolute ${sizeClasses} ${colorClass} blur-2xl rounded-full pointer-events-none animate-pulse`}
    />
  );
};
