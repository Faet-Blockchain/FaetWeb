/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import NavLink from "./NavLink";

const Footer = () => {
    return (
      <footer className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
            <p className="">&copy; {new Date().getFullYear()} FAET. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">              
              <NavLink href="/#home">Home</NavLink>
              <NavLink href="/roadmap">Roadmap</NavLink>
              <NavLink href="/#contact">Contact</NavLink>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
            <NavLink href="https://discord.gg/t88HmN52Nd">
              <img
                src="/images/discord.png"
                alt="discord"
                width={48}
                height={48}
                className=""
              />
            </NavLink>
            <NavLink href="https://x.com/FaetStudio">
              <img
                src="/images/X.png"
                alt="X"
                width={48}
                height={48}
                className=""
              />
            </NavLink>
            <NavLink href="https://github.com/FaetStudio">
              <img
                src="/images/github.png"
                alt="GitHub"
                width={38}
                height={38}
                className="mt-1"
              />
            </NavLink>
            </div>
          </div>
        </div>
      </footer>
    )
  }

export default Footer
