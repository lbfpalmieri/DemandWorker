import React from 'react'
import { motion } from 'framer-motion'

type Props = { checked: boolean; onChange: (v: boolean) => void }
export const NeonCheckbox: React.FC<Props> = ({ checked, onChange }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    aria-pressed={checked}
    onClick={() => onChange(!checked)}
    className={`checkbox-neon ${checked ? 'checkbox-neon-checked' : ''}`}
  >
    
  </motion.button>
)

