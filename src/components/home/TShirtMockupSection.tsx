/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const TShirtMockupSection = () => {
	return (
		<section className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				T-SHIRT MOCK-UP
			</motion.h1>
			<div className="relative mb-10 md:mb-20 max-w-5xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 30, scale: 0.6, rotate: 5 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
				>
					<img
						src="/images/shirt1.png"
						alt="shirt1"
						width={896}
						height={707}
						className="w-72 sm:w-full sm:max-w-xl md:max-w-2xl h-auto -translate-y-7 transition-all duration-300"
					/>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 30, scale: 0.6, rotate: 5 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
					className="absolute top-28 right-5 sm:right-0"
				>
					<img
						src="/images/shirt2.png"
						alt="shirt2"
						width={896}
						height={707}
						className="w-72 sm:w-full sm:max-w-xl md:max-w-2xl h-auto transition-all duration-300"
					/>
				</motion.div>
			</div>
		</section>
	);
};

export default TShirtMockupSection;
