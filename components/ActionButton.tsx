
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  children,
  variant = 'primary',
}) => {
  const baseClasses = "px-6 py-3 font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md";

  const variantClasses = {
    primary: "bg-[#ba0000] text-white hover:bg-[#f80000] focus:ring-[#f80000]/50",
    secondary: "bg-[#7c0000] text-white hover:bg-[#ba0000] focus:ring-[#ba0000]/50",
    tertiary: "bg-transparent text-[#f80000] hover:bg-[#3e0000] focus:ring-[#7c0000]/50 border border-[#7c0000]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};