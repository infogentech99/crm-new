import React from "react";

interface Props {
  children: React.ReactNode;
  required?: boolean;
}

export default function RequiredLabel({ children, required }: Props) {
  return (
    <label className="block text-sm font-medium mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}