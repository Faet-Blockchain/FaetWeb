"use client";
import React from "react";
import { motion } from "framer-motion";
import { InfiniteMovingCards } from "./infinite-moving-cards";

const Partners = () => {
    const partners1 = [
        { src: "eth.png", url: "https://ethereum.org" },
        { src: "op.png", url: "https://optimism.io" },
        { src: "lisk.png", url: "https://lisk.com/" },
        { src: "rpgmaker.png", url: "https://www.rpgmakerweb.com" },
        { src: "groupfi.png", url: "https://groupfi.ai/" },
        { src: "rarible.png", url: "https://rarible.com/" }
    ];

    return (
        <section id="typography" className="py-32 bg-[#CED6AE]/90 w-full">
            <div className="max-w-6xl mx-auto px-3">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: "easeInOut" }}
                    className="text-black text-5xl md:text-7xl font-nocturne-serif-bold mb-10"
                >
                    Technology Partners
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: "easeInOut" }}
                    className="text-neutral-800 mb-8"
                >
                    Dummy text.
                </motion.p>
                <InfiniteMovingCards
                    items={partners1}
                    direction="right"
                    speed="slow"
                />
            </div>
        </section>
    );
};

export default Partners;
