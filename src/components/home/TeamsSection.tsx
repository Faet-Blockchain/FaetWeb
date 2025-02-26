/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { motion } from 'framer-motion';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  imageUrl: string;
  xUrl: string;
}

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Ultrafresh', role: 'CEO', imageUrl: 'https://pbs.twimg.com/profile_images/1294319297519550465/HFhUHBc4_400x400.jpg', xUrl:'https://x.com/1ultrafresh' },
  { id: 2, name: 'Suepaphly', role: 'CTO', imageUrl: 'https://pbs.twimg.com/profile_images/1892735466845171712/B2NCDpDr_400x400.jpg', xUrl:'https://x.com/suepaphly'  },
  { id: 3, name: 'TacoSupreme', role: 'Lead Game Developer', imageUrl: 'https://pbs.twimg.com/profile_images/1863785886501965824/0GZ2poqA_400x400.jpg', xUrl:'https://x.com/TacauxSupreme'  }
];

const collaborators: TeamMember[] = [
  { id: 1, name: 'Coffee_Chan', role: 'Plugin Developer', imageUrl: 'https://pbs.twimg.com/profile_images/1886781933730033664/TCGcLPZ2_400x400.jpg', xUrl:'https://x.com/coffeenahc'  },
  { id: 2, name: 'Alessandro', role: 'Pixel Artist', imageUrl: 'https://pbs.twimg.com/profile_images/1698563225179004928/RQGSi8yK_400x400.jpg', xUrl:'https://x.com/The_Power_Green'  },
  { id: 3, name: 'StudioQuiet', role: 'Artist', imageUrl: 'https://pbs.twimg.com/profile_images/1823846485487747073/KpUv8Vni_400x400.jpg', xUrl:'https://x.com/CRTOGRPHR'  },
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
                <a href={member.xUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="h-80 transition-all duration-300 hover:opacity-90 object-cover object-center w-full"
                  />
                </a>
                <div className="p-6 bg-neutral-950 text-white">
                  <h3 className="text-2xl font-nocturne-serif-bold mb-2">{member.name}</h3>
                  <p className="text-lg text-neutral-300">{member.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <br />
      <hr />
      <br />
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeInOut" }}
          className="text-5xl md:text-7xl font-nocturne-serif-bold"
        >
          Collaborators
        </motion.h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 my-10">
          {collaborators.map((member, index) => (
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
                <a href={member.xUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="h-80 transition-all duration-300 hover:opacity-90 object-cover object-center w-full"
                  />
                </a>
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
