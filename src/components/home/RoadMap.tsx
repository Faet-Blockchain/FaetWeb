/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const TypographySection = () => {
	return (
		<section id="typography" className="py-32 bg-[#CED6AE]/90 w-full">
			<div className="max-w-6xl mx-auto px-3">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-black text-5xl md:text-7xl font-nocturne-serif-bold"
				>
					ROADMAP
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-lg my-5 text-black"
				>
					FAET will expand its functionalities and grow into a dominant force in the web3 gaming space. Here&#39;s a peek at our roadmap, and what to expect from us coming soon. <a href="/roadmap">Click here to find out more about our roadmap.</a>
				</motion.p>
				<div className="px-5">
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.8 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						<h2 className="text-black text-7xl md:text-9xl font-nocturne-serif-bold">
							1st Set Launch
						</h2>
						<p className="text-lg my-5 text-black mt-0">
							Quest 1
						</p>
					</motion.div>
					<div className="flex justify-end">
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<h2 className="text-black text-7xl md:text-9xl italic text-end md:text-start">
								ERC-20 Airdrop
							</h2>
							<p className="text-lg my-5 text-black mt-0 text-end md:text-start">
								Quest 2
							</p>
						</motion.div>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.8 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						<h2 className="text-black text-7xl md:text-9xl">
							Plugin Upgrade
						</h2>
						<p className="text-lg my-5 text-black mt-0">
							Quest 3
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default TypographySection;
