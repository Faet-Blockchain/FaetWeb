/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion } from "framer-motion";
import { InfiniteMovingCards } from "../roadmap/infinite-moving-cards";

const Partners = () => {
    const partners1 = [
        "binance.jpg",
        "chainalysis.jpg",
        "dmail.jpg",
        "fireblocks.jpg",
        "gelato.jpg",
        "hyperline.jpg",
        "kruuu.jpg",
        "layerZero.jpg",
        "moonpay.jpg",
        "moralis.jpg",
        "owlto.jpg",
        "quicknode.jpg",
        "rbg.jpg",
        "redstone.jpg",
        "tenderly.jpg"
    ]
    const partners2 = [
        "binance.jpg",
        "chainalysis.jpg",
        "dmail.jpg",
        "fireblocks.jpg",
        "gelato.jpg",
        "hyperline.jpg",
        "kruuu.jpg",
        "layerZero.jpg",
        "moonpay.jpg",
        "moralis.jpg",
        "owlto.jpg",
        "quicknode.jpg",
        "rbg.jpg",
        "redstone.jpg",
        "tenderly.jpg"
    ]
    const partners3 = [
        "dmail.jpg",
        "hyperline.jpg",
        "binance.jpg",
        "fireblocks.jpg",
        "moonpay.jpg",
        "chainalysis.jpg",
        "layerZero.jpg",
        "owlto.jpg",
        "quicknode.jpg",
        "gelato.jpg",
        "kruuu.jpg",
        "rbg.jpg",
        "moralis.jpg",
        "tenderly.jpg",
        "redstone.jpg",
    ]
	return (
		<section id="typography" className="py-32 bg-white w-full">
			<div className="max-w-6xl mx-auto px-3">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, ease: "easeInOut" }}
					className="text-black text-5xl md:text-7xl font-nocturne-serif-bold mb-10"
				>
					Who we work with
				</motion.h1>
                <InfiniteMovingCards
                    items={partners1}
                    direction="right"
                    speed="slow"
			    />
                <InfiniteMovingCards
                    items={partners2}
                    direction="left"
                    speed="slow"
                />
                <InfiniteMovingCards
                    items={partners3}
                    direction="right"
                    speed="slow"
                />
			</div>
		</section>
	);
};

export default Partners;
