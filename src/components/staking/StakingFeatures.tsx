"use client";
import React from "react";
import { motion } from "framer-motion";

const StakingFeatures = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: "easeInOut", delay: 0.3 }}
      className="mt-12 grid md:grid-cols-3 gap-6"
    >
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-purple-400">
          Staking Rewards
        </h3>
        <p className="text-gray-300">
          Earn ERC-20 tokens as rewards for staking your FAET tokens and NFTs
          and participating in the ecosystem.
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">Game Utility</h3>
        <p className="text-gray-300">
          Unlock special in-game items, exclusive content, and early access to
          future NFT drops.
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-green-400">
          Future Benefits
        </h3>
        <p className="text-gray-300">
          Gain voting rights, reduced fees, and priority access to new features
          and games.
        </p>
      </div>
    </motion.div>
  );
};

export default StakingFeatures;
