/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";
import NavLink from '../NavLink';

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
				Faet operates as a decentralized metaverse engine, leveraging the Optimism Stack for scalable, low-cost blockchain interactions on Ethereum Layer 2. Its modular architecture supports game developers by integrating features like private server access, in-game asset creation, and decentralized NFT management. Through cross-chain interoperability and tools for NFT and token integration, Faet enables seamless interactions across EVM-compatible networks. By providing a flexible, plugin-based design, Faet empowers developers of all skill levels to create immersive blockchain-enabled experiences, revolutionizing the development and distribution of decentralized games.
			<br /><br />
			<NavLink href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">
               Find out more by reading our whitepaper (Click Here).
            </NavLink>

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
