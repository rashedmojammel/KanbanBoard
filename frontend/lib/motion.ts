import type { Easing, Variants } from 'framer-motion';

/** Standard "premium" easing curve - quick start, gentle settle. */
export const EASE_OUT: Easing = [0.16, 1, 0.3, 1];

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: EASE_OUT } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
};

/** Container that staggers its direct motion children in on mount. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.24, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.14, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: EASE_OUT } },
};
