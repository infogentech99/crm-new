"use client";

import React, { useEffect } from 'react';

interface AuthCelebrationProps {
  onComplete: () => void;
}

const AuthCelebration: React.FC<AuthCelebrationProps> = ({ onComplete }) => {
  useEffect(() => {
    // Simulate a celebration animation or process
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Show celebration for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center text-2xl font-bold text-primary">
        Welcome! 🎉
      </div>
    </div>
  );
};

export default AuthCelebration;
