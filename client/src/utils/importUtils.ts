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

      switch (header) {
        case "notes":
        case "projects":
          try {
            (lead as any)[header] = JSON.parse(raw);
          } catch {
            (lead as any)[header] = [];
          }
          break;

        case "createdAt":
        case "updatedAt":
          (lead as any)[header] = raw;
          break;

        default:
          (lead as any)[header] = raw;
      }
    });

    return lead;
  });
};
