/* eslint-disable @next/next/no-img-element */
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
					TYPOGRAPHY
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-lg my-5 text-black"
				>
					FAET will include A LOT of dialogue and unique type
					oportunities. While using a large variety of fonts is
					tempting, keeping the type options simple is the way to go
					for this project. Nocturne Serif is a bold, flexible
					typeface that merges classic serifs with an edgy, modern
					style.
				</motion.p>
				<div className="px-5">
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.8 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						<h2 className="text-black text-7xl md:text-9xl font-nocturne-serif-bold">
							BOLD CAPS
						</h2>
						<p className="text-lg my-5 text-black mt-0">
							Used for large titles
						</p>
					</motion.div>
					<div className="flex justify-end">
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.8 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
						>
							<h2 className="text-black text-7xl md:text-9xl italic text-end md:text-start">
								Italics Regular
							</h2>
							<p className="text-lg my-5 text-black mt-0 text-end md:text-start">
								Used for smaller titles and accents
							</p>
						</motion.div>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.8 }}
						whileInView={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					>
						<h2 className="text-black text-7xl md:text-9xl">
							Serif Regular
						</h2>
						<p className="text-lg my-5 text-black mt-0">
							Used for body copy
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default TypographySection;
