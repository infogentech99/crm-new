"use client";
import clsx from "clsx";

export default function ProjectSelector({
  projects = [],
  selectedProjectIndex,
  onSelect,
}) {
  if (!projects.length) return null;

  return (
    <div className="mb-6 space-x-2 space-y-2">
      <h3 className="text-xl font-bold mb-4 text-gray-800">All Project</h3>
        {projects.map((project, index) => {
          const isSelected = index === selectedProjectIndex;
          const fullTitle = project.title || `Project ${index + 1}`;
          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              title={fullTitle}
              className={clsx(
                "relative group cursor-pointer rounded-lg px-4 py-2 transition-all duration-200 shadow-sm",
                isSelected
                  ? "bg-gradient-to-r from-gray-500 to-gray-700 border-l-6 border-black text-white font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <span className="block">{index+1} - {fullTitle}</span>
            </button>
          );
        })}
    </div>
  );
}
