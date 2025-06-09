// File: src/components/common/DeleteModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemLabel?: string;
  title?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemLabel = "",
  title = "Confirm Delete",
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-100 mx-4">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-lg font-medium text-gray-800 no-wrap">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-red-500 rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete
            <span className="font-semibold text-gray-900">
              {itemLabel || "this item"}
            </span>
            ?
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t px-4 py-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              toast.success(`Deleted ${itemLabel || "item"} successfully`);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
