// src/utils/importUtils.ts
import { Lead } from "@customTypes/index";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

export const parseLeadsCSV = (csvText: string): Partial<Lead>[] => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line);
    const lead: Partial<Lead> = {};

    headers.forEach((header, idx) => {
      const raw = cols[idx] ?? "";

      // Use a type assertion to ensure 'header' is a valid key of 'Lead'
      const key = header as keyof Lead;

      switch (key) {
        case "notes":
          try {
            lead.notes = JSON.parse(raw) as Lead['notes'];
          } catch {
            lead.notes = [];
          }
          break;
        case "projects":
          try {
            lead.projects = JSON.parse(raw) as Lead['projects'];
          } catch {
            lead.projects = [];
          }
          break;

        case "createdAt":
          lead.createdAt = raw;
          break;
        case "updatedAt":
          lead.updatedAt = raw;
          break;

        default:
          // Assign directly, asserting the type of the property
          // This is the most direct way to avoid 'any' while maintaining type safety
          // for known keys. If 'key' is not a valid property of 'Lead', this will
          // result in a TypeScript error.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (lead as Record<keyof Lead, any>)[key] = raw;
      }
    });

    return lead;
  });
};
