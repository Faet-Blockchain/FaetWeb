/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from 'react';
import Logo from './Logo';
import NavLink from './NavLink';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur z-50 shadow-sm shadow-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink href="/#home">Home</NavLink>
            <NavLink href="/roadmap" target="_blank">Roadmap</NavLink>
            <NavLink href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">
              Whitepaper
            </NavLink>
            <NavLink href="/#contact">Contact</NavLink>
            <NavLink href="https://discord.gg/t88HmN52Nd">
              <img
                src="/images/discord.png"
                alt="discord"
                width={35}
                height={35}
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
            <NavLink href="https://github.com/Faet-Blockchain">
              <img
                src="/images/github.png"
                alt="GitHub"
                width={28}
                height={28}
                className=""
              />
            </NavLink>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
