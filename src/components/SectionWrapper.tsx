import React from "react";

const SectionWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div className="relative px-3 my-32 max-w-6xl mx-auto">{children}</div>;
};

export default SectionWrapper;