import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-3xl text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f80000] to-[#ba0000] mb-2">
        CleanseAI
      </h1>
      <p className="text-lg text-gray-400">
        Upload an image, describe what to remove, and let our AI cleanse it while preserving every detail.
      </p>
    </header>
  );
};