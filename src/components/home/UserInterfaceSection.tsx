/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const UserInterfaceSection = () => {
	return (
		<section id="user-interface" className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				FAET: THE GAME
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				FAET Studios is not just creating a platform, but taking part in the creativity as well. The official game, playable only by the holders of FAET NFTs is being launched alongside their original Limited Edition Founders NFT Set mint. Explore the world of FAET and discover the mysteries of The Last Gate in this epic turn-based roleplaying adventure.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 140 }}
				className="flex justify-center items-center space-x-5 my-10 md:my-20"
			>
				<img
					src="/images/runa.png"
					alt="left-decoration"
					width={300}
					height={315}
					className="max-w-xs h-auto"
				/>
				<img
					src="/images/mockup1.png"
					alt="user-interface"
					width={1239}
					height={315}
					className="max-w-xl h-auto"
				/>
				<img
					src="/images/fang.png"
					alt="right-decoration"
					width={300}
					height={315}
					className="max-w-xs h-auto"
				/>
			</motion.div>
		</section>
	);
};

export default UserInterfaceSection;
