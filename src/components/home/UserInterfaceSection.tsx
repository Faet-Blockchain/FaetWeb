/* eslint-disable @next/next/no-img-element */
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
				USER INTERFACE
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.75, ease: "easeInOut" }}
				className="text-lg my-5 max-w-5xl"
			>
				When building an expansive RPG consistency is an important
				factor. Keeping dialogue legible and interesting relies not only
				on the writing, but the way it presents to the player. This
				extends into all aspects of the game. Menus, Dialague, Combat,
				Inventory, all of these aspects need to be considered. To
				address this, we created the frame. With a unique magical yet
				hand-drawn feel, this speaks towards FAET&apos;s core philosophy
				of player expression through the variety of magic.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 140 }}
			>
				<img
					src="/images/ui1.png"
					alt="user-interface"
					width={1239}
					height={315}
					className="ml-auto my-10 md:my-20 md:max-w-4xl md:h-auto"
				/>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 30, scale: 0.8, rotate: -10 }}
				whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 140 }}
			>
				<img
					src="/images/ui2.png"
					alt="user-interface"
					width={997}
					height={326}
					className="my-10 md:my-20 md:max-w-3xl md:h-auto"
				/>
			</motion.div>
		</section>
	);
};

export default UserInterfaceSection;
