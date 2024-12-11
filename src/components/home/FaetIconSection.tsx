/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FaetIconSection = () => {
	const [showLightbox, setShowLightbox] = useState(false);
	const toggleLightbox = () => setShowLightbox(!showLightbox);

	// Prevent body from scrolling when lightbox is open
	useEffect(() => {
		if (showLightbox) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
	}, [showLightbox]);

	return (
		<section id="icon" className="px-3 my-32 max-w-6xl mx-auto relative">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				MAKE YOUR METAVERSE
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				Where Web2 gaming ends and web3 begins. Make your own web3 games, without knowing how to code. Launch them, and get paid. Web3 game development has never been easier.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 100 }}
			>
				<img
					onClick={toggleLightbox}
					src="/images/poster.png"
					alt="hero-img"
					width={1134}
					height={428}
					className="mx-auto md:h-96 md:w-auto my-10 md:my-20 cursor-pointer"
				/>
			</motion.div>
			{showLightbox && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col overflow-hidden">
					<button
						onClick={toggleLightbox}
						className="text-white text-3xl self-end m-5"
					>
						×
					</button>
					<div className="flex-1 overflow-auto p-5">
						<img
							src="/images/poster.png"
							alt="hero-img-large"
							className="w-[90vw] md:w-[60vw] h-auto mx-auto block"
						/>
					</div>
				</div>
			)}
		</section>
	);
};

export default FaetIconSection;
