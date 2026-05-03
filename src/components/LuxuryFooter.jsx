import { motion } from 'framer-motion'
import { Mail, MessageCircleMore, Phone } from 'lucide-react'

export default function LuxuryFooter({ isArabic }) {
  const socialIcons = [
    {
      icon: MessageCircleMore,
      href: 'https://wa.me/201013988098',
      label: isArabic ? 'واتساب' : 'WhatsApp',
      color: 'emerald',
    },
    {
      icon: Mail,
      href: 'mailto:mohammed.abdelkarim2025@gmail.com',
      label: isArabic ? 'إيميل' : 'Email',
      color: 'cyan',
    },
    {
      icon: Phone,
      href: 'tel:+201013988098',
      label: isArabic ? 'اتصال' : 'Call',
      color: 'blue',
    },
  ]

  const iconVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.15, rotate: 5 },
  }

  const pulseVariants = {
    initial: { opacity: 0.5, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  }

  return (
    <>
      <style>{`
        .noise-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' fill='%23030712' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.3;
        }
      `}</style>

      <footer className="relative mt-16 border-t border-cyan-300/20 bg-slate-950 overflow-hidden">
        {/* Noise Texture Overlay */}
        <div className="noise-texture absolute inset-0 pointer-events-none" />

        {/* Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Branding */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-cyan-300">Hihya Care</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isArabic ? 'منصة حجز طبية متقدمة بتصميم سينمائي' : 'Advanced medical booking platform with cinematic design'}
              </p>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-3">
                {/* Pulsing Status Indicator */}
                <motion.div
                  className="relative w-3 h-3 rounded-full bg-emerald-400"
                  animate={{
                    boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.7)', '0 0 0 10px rgba(16, 185, 129, 0)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs uppercase tracking-widest text-emerald-400">
                  {isArabic ? 'نشط' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isArabic ? 'النظام جاهز وآمن' : 'System operational & secure'}
              </p>
            </motion.div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-right md:col-span-3 lg:col-span-1 text-xs text-slate-500"
            >
              <p>&copy; 2026 Hihya Care. All rights reserved.</p>
            </motion.div>
          </div>

          {/* Glowing Social Icons */}
          <motion.div
            className="mt-12 pt-8 border-t border-cyan-300/10 flex justify-center gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {socialIcons.map((item) => {
              const Icon = item.icon
              const colorClasses = {
                emerald: 'text-emerald-400 hover:shadow-emerald-500/50',
                cyan: 'text-cyan-400 hover:shadow-cyan-500/50',
                blue: 'text-blue-400 hover:shadow-blue-500/50',
              }

              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 rounded-full border border-${item.color}-400/30 bg-${item.color}-400/5 ${colorClasses[item.color]} transition-shadow duration-300 hover:shadow-lg`}
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                  title={item.label}
                >
                  <Icon size={20} />
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </footer>
    </>
  )
}
