"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBoxes = ({
  className,
  r = 15,
  c = 15,
}: {
  className?: string;
  r?: number;
  c?: number;
}) => {
  const colsArray = new Array(c).fill(1);
  const rowsArray = new Array(r).fill(1);

  return (
    <div className={cn("relative z-0 flex w-full h-full justify-center overflow-hidden", className)}>
      {colsArray.map((_, i) => (
        <div
          key={`col-${i}`}
          className="md:w-12 sm:h-12 w-9 h-9 border-neutral-200 dark:border-neutral-900/50 flex flex-col shrink-0"
        >
          {rowsArray.map((_, j) => (
            <motion.div
              key={`row-${j}`}
              whileHover={{
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              className={cn(
                "md:w-12 sm:h-12 w-9 h-9 border-r border-t border-neutral-200 dark:border-neutral-900/50 relative shrink-0",
                j === rowsArray.length - 1 ? "border-b" : "",
                i === 0 ? "border-l" : ""
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
