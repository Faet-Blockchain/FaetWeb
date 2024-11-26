/* eslint-disable @next/next/no-img-element */
import React from "react";

const GuideLine = () => {
	return (
		<div className="px-3 my-5 max-w-6xl mx-auto">
			<img src="/images/line.png" alt="line" className="w-full" />
			<div className="flex justify-between">
				<p className="italic text-3xl">FAET</p>
				<p className="italic text-3xl">Design Guidelines</p>
			</div>
		</div>
	);
};

export default GuideLine;
