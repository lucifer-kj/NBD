// Centralized Framer Motion animation presets
import { Variants } from "framer-motion";

// ===================================
// ENTRANCE ANIMATIONS
// ===================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24, transition: { duration: 0.4 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};

// ===================================
// SCALE ANIMATIONS
// ===================================

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
};

// ===================================
// STAGGER CONTAINERS
// ===================================

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

// ===================================
// HERO-SPECIFIC ANIMATIONS
// ===================================

export const heroHeading: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

export const heroSubtext: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const heroCTA: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// ===================================
// PAGE TRANSITIONS
// ===================================

export const fadeSlidePageTransition: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -24, transition: { duration: 0.3 } }
};

// ===================================
// COMPONENT ANIMATIONS
// ===================================

export const cartSlideIn: Variants = {
  hidden: { x: "100%", opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    } 
  },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } }
};

export const modalScaleFade: Variants = scaleFade;

export const parallax = (offset = 40): Variants => ({
  initial: { y: offset, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } }
});

// ===================================
// HOVER & INTERACTION PRESETS
// ===================================

export const magneticHover = {
  scale: 1.03,
  y: -4,
  transition: { type: "spring", stiffness: 400, damping: 20 }
};

export const cardHover = {
  scale: 1.02,
  y: -6,
  boxShadow: "0 16px 48px rgba(45, 90, 76, 0.12)",
  transition: { type: "spring", stiffness: 300, damping: 22 }
};

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};