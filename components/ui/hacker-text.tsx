"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const HackerText = ({ text, className }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      let iteration = 0;
      let interval: NodeJS.Timeout | null = null;

      const animate = () => {
        if (interval) clearInterval(interval);
        
        interval = setInterval(() => {
          setDisplayText(
            text
              .split("")
              .map((letter, index) => {
                if (index < iteration) {
                  return text[index];
                }
                return letters[Math.floor(Math.random() * 26)];
              })
              .join("")
          );
          
          if (iteration >= text.length) {
            if (interval) clearInterval(interval);
            setHasAnimated(true);
          }
          
          iteration += 1 / 3;
        }, 30);
      };

      animate();

      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (!isInView) {
      setHasAnimated(false);
      setDisplayText(
        text
          .split("")
          .map(() => letters[Math.floor(Math.random() * 26)])
          .join("")
      );
    }
  }, [isInView, text, hasAnimated]);

  return (
    <h2 ref={ref} className={className}>
      {displayText}
    </h2>
  );
};
