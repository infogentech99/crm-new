"use client";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import { Project } from "@customTypes/index"; // Import Project interface

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectIndex: number;
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function ProjectSelector({
  projects = [],
  selectedProjectIndex,
  onSelect,
  onEdit,
  onDelete,
}: ProjectSelectorProps) {
  if (!projects.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">All Projects</h3>
      <div className="flex flex-wrap gap-3">
        {projects.map((project, index) => {
          const isSelected = index === selectedProjectIndex;
          const fullTitle = project.title || `Project ${index + 1}`;

          return (
            <div
              key={index}
              className={clsx(
                "inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 shadow-sm border text-sm ",
                isSelected
                  ? "bg-gradient-to-r from-gray-500 to-gray-700 text-white border-black font-semibold"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              )}
            >
              <button
                onClick={() => onSelect(index)}
                title={fullTitle}
                className="text-left whitespace-nowrap cursor-pointer"
              >
                {index + 1} - {fullTitle}
              </button>

              <div className="flex gap-2 items-center ml-3">
                <button
                  onClick={() => onEdit(index)}
                  className={clsx(
                    "cursor-pointer",
                    isSelected ? "text-white" : "text-gray-600 hover:text-blue-600"
                  )}
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className={clsx(
                    "cursor-pointer",
                    isSelected ? "text-white" : "text-gray-600 hover:text-red-600"
                  )}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
