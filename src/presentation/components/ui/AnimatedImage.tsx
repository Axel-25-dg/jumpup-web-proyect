import { useState } from 'react'
import { motion } from 'framer-motion'
import { soundFx } from '@/presentation/utils/sound'
import { Volume2, Sparkles } from 'lucide-react'

interface AnimatedImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  showBadge?: boolean
  badgeText?: string
}

export function AnimatedImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  showBadge = true,
  badgeText = 'Interactuar con audio & zoom',
}: AnimatedImageProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    soundFx.playImageShimmer()
  }

  const handleClick = () => {
    soundFx.playJumpSound()
  }

  return (
    <motion.div
      className={`relative overflow-hidden border border-white/10 group rounded-lg shadow-xl ${containerClassName}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Light Sweep overlay on hover */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/15 to-transparent"
        initial={{ x: '-100%' }}
        animate={isHovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Main Image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isHovered ? 'brightness-110 contrast-105 grayscale-0' : 'grayscale-[20%]'
        } ${className}`}
        initial={{ scale: 1 }}
        animate={{ scale: isHovered ? 1.08 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Subtle floating badge */}
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0.7, y: 0 }}
          className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-black/75 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-medium text-sky-300"
        >
          <Sparkles className="h-3 w-3 text-sky-400 animate-spin" />
          <span>{badgeText}</span>
          <Volume2 className="h-3 w-3 text-sky-400" />
        </motion.div>
      )}
    </motion.div>
  )
}
