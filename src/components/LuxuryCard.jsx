import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LuxuryCard({ children, className = '' }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate spotlight position
    setMousePosition({ x, y })

    // Calculate 3D tilt rotation (max 5 degrees)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * 5
    const rotateY = ((centerX - x) / centerX) * 5

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-[1.5rem] border border-cyan-300/30 bg-slate-950/60 backdrop-blur-2xl transition-all duration-300 ${className}`}
      style={{
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        boxShadow: '0 0 50px rgba(34, 211, 238, 0.3)',
        borderColor: 'rgba(34, 211, 238, 0.5)',
      }}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Neon Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80" />

      {/* Spotlight Effect */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15), transparent)',
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            filter: 'blur(40px)',
          }}
          animate={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 90 }}
        />
      )}

      {/* Multi-layer Shadow for Depth */}
      <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.3)]" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
