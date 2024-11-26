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
              <p className="">&copy; 2024 FAET. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <NavLink href="/#home">Home</NavLink>
              <NavLink href="/#icon">Icon</NavLink>
              <NavLink href="/#colors">Colors</NavLink>
              <NavLink href="/#user-interface">User Interface</NavLink>
              <NavLink href="/#typography">Typography</NavLink>
              <NavLink href="/#manual">Manual</NavLink>
              <NavLink href="/#mockups">Mock-ups</NavLink>
              <NavLink href="/#team">Team</NavLink>
              <NavLink href="/#contact">Contact</NavLink>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className=" hover:text-white">
                <img src="/images/discord.png" alt="discord" />
              </a>
              <a href="#" className=" hover:text-white">
                <img src="/images/X.png" alt="X" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }

export default Footer
