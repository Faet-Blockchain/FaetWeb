/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from 'framer-motion';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
}

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Ultrafresh', role: 'CEO', imageUrl: 'https://pbs.twimg.com/profile_images/1294319297519550465/HFhUHBc4_400x400.jpg' },
  { id: 2, name: 'Suepaphly', role: 'CTO', imageUrl: 'https://pbs.twimg.com/profile_images/1359977556909424645/bel2KDgi_400x400.jpg' },
  { id: 3, name: 'TacoSupreme', role: 'Lead Game Developer', imageUrl: 'https://pbs.twimg.com/profile_images/1863785886501965824/0GZ2poqA_400x400.jpg' },
  { id: 4, name: 'Coffee_Chan', role: 'Plugin Developer', imageUrl: 'https://pbs.twimg.com/profile_images/1573155475793022976/c_XzW-OC_400x400.jpg' },
  { id: 5, name: 'Alessandro', role: 'Pixel Artist', imageUrl: 'https://pbs.twimg.com/profile_images/1698563225179004928/RQGSi8yK_400x400.jpg' },
  { id: 6, name: 'StudioQuiet', role: 'Artist', imageUrl: 'https://pbs.twimg.com/profile_images/1823846485487747073/KpUv8Vni_400x400.jpg' },
];

const TeamsSection = () => {
  return (
    <section id="team" className="px-3 mt-52 mb-32 max-w-6xl mx-auto">
      <div className="container mx-auto px-4">
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            className="text-5xl md:text-7xl font-nocturne-serif-bold"
        >
			Our Team
		</motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 my-10">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                 duration: 0.3,
                 ease: "easeInOut"
              }}
              className="rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="w-full">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="h-80 transition-all duration-300 hover:opacity-90 object-cover object-center w-full"
                />
                <div className="p-6 bg-neutral-950 text-white">
                    <h3 className="text-2xl font-nocturne-serif-bold mb-2">{member.name}</h3>
                    <p className="text-lg text-neutral-300">{member.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;

