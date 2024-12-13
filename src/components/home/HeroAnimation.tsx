"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="relative font-nocturne-serif-regular overflow-x-hidden">
      <motion.div
        style={{
          backgroundImage: "url('/images/bg.png')",
          backgroundPosition: "bottom",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          y: backgroundY,
          width: '100vw',
          transform: 'translateX(-50%)'
        }}
        className="fixed top-[-200%] h-[350%] -z-20 pt-14"
        id="home"
      />
      <motion.div
        style={{ 
          y: backgroundY,
          width: '100vw',
          transform: 'translateX(-50%)'
        }}
        className="fixed top-[-200%] h-[350%] -z-10 pt-14 bg-black/50"
        id="home"
      />
      {children}
    </div>
  );
}