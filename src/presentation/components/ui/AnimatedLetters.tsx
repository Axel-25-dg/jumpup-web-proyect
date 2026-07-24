import { motion, type Variants } from 'framer-motion'
import { soundFx } from '@/presentation/utils/sound'

interface AnimatedLettersProps {
  text: string
  className?: string
  letterClassName?: string
  soundScale?: boolean
  staggerDelay?: number
}

export function AnimatedLetters({
  text,
  className = '',
  letterClassName = '',
  soundScale = true,
  staggerDelay = 0.03,
}: AnimatedLettersProps) {
  // Split into words, then characters to handle space wrap properly
  const words = text.split(' ')

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i: number = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDelay, delayChildren: 0.04 * i },
    }),
  }

  const childVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 200,
      },
    },
  }

  let letterGlobalIndex = 0

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split('').map((char) => {
            const currentIndex = letterGlobalIndex++
            return (
              <motion.span
                key={currentIndex}
                variants={childVariants}
                whileHover={{
                  scale: 1.35,
                  y: -6,
                  rotate: (currentIndex % 2 === 0 ? 1 : -1) * 8,
                  color: '#38bdf8', // sky-400
                  transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
                }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => {
                  if (soundScale) {
                    soundFx.playLetterSound(currentIndex)
                  }
                }}
                onClick={() => {
                  soundFx.playJumpSound()
                }}
                className={`inline-block cursor-pointer select-none transition-colors ${letterClassName}`}
              >
                {char}
              </motion.span>
            )
          })}
        </span>
      ))}
    </motion.span>
  )
}
