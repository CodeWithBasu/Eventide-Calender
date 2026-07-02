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
    <div className="group flex items-center justify-center gap-3 transition-all duration-300">
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 group-hover:scale-105" style={{ perspective: "1000px" }}>
        <motion.div 
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white border-t border-l border-white/20 z-10"
          initial={{ rotateX: 10, rotateY: -10 }}
          whileHover={{ rotateX: 0, rotateY: 0, z: 10, x: -2, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ transformStyle: "preserve-3d", boxShadow: "2px 2px 0px #4338ca, 4px 4px 0px #3730a3, 6px 6px 15px rgba(0,0,0,0.4)" }}
        >
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" style={{ transform: "translateZ(10px)" }} />
        </motion.div>
      </div>
      <FlipLink href="/" className="text-2xl sm:text-3xl tracking-tight normal-case pl-1">
        Eventide
      </FlipLink>
    </div>
  );
};
