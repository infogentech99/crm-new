"use client";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string; 
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  widthClass = "max-w-3xl", 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${widthClass} mx-4 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
