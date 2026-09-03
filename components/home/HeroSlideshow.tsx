"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SLIDES = [
  {
    src: "/Images/green_architecture.jpg",
    alt: "Majestic Islamic Architecture Domes",
  },
  {
    src: "/Images/madrasa_alcove.jpg",
    alt: "Warm Golden Hour Madrasa Study Alcove",
  },
  {
    src: "/Images/scholarly_courtyard.jpg",
    alt: "Serene Historical Islamic Courtyard Sunset",
  },
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[var(--islamic-green-dark)]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: index === 0 ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Ken Burns Zoom Effect */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 6, ease: "linear" }}
            className="w-full h-full relative"
          >
            <Image
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="(max-width: 768px) 100vw, 100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
