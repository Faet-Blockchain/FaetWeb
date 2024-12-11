/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const BrandColorsSection = () => {
  return (
    <section id="colors" className="px-3 my-32 max-w-6xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="text-5xl md:text-7xl font-nocturne-serif-bold"
      >
        FAET GATEWAY
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="text-lg my-5 max-w-5xl"
      >
        Our upcoming web3 indie gaming platform will enable small developers to create immersive web3 worlds and metaverses. Once their game is built using our low-code frameworks and game engines, they can immediately submit it for release. The FAET Gateway will empower creators to be able to sell, market, and release their games, something traditional indie game platforms (like Steam) don’t allow you to do.
      </motion.p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="aspect-w-16 aspect-h-9"
        >
          <img src="/images/samples/image1.png" alt="Image 1" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.25,
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="aspect-w-16 aspect-h-9"
        >
          <img src="/images/samples/image2.png" alt="Image 2" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="aspect-w-16 aspect-h-9"
        >
          <img src="/images/samples/image3.png" alt="Image 3" className="w-full h-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.75,
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="aspect-w-16 aspect-h-9"
        >
          <img src="/images/samples/image4.png" alt="Image 4" className="w-full h-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
};

export default BrandColorsSection;
