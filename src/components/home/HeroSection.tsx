/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
	return (
		<div className="px-3 mt-10 pb-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				FAET WORDMARK
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				Inspired by gothic imagry and fantasy influences, FAETS&apos;s
				work mark is imapactful, detailed and modern. It strikes a good
				balance that should remain readable as most sizes and stand out
				from other similar titles.
			</motion.p>
			<div className="flex justify-center mt-10">
				<motion.button
					initial={{ opacity: 0, y: 20, scale: 0.5 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring", stiffness: 400, damping: 15 }}
					whileHover={{
						scale: 1.1,
						transition: { duration: 0.3 },
					}}
					className="bg-gradient-to-r from-[#E6C245] to-[#B1302C] rounded-lg px-4 py-3 text-2xl font-nocturne-serif-bold text-black">Get Started</motion.button>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 50, scale: 0.8 }}
				whileInView={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: "spring", stiffness: 100 }}
			>
				<img
					src="/images/hero-image.png"
					alt="hero-img"
					width={1134}
					height={428}
					className="mx-auto md:h-96 md:w-auto my-10 md:mb-20 md:mt-10"
				/>
			</motion.div>
		</div>
	);
};

export default HeroSection;
