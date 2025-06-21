"use client";

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import Image from 'next/image';   
import logoSrc from '@public/assets/img/companyLogo.webp';  

export default function Header() {
  const user = useSelector((state: RootState) => state.user.name);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Image
          src={logoSrc}
          alt="Your Company Name"
          width={120}      
          height={40}
          className="cursor-pointer"
          onClick={() => window.location.href = '/dashboard'}
        />
      </div>

      <div className="flex items-center">
        {user && <span className="mr-4 text-gray-700">Welcome, {user}!</span>}
      </div>
    </header>
  );
}
