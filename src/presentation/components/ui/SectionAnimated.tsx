import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface SectionAnimatedProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}

export function SectionAnimated({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 40,
  ...props
}: SectionAnimatedProps) {
  const getInitialY = () => {
    if (direction === 'up') return distance
    if (direction === 'down') return -distance
    return 0
  }

  const getInitialX = () => {
    if (direction === 'left') return distance
    if (direction === 'right') return -distance
    return 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: getInitialX(), y: getInitialY() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] // Premium cubic-bezier easeOutExpo
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
