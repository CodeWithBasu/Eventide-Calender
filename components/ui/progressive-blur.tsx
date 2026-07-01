import React from "react";

export type ProgressiveBlurProps = {
  className?: string;
  backgroundColor?: string;
  position?: "top" | "bottom" | "left" | "right";
  height?: string;
  width?: string;
  blurAmount?: string;
};

export const ProgressiveBlur = ({
  className = "",
  backgroundColor = "hsl(var(--background))",
  position = "top",
  height = "150px",
  width = "100%",
  blurAmount = "4px",
}: ProgressiveBlurProps) => {
  const isTop = position === "top";
  const isBottom = position === "bottom";
  const isLeft = position === "left";
  const isRight = position === "right";

  return (
    <div
      className={`pointer-events-none select-none z-10 ${className}`}
      style={{
        ...(isTop ? { top: 0, left: 0, width, height } : {}),
        ...(isBottom ? { bottom: 0, left: 0, width, height } : {}),
        ...(isLeft ? { top: 0, left: 0, width, height } : {}),
        ...(isRight ? { top: 0, right: 0, width, height } : {}),
        background: isTop
          ? `linear-gradient(to top, transparent, ${backgroundColor})`
          : isBottom
          ? `linear-gradient(to bottom, transparent, ${backgroundColor})`
          : isLeft
          ? `linear-gradient(to left, transparent, ${backgroundColor})`
          : `linear-gradient(to right, transparent, ${backgroundColor})`,
        maskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : isBottom
          ? `linear-gradient(to top, black 50%, transparent)`
          : isLeft
          ? `linear-gradient(to right, black 50%, transparent)`
          : `linear-gradient(to left, black 50%, transparent)`,
        WebkitMaskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : isBottom
          ? `linear-gradient(to top, black 50%, transparent)`
          : isLeft
          ? `linear-gradient(to right, black 50%, transparent)`
          : `linear-gradient(to left, black 50%, transparent)`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    />
  );
};
