import { motion } from 'framer-motion'

/**
 * Shimmer Text Component
 * Applies a luxury metallic shimmer effect to text
 */
export function ShimmerText({ children, className = '' }) {
  return (
    <motion.span
      className={`shimmer-text ${className}`}
      style={{
        background: 'linear-gradient(90deg, currentColor 0%, rgba(255, 255, 255, 0.3) 50%, currentColor 100%)',
        backgroundSize: '1000px 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
      animate={{
        backgroundPosition: ['0px 0', '1000px 0'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Glow Text Component
 * Adds a glowing effect to text with blur
 */
export function GlowText({ children, className = '', color = 'cyan' }) {
  const colorMap = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  }

  return (
    <motion.span
      className={`${colorMap[color]} ${className}`}
      animate={{
        filter: ['drop-shadow(0 0 0px rgba(34, 211, 238, 0))', 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))', 'drop-shadow(0 0 0px rgba(34, 211, 238, 0))'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.span>
  )
}

/**
 * Scroll Progress Bar Component
 * Shows scroll progress with neon effect at the top of the page
 */
export function ScrollProgress() {
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 z-[100]"
      style={{
        width: '0%',
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
      }}
      initial={{ width: '0%' }}
      animate={{ width: '100%' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  )
}

/**
 * Animated Border Component
 * Creates a glowing animated border
 */
export function AnimatedBorder({ children, className = '' }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent)',
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Floating Particles Background Component
 * Creates subtle animated particles in the background
 */
export function FloatingParticles() {
  const particles = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Metallic Shimmer Effect for Logo
 * Adds a luxury metallic sheen on hover
 */
export function MetallicShimmer({ children, className = '' }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.5))',
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}
