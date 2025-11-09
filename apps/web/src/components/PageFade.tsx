'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function PageFade({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.22,
        ease: 'easeOut',
        exit: {
          duration: shouldReduceMotion ? 0 : 0.18,
          ease: 'easeIn',
        },
      }}
    >
      {children}
    </motion.div>
  );
}

