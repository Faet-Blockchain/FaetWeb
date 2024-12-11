/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from "framer-motion";

const CommunitySection: React.FC = () => {
	return (
		<section id="contact" className="py-20 md:py-32 bg-[#CED6AE]/80 w-full">
			<div className="max-w-6xl mx-auto px-3">
				<div className="flex flex-col md:flex-row gap-12">
					{/* Left Column */}
					<div className="w-full md:w-1/2">
						<motion.h2
							initial={{ opacity: 0, y: -20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.75, ease: "easeInOut" }}
							className="text-black mb-6 text-5xl md:text-7xl font-nocturne-serif-bold"
						>
							Community
						</motion.h2>
						<motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, ease: "easeInOut" }}
                            className="text-neutral-800 mb-8">
                                Join our vibrant community of developers, designers,
                                and tech enthusiasts. Share ideas, get support, and
                                collaborate on exciting projects.
						</motion.p>
						<motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="flex space-x-4">
                                <a href="https://discord.gg/t88HmN52Nd">
                                    <img src="/images/discord.png" alt="discord" />
                                </a>
                                <a href="https://x.com/FaetStudio">
                                    <img src="/images/X.png" alt="X" />
                                </a>
						</motion.div>
					</div>

					{/* Right Column */}
					<motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, ease: "easeInOut" }}
                        className="w-full md:w-1/2">
                            <h3 className="text-2xl font-semibold mb-6 font-nocturne-serif-bold text-black">
                                Contact Us
                            </h3>
                            <form className="space-y-4">
                                <div>
                                    <input type="text" placeholder="Your Name" className="form-input" required/>
                                </div>
                                <div>
                                    <input type="email" placeholder="Your Email" className="form-input" required/>
                                </div>
                                <div>
                                    <textarea placeholder="Your Message" rows={4} className="form-textarea" required/>
                                </div>
                                <button type="submit" className="form-button">Send Message</button>
                            </form>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default CommunitySection;
