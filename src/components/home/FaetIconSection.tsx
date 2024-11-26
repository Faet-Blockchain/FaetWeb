/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const FaetIconSection = () => {
	return (
		<section id="icon" className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				FAET ICON
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				Due to the unique field FAET is setup to inhabit in gaming, I
				felt an icon was needed to represent the brand. This may be used
				as a favicon for website usage, an app icon for desktop and
				mobile, or even as a symbol in-game that could hold
				significance.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 100 }}
			>
				<img
					src="/images/faet-icon.png"
					alt="hero-img"
					width={1134}
					height={428}
					className="mx-auto md:h-96 md:w-auto my-10 md:my-20"
				/>
			</motion.div>
		</section>
	);
};

export default FaetIconSection;
