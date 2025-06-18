/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";
import NavLink from '../NavLink';

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
						The &quot;Faet Manual&quot; is a comprehensive, user-friendly guide designed to empower creators to develop their own Web3 games without any coding knowledge. It walks users through every step of the process, from setting up game assets and integrating blockchain features like NFTs and tokens, to deploying and managing their games on the Faet platform. With clear instructions, pre-built modules, and practical examples, the manual simplifies the complexities of Web3 development, making it accessible to anyone with a creative vision.

						<br /><br />
						
						<NavLink href="https://github.com/Faet-Blockchain/FaetAlphaDemo" target="_blank" rel="noopener noreferrer">
						Find out more by checking out our Alpha Test Demo (Click Here).
						</NavLink>
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
