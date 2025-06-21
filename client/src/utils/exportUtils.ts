// src/utils/exportUtils.ts
import { Lead } from "@customTypes/index";

function escapeCSV(value: any): string {
  if (value == null) return "";
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export const exportLeadsToCSV = (leads: Lead[]) => {
  if (!leads?.length) return;

  const headers = [
    "Sr. No",
    "Name",
    "Email",
    "Phone",
    "Created By",
    "Company",
    "Job Title",
    "Address",
    "City",
    "State",
    "Country",
    "Zip Code",
    "Website",
    "LinkedIn",
    "Source",
    "Industry",
    "Status",
    "GSTIN",
    "Best Time To Call",
    "Call Response",
    "Remark",
    "Created At",
    "Updated At",
    "Notes",
    "Project Title",
  ];

  const rows = leads.map((lead, idx) => {
    // Sr. No
    const srNo = idx + 1;

    // Created By → name
    const creator =
      typeof lead.createdBy === "object" && lead.createdBy
        ? (lead.createdBy as any).name
        : lead.createdBy;

    // Latest project title
    const lastProj = lead.projects?.[lead.projects.length - 1];
    const projectTitle = lastProj?.title || "";

    // Only note messages
    const noteMessages = (lead.notes || [])
      .map((n) => n.message || "")
      .filter((msg) => msg);

    const cells = [
      srNo,
      lead.name,
      lead.email,
      lead.phoneNumber,
      creator,
      lead.companyName || "",
      lead.jobTitle || "",
      lead.address || "",
      lead.city || "",
      lead.state || "",
      lead.country || "",
      lead.zipCode || "",
      lead.website || "",
      lead.linkedIn || "",
      lead.source || "",
      lead.industry || "",
      lead.status || "",
      lead.gstin || "",
      lead.bestTimeToCall || "",
      lead.callResponse || "",
      lead.remark || "",
      lead.createdAt,
      lead.updatedAt,
      JSON.stringify(noteMessages),
      projectTitle,
    ];

    return cells.map(escapeCSV).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads_export.csv";
  a.click();
};
