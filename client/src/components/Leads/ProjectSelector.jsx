
"use client";
import { Button } from "@components/ui/button";

export default function ProjectSelector({
  projects = [],
  selectedProjectIndex,
  onSelect,
}) {
  if (!projects.length) return null;

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Select Project</h3>
      <div className="flex flex-wrap gap-2">
        {projects.map((project, index) => (
          <Button
            key={index}
            variant={index === selectedProjectIndex ? "default" : "outline"}
            onClick={() => onSelect(index)}
            className="capitalize"
          >
            {project.title || `Project ${index + 1}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
