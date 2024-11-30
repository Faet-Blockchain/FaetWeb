/* eslint-disable @next/next/no-img-element */
"use client";
import BrandColorsSection from "@/components/home/BrandColorsSection";
import CommunitySection from "@/components/home/CommunitySection";
import FaetIconSection from "@/components/home/FaetIconSection";
import GuideLine from "@/components/home/GuideLine";
import HeroSection from "@/components/home/HeroSection";
import MagicSection from "@/components/home/MagicSection";
import ManualSection from "@/components/home/ManualSection";
import SizingAndVarientsSection from "@/components/home/SizingAndVarientsSection";
import TeamsSection from "@/components/home/TeamsSection";
import TypographySection from "@/components/home/TypographySection";
import UserInterfaceSection from "@/components/home/UserInterfaceSection";
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react";

export default function Home() {
	const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
	return (
		<div ref={ref} className="relative font-nocturne-serif-regular">
			<motion.div
				style={{
					backgroundImage: "url('/images/bg.jpg')",
					backgroundPosition: "bottom",
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					y: backgroundY
				}}
				className="fixed top-[-200%] left-0 h-[350%] inset-0 -z-20 pt-14"
				id="home"
			>
			</motion.div>
			<motion.div
				style={{
					y: backgroundY
				}}
				className="fixed top-[-200%] left-0 h-[350%] inset-0 -z-10 pt-14 bg-black/50"
				id="home"
				ref={ref}
			>
			</motion.div>
			<GuideLine />
			<HeroSection />
			<SizingAndVarientsSection />
			<FaetIconSection />
			<BrandColorsSection />
			<UserInterfaceSection />
			<TypographySection />
			<MagicSection />
			<ManualSection />
			<TeamsSection />
			<CommunitySection />

			<section className="px-3 mt-80 mb-40 max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 30, scale: 0, rotate: -15 }}
					whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 100 }}
				>
					<img
					src="/images/hero-image.png"
					alt="hero-img"
					width={1134}
					height={428}
					className="mx-auto md:h-96 md:w-auto my-10 md:mb-20 md:mt-10"
					/>
				</motion.div>
			</section>

			<GuideLine />
		</div>
	);
}
