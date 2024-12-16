"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="flex justify-center mt-10">

        <Link href="https://www.subber.xyz/faet/allowlist/faet-founders-pass-allowlist" target="_blank">
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
            className="bg-gradient-to-r from-[#E6C245] to-[#B1302C] rounded-lg px-4 py-3 text-2xl font-nocturne-serif-bold text-black">Whitelist Now</motion.button>
        </Link>
      </div>
    </motion.div>
    
  );
}
