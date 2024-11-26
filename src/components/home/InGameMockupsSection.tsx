/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const InGameMockupsSection = () => {
	return (
		<section id="mockups" className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				IN GAME MOCK-UPS
			</motion.h1>
			<div className="relative my-10 md:my-20 pt-40 max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.3, rotate: -40 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
				>
					<img
						src="/images/mockup2.png"
						alt="mockup2"
						width={620}
						height={482}
						className="w-72 sm:w-full sm:max-w-lg h-auto"
					/>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: -20, scale: 0.3, rotate: 40 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
					className="absolute top-0 right-5 sm:right-0"
				>
					<img
						src="/images/mockup1.png"
						alt="mockup1"
						width={620}
						height={482}
						className="w-72 sm:w-full sm:max-w-lg h-auto"
					/>
				</motion.div>
			</div>
		</section>
	);
};

export default InGameMockupsSection;
