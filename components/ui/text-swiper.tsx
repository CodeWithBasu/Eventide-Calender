"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CalendarDays } from "lucide-react";

// === FlipLink (animated text with vibrant colors) ===
const DURATION = 0.25;
const STAGGER = 0.025;

interface FlipLinkProps {
  children: string;
  href: string;
  className?: string;
}

export const FlipLink: React.FC<FlipLinkProps> = ({ children, href, className = "" }) => {
  return (
    <motion.a
      initial="initial"
      whileHover="hovered"
      href={href}
      className={`relative block overflow-hidden whitespace-nowrap font-bold uppercase bg-gradient-to-br from-indigo-900 to-[#c7d2fe] bg-clip-text text-transparent dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 transition-all duration-300 hover:scale-105 ${className}`}
      style={{ lineHeight: 0.9 }}
    >
      <div>
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block"
          >
            {l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {children.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i,
            }}
            className="inline-block bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300"
          >
            {l}
          </motion.span>
        ))}
      </div>
    </motion.a>
  );
};

export const EventideLogo = () => {
  return (
    <div className="group flex items-center justify-center gap-2 transition-all duration-300">
      <div className="transition-transform duration-500 group-hover:translate-x-1 group-hover:rotate-12 bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg text-white shadow-lg shadow-purple-500/20">
        <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <FlipLink href="/" className="text-2xl sm:text-3xl tracking-tight normal-case">
        Eventide
      </FlipLink>
    </div>
  );
};
