/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const ManualSection = () => {
	return (
		<section id="manual" className="px-3 my-32 max-w-6xl mx-auto">
			<div className="grid md:grid-cols-2 gap-5">
				<div>
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.75, ease: "easeInOut" }}
						className="text-5xl md:text-7xl font-nocturne-serif-bold"
					>
						FAET MANUAL
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.75, ease: "easeInOut" }}
						className="text-lg my-5 max-w-5xl"
					>
						Levreging my unique style, the potential physical media
						surrounding FAET would lean fully into a textured, worn
						asthetic. The manual would remain minimalist in type,
						and encourage the reader to enhabit the world in which
						they are about to start playing in. Giving the player
						that sense of emersion through all aspects of the visual
						presentation.
					</motion.p>
				</div>
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 10 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
				>
					<img
						src="/images/manual.png"
						alt="hero-img"
						width={752}
						height={973}
						className="mx-auto"
					/>
				</motion.div>
			</div>
		</section>
	);
};

export default ManualSection;
