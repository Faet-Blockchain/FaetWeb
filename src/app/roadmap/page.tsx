import RoadMap from "@/components/roadmap/roadmap";
import Image from "next/image";
import RoadmapAnimation from "@/components/roadmap/RoadmapAnimation";
import GuideLine from "@/components/home/GuideLine";

export default function Home() {
    return (
        <RoadmapAnimation>
            <RoadMap />
            <Image
                src="/images/magic.png"
                alt="hero-img"
                width={733}
                height={706}  
                className="mx-auto h-64 md:h-[32rem] w-auto my-10 md:my-20 animate-[spin_20s_linear_infinite]"

            />
            <GuideLine />
        </RoadmapAnimation>
        
    );
}
