/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const SizingAndVarientsSection = () => {
	return (
		<section className="py-32 bg-[#CED6AE]/90 w-full">
			<div className="max-w-6xl mx-auto px-3">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-black text-5xl md:text-7xl font-nocturne-serif-bold"
				>
					NFTS WITH REAL UTILITY AND TECH ADVANTAGE
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-lg my-5 text-black"
				>
					Unleash your creativity with FAET and show the world your vision. FAET enables creators to generate their own NFT sets and use them in their own web3 games. Connect with others and use their NFTs in your game. Unlike standard NFTs, Faet NFTs contain entire sprite sheets and game metadata, making them game-ready for the Faet ecosystem and partner games.    
				</motion.p>
				<div className="grid md:grid-cols-2 gap-10 my-10">
					<motion.div
						initial={{ opacity: 0, y: 50, scale: 0.5 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 80 }}
					>
						<img
							src="/images/section2/01.png"
							alt="01"
							width={494}
							height={232}
							className="max-w-80 md:max-w-xl mx-auto"
						/>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 50, scale: 0.5 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 80 }}
					>
						<img
							src="/images/section2/03.png"
							alt="03"
							width={494}
							height={232}
							className="max-w-80 md:max-w-xl mx-auto md:mt-5"
						/>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 50, scale: 0.5 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 80 }}
					>
						<img
							src="/images/section2/02.png"
							alt="02"
							width={494}
							height={232}
							className="max-w-80 md:max-w-xl mx-auto"
						/>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 50, scale: 0.5 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 80 }}
					>
						<img
							src="/images/section2/04.png"
							alt="04"
							width={494}
							height={232}
							className="max-w-80 md:max-w-xl mx-auto"
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default SizingAndVarientsSection;
