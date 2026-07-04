import { motion } from 'framer-motion'
import { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export default function FadeIn({ children, delay = 0, className = '', style, direction = 'up' }: Props) {
  const initial =
    direction === 'up' ? { opacity: 0, y: 40 }
    : direction === 'down' ? { opacity: 0, y: -40 }
    : direction === 'left' ? { opacity: 0, x: 40 }
    : direction === 'right' ? { opacity: 0, x: -40 }
    : { opacity: 0 }

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: false, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
