import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LuxuryHeader({ children, theme, isArabic }) {
  const [isLogoHovered, setIsLogoHovered] = useState(false)

  return (
    <>
      {/* Neon Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 z-[100]"
        style={{
          width: '0%',
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)',
        }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Scanning Light Animation */}
      <style>{`
        @keyframes scanningLight {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes textShimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes systemPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .scanning-border::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(34, 211, 238, 0.8),
            transparent
          );
          animation: scanningLight 3s infinite;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            currentColor 0%,
            rgba(255, 255, 255, 0.3) 50%,
            currentColor 100%
          );
          background-size: 1000px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 3s infinite;
        }

        .system-pulse {
          animation: systemPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-2 px-4 sm:pt-3 sm:px-6 lg:px-8">
        <div className="scanning-border relative mx-auto max-w-7xl rounded-2xl border border-cyan-300/20 bg-slate-900/40 backdrop-blur-3xl shadow-2xl transition-all duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            {children}
          </div>
        </div>
      </header>

      {/* Shimmer Text Style Provider */}
      <style>{`
        .shimmer-heading {
          font-weight: 700;
          letter-spacing: -0.05em;
        }
      `}</style>
    </>
  )
}
