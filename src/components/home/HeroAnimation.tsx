// HeroAnimation.tsx
"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Keep the same transform logic
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="relative font-nocturne-serif-regular">
      <motion.div
        style={{
          backgroundImage: "url('/images/bg.png')",
          backgroundRepeat: "repeat",
          y: backgroundY,
        }}
        className="
          fixed inset-0 -z-20 pt-14
          bg-center bg-no-repeat 
          bg-[length:100%_auto]  /* On mobile: no cover, prevent resizing 'zoom' */
          top-[-100%] h-[200%]    /* Smaller parallax area on mobile = slower scroll */
          md:top-[-200%] md:h-[350%]  /* Desktop original setup */
          md:bg-bottom md:bg-cover    /* Desktop: revert to cover */
        "
        id="home"
      />
      <motion.div
        style={{ y: backgroundY }}
        className="
          fixed inset-0 -z-10 pt-14 bg-black/50 
          bg-center bg-no-repeat 
          bg-[length:100%_auto]
          top-[-100%] h-[200%]
          md:top-[-200%] md:h-[350%]
          md:bg-bottom md:bg-cover
        "
        id="home"
      />
      {children}
    </div>
  );
}
