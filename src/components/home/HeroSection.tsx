/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const HeroSection = () => {
	return (
		<div className="px-3 mt-10 pb-32 max-w-6xl mx-auto">

			<br />
			<br />
			<br />
			<br />
			<br />
			<motion.div
				initial={{ opacity: 0, y: 50, scale: 8 }}
				whileInView={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ type: "spring", stiffness: 100 }}
			>
				<img
					src="/images/faet-end.png"
					alt=""
					width={848}
					height={321}
					className="mx-auto md:w-full my-10 md:mb-20 md:mt-10"
				/>
			</motion.div>
			<div className="flex justify-center gap-6 mt-10 flex-wrap">
				<Link href="https://rarible.com/faet-founders-pass/items" target="_blank">
					<motion.button
						initial={{ opacity: 0, y: 20, scale: 0.5 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 400, damping: 15 }}
						whileHover={{
							scale: 1.1,
							transition: { duration: 0.3 },
						}}
						className="bg-gradient-to-r from-[#E6C245] to-[#B1302C] rounded-lg px-4 py-3 text-2xl font-nocturne-serif-bold text-black"
					>
						Get the Founders Pass
					</motion.button>
				</Link>

				<div className="text-center">
					<Link href="https://game.faet.io" target="_blank">
						<motion.button
							initial={{ opacity: 0, y: 20, scale: 0.5 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ type: "spring", stiffness: 400, damping: 15 }}
							whileHover={{
								scale: 1.1,
								transition: { duration: 0.3 },
							}}
							className="bg-[#E6C245] text-black rounded-lg px-4 py-3 text-2xl font-nocturne-serif-bold"
						>
							Play the Game
						</motion.button>
					</Link>
					<p className="text-sm mt-2 text-center">If you already have a founders pass <br /> Requires Chrome with Metamask, or Metamask Browser for Mobile.</p>
				</div>
			</div>

			<br />
			<br />
			<br />
			<motion.h1
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				The first game is now available.
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				FAET makes blockchain gaming accessible to everyone. Get the founders pass and join the game. Make up to four of your own legendary heroes, stored forever on the blockchain. Join us as we make web3 game development accessible to indie developers.
			</motion.p>
			<br />
			<br />
			<br />
		</div>
	);
};

export default HeroSection;
