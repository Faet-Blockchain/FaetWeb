/* eslint-disable @next/next/no-img-element */
"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function RoadmapAnimation({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div ref={ref} className="relative font-nocturne-serif-regular min-h-screen">
            <motion.div
                style={{
                    backgroundImage: "url('/images/bg.png')",
                    backgroundPosition: "bottom",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    y: backgroundY,
                }}
                className="fixed top-[-200%] left-0 h-[350%] inset-0 -z-50 pt-14"
                id="home"
            ></motion.div>
            <motion.div
                style={{
                    y: backgroundY,
                }}
                className="fixed top-[-200%] left-0 h-[350%] inset-0 -z-40 pt-14 bg-black/50"
                id="home"
            ></motion.div>
            {children}
        </div>
    );
}
