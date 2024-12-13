/* eslint-disable @next/next/no-img-element */
import React from "react";

const GuideLine = () => {
	return (
		<div className="px-3 my-5 max-w-6xl mx-auto">
			<img src="/images/line.png" alt="line" className="w-full" />
			<div className="flex flex-col items-center text-center sm:flex-row sm:justify-between">
				<p className="italic text-3xl">FAET</p>
				<p className="italic text-3xl">The Metaverse Engine</p>
			</div>

		</div>
	);
};

export default GuideLine;
