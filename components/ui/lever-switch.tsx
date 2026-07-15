import { cn } from "@/lib/utils";
import React from "react";

interface LeverSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const LeverSwitch = ({ checked, onChange, disabled, className }: LeverSwitchProps) => {
  return (
    <div className={cn("toggle-container", className, disabled && "opacity-50 cursor-not-allowed")}>
      <input 
        className="toggle-input" 
        type="checkbox" 
        checked={checked}
        onChange={(e) => {
          if (!disabled) {
            onChange(e.target.checked);
          }
        }}
        disabled={disabled}
      />
      <div className="toggle-handle-wrapper">
        <div className="toggle-handle">
          <div className="toggle-handle-knob"></div>
          <div className="toggle-handle-bar-wrapper">
            <div className="toggle-handle-bar"></div>
          </div>
        </div>
      </div>
      <div className="toggle-base">
        <div className="toggle-base-inside"></div>
      </div>
    </div>
  );
};
