// page.tsx (No "use client" at the top)
import GuideLine from "@/components/home/GuideLine";
import HeroSection from "@/components/home/HeroSection";
//import SizingAndVarientsSection from "@/components/home/SizingAndVarientsSection";
import FaetIconSection from "@/components/home/FaetIconSection";
import Partners from "@/components/home/Partners";
import BrandColorsSection from "@/components/home/BrandColorsSection";
import UserInterfaceSection from "@/components/home/UserInterfaceSection";
import TypographySection from "@/components/home/TypographySection";
import MagicSection from "@/components/home/MagicSection";
import ManualSection from "@/components/home/ManualSection";
import TeamsSection from "@/components/home/TeamsSection";
import CommunitySection from "@/components/home/CommunitySection";
import HeroAnimation from "@/components/home/HeroAnimation";
import AnimatedImageSection from "@/components/home/AnimatedImageSection";
import SectionWrapper from "@/components/SectionWrapper";

export default function Home() {
	return (
		<HeroAnimation>
			<HeroSection />
			<Partners />

			<SectionWrapper>
			<FaetIconSection />
			<BrandColorsSection />
			<UserInterfaceSection />
			</SectionWrapper>

			<TypographySection />

			<SectionWrapper>
			<MagicSection />
			<ManualSection />
			</SectionWrapper>
			
			<TeamsSection />
			<CommunitySection />
			
			<section className="px-3 mt-80 mb-40 max-w-6xl mx-auto">
				<AnimatedImageSection />
			</section>

			<GuideLine />
		</HeroAnimation>
	);
}
