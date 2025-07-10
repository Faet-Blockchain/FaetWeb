/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { Timeline } from "@/components/roadmap/timeline";
import QuestCard from "./QuestCard";
import { motion } from "framer-motion";

export default function RoadMap() {
  const data = [
    {
      title: "1. Initial Set Launch",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Launch the first NFT set, establishing Faet’s platform and engaging early adopters.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="NFT Minting" color="bg-blue-600" description="Release the initial set, allowing users to mint exclusive digital assets that form the foundation of the Faet metaverse."/>
            <QuestCard title="Developer & Community Onboarding" color="bg-purple-600" description="Begin community-building activities, including AMAs and workshops, to introduce users and developers to Faet’s features and ecosystem."/>
          </div>
        </div>
      ),
    },
    {
      title: "2. ERC-20 Airdrop to NFT Holders",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Reward early NFT holders with an ERC-20 token airdrop, promoting engagement and participation.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="Token Airdrop" color="bg-orange-600" description="Distribute Faet ERC-20 tokens to all holders of the initial NFT set."/>
            <QuestCard title="Token Usage" color="bg-red-600" description="Enable basic token functionality for use in the Faet ecosystem including staking and rewards. With potential for additional utility and governance."/>
          </div>
        </div>
      ),
    },
    {
      title: "3. Advanced Feature Integrations (Token Integration, NFT Trading)",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Expand the platform&apos;s utility by adding token integration and an in-game
            player-to-player NFT trading/offer system.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="ERC-20 Token Integration" color="bg-blue-600" description="Introduce Faet’s ERC-20 token for in-game transactions and rewards."/>
            <QuestCard title="In-Game Player-to-Player NFT Trading/Offer System" color="bg-purple-600" description="Launch a trading system that allows users to create and accept offers for NFTs directly within the game, facilitating secure and seamless exchanges."/>
            <QuestCard title="Developer Access to Token Tools" color="bg-red-600" description="Provide tools and resources for developers to integrate tokens and NFTs into their games seamlessly."/>
          </div>
        </div>
      ),
    },
    {
      title: "4. Public Multiplayer",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Introduce multiplayer functionality to support real-time, player-to-player
            interactions within the Faet metaverse.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="Multiplayer Integration" color="bg-orange-600" description="Enable multiplayer interactions for the Faet platform, allowing players to interact, trade, and play within shared digital environments."/>
            <QuestCard title="Community Multiplayer Events" color="bg-red-600" description="Host events to showcase multiplayer capabilities, fostering engagement and community bonding in the Faet ecosystem."/>
          </div>
        </div>
      ),
    },
    {
      title: "5. Platform Launch: Sell and Promote Your Games on Our Web3 RPGMaker Game Platform",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Establish Faet as a Web3-based alternative for creators to publish, sell, and
            promote games.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="Platform Rollout" color="bg-blue-600" description="Launch Faet’s game marketplace, allowing creators to publish games built on popular low-code design tools like RPGMaker, without the limitations on NFTs and Web3 functionality."/>
            <QuestCard title="Game Sales & Promotions" color="bg-purple-600" description="Enable developers to monetize their games through Web3 integrations, positioning Faet as the 'Steam of Crypto' and opening new opportunities for creators in the decentralized gaming ecosystem."/>
          </div>
        </div>
      ),
    },
    {
      title: "6. Staking/ Locking",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Introduce staking and locking features to increase user engagement and
            ecosystem stability.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="NFT Locking Mechanism" color="bg-orange-600" description="Enable NFT holders to lock their assets for exclusive in-platform benefits and rewards."/>
            <QuestCard title="Staking Rewards" color="bg-red-600" description="Implement staking rewards in ERC-20 tokens for locked NFTs, incentivizing users to participate actively."/>
            <QuestCard title="Advanced Token Utilities" color="bg-amber-600" description="Allow staked tokens to unlock special in-game items, exclusive content, and early access to future NFT drops."/>
          </div>
        </div>
      ),
    },
    {
      title: "7. Cross-Chain Integration",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Expand Faet’s reach and interoperability by supporting cross-chain
            compatibility.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="Cross-Chain Asset Management" color="bg-blue-600" description="Integrate compatibility with additional EVM-compatible chains, enabling broader accessibility for users and their assets."/>
            <QuestCard title="Cross-Chain NFT and Token Transfers" color="bg-purple-600" description="Allow users to transfer assets seamlessly across supported chains, enhancing Faet’s utility and appeal in the decentralized gaming space."/>
            <QuestCard title="Developer Tools for Cross-Chain Games" color="bg-red-600" description="Equip developers with tools to create cross-chain-compatible games, fostering more expansive and interconnected digital experiences."/>
          </div>
        </div>
      ),
    },
    {
      title: "8. Competitive Tournaments and Governance",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Strengthen community engagement and integrate governance by hosting
            regular competitive tournaments, empowering players to influence the platform.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="Competitive Tournaments" color="bg-orange-600" description="Host recurring tournaments that allow players to compete in various games within the Faet ecosystem."/>
            <QuestCard title="On-Chain Rewards" color="bg-red-600" description="Offer on-chain rewards, including NFT and ERC-20 tokens, as prizes for top performers, encouraging active participation."/>
            <QuestCard title="Governance Opportunities" color="bg-amber-600" description="Provide tournament winners and top players with governance privileges, allowing them to participate in decision-making processes that impact the Faet platform."/>
            <QuestCard title="Community Engagement" color="bg-lime-600" description="Build community-focused events around tournaments, fostering camaraderie, competitive spirit, and long-term loyalty within the Faet user base."/>
          </div>
        </div>
      ),
    },
    {
      title: "9. AI Generative Asset Support Tools",
      content: (
        <div>
          <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
           className="mb-8 text-lg md:text-xl">
            Enable developers to create entire games within Faet with minimal external
            resources by providing AI-powered generative tools.
          </motion.p>
          <div className="grid lg:grid-cols-2 gap-4">
            <QuestCard title="AI-Generated Tilesets and Sprite Sets" color="bg-blue-600" description="Offer tools that generate custom tilesets and sprite assets, allowing creators to develop unique visual elements for their games."/>
            <QuestCard title="NFT Set Generation" color="bg-purple-600" description="Provide AI capabilities to design NFT collections, making it easy to launch in-game assets and collectibles that align with a game’s aesthetic and lore."/>
            <QuestCard title="Dialogue and Story Generation" color="bg-red-600" description="Integrate AI tools to help generate engaging dialogue, plot lines, and character backstories, facilitating immersive storytelling with minimal manual input."/>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
