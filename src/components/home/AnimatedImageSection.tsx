"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AnimatedImageSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0, rotate: -15 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <Image
        src="/images/hero-image.png"
        alt="hero-img"
        width={1134}
        height={428}
        className="mx-auto md:h-96 md:w-auto my-10 md:mb-20 md:mt-10"
      />
    </motion.div>
  );
}
