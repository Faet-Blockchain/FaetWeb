/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";

const BrandColorsSection = () => {
	return (
		<section id="colors" className="px-3 my-32 max-w-6xl mx-auto">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-5xl md:text-7xl font-nocturne-serif-bold"
			>
				BRAND COLORS
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				While trying to keep the core brand monochromatic, we felt a bit
				of variation was needed. The colors choosen represent one of the
				geners core standards. HP, MP, SP. These work to add a unique
				flavor to other aspects of the brand, while also harkening back
				to the roots of the genre as a whole.
			</motion.p>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-10">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					className="h-[24rem] md:h-[40rem] w-full bg-[#403B34] flex flex-col"
				>
					<div className="w-full grow bg-[#867F64] mt-20 rounded-t-full flex flex-col">
						<div className="w-full grow bg-[#CED6AE] mt-40 md:mt-56 rounded-t-full"></div>
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.25,
						duration: 0.3,
						ease: "easeInOut",
					}}
					className="h-[24rem] md:h-[40rem] w-full bg-[#2B1B4F] flex flex-col"
				>
					<div className="w-full grow bg-[#2E3B7A] mt-20 rounded-t-full flex flex-col">
						<div className="w-full grow bg-[#547CA7] mt-40 md:mt-56 rounded-t-full"></div>
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.5,
						duration: 0.3,
						ease: "easeInOut",
					}}
					className="h-[24rem] md:h-[40rem] w-full bg-[#062F36] flex flex-col"
				>
					<div className="w-full grow bg-[#176151] mt-20 rounded-t-full flex flex-col">
						<div className="w-full grow bg-[#22B373] mt-40 md:mt-56 rounded-t-full"></div>
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.75,
						duration: 0.3,
						ease: "easeInOut",
					}}
					className="h-[24rem] md:h-[40rem] w-full bg-[#47111D] flex flex-col"
				>
					<div className="w-full grow bg-[#90192C] mt-20 rounded-t-full flex flex-col">
						<div className="w-full grow bg-[#CE4235] mt-40 md:mt-56 rounded-t-full"></div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default BrandColorsSection;
