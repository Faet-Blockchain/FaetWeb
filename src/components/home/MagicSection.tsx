/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const MagicSection = () => {
	return (
		<section className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				HOW IT WORKS
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				Due to the significance of the magic system in the game. You
				needed a design that arranged and gave prominence to each
				magical type. This array beautifuly displays each magic type
				while also allowing the player to recognize the differences by
				there unique colors.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.3, rotate: 10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 140 }}
			>
				<img
					src="/images/magic.png"
					alt="hero-img"
					width={733}
					height={706}
					className="mx-auto h-64 md:h-[32rem] w-auto my-10 md:my-20 animate-[spin_20s_linear_infinite]"
				/>
			</motion.div>
		</section>
	);
};

export default MagicSection;
