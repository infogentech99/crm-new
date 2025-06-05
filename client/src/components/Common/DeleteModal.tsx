// File: src/components/common/DeleteModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";

interface DeleteModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal (e.g. set isOpen to false) */
  onClose: () => void;
  /** Callback when user confirms the delete action */
  onConfirm: () => void;
  /** Text to display, e.g. name of the item being deleted */
  itemLabel?: string;
  /** Optional heading (defaults to “Confirm Delete”) */
  title?: string;
}

/**
 * A simple, reusable delete‐confirmation modal.
 *
 * Usage:
 *   <DeleteModal
 *     isOpen={isModalOpen}
 *     onClose={() => setIsModalOpen(false)}
 *     onConfirm={handleDelete}
 *     itemLabel={lead.name}
 *   />
 */
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
        {/* Header */}
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

        {/* Body */}
        <div className="px-4 py-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {itemLabel || "this item"}
            </span>
            ?
          </p>
        </div>

        {/* Footer Buttons */}
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
