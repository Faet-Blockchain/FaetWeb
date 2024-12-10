/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

type QuestCardProps = {
	title: string;
	description: string;
	color: string;
};

const QuestCard = ({ title, description, color }: QuestCardProps) => {
	return (
		<motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
         className="p-5 bg-stone-900/50 rounded-xl backdrop-blur relative overflow-hidden group">
			<div className={`absolute -top-7 -right-7 -z-10 h-20 w-20 ${color} rounded-full group-hover:scale-[1100%] transition-all duration-500`}></div>
			<h2 className="font-nocturne-serif-bold text-2xl">{title}</h2>
			<p>{description}</p>
		</motion.div>
	);
};

export default QuestCard;
