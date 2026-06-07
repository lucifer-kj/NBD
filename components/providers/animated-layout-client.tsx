"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeSlidePageTransition } from "@/lib/motion.config";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMounted } from "@/hooks/use-mounted";
import { usePathname } from "next/navigation";

export default function AnimatedLayoutClient({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={false}
        animate="animate"
        exit="exit"
        variants={reduced ? undefined : fadeSlidePageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 