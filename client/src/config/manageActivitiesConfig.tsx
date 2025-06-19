// File: src/config/manageActivitiesConfig.tsx

import React from "react";
import { RecentActivity } from "@customTypes/index";
import { Eye, Trash2 } from "lucide-react";

export interface ManageActivitiesConfig {
  pageTitle: string;
  tableColumns: {
    key: string;
    label: string;
    render?: (item: RecentActivity, idx?: number) => React.ReactNode;
    align?: string;
  }[];
}

/**
 * @param currentPage  1-based page index
 * @param limit        items per page
 * @param tab          one of "Leads"|"Meetings"|"Tasks"
 * @param onView       optional view handler (only for Leads)
 * @param onDelete     optional delete handler (only for Leads)
 */
export const manageActivitiesConfig = (
  currentPage: number,
  limit: number,
  tab: "Leads" | "Meetings" | "Tasks",
  onView?: (act: RecentActivity) => void,
  onDelete?: (act: RecentActivity) => void
): ManageActivitiesConfig => {
  // S.NO column
  const cols: ManageActivitiesConfig['tableColumns'] = [
    {
      key: "_idx",
      label: "S.NO",
      render: (_: RecentActivity, idx?: number) => (
        <span>{idx !== undefined ? (currentPage - 1) * limit + idx + 1 : ""}</span>
      ),
    },
  ];

  // Tab-specific columns
  if (tab === "Leads") {
    cols.push(
      {
        key: "name",
        label: "NAME",
        render: (a) => <span>{a.name || "-"}</span>,
      },
      {
        key: "company",
        label: "COMPANY",
        render: (a) => <span>{a.company || "-"}</span>,
      },
       {
        key: "description",
        label: "DESCRIPTION",
        render: (a) => <span>{a.description || "-"}</span>,
      },
      {
        key: "date",
        label: "DATE",
        render: (a) => <span>{new Date(a.date).toLocaleDateString()}</span>,
      }
    );
  } else if (tab === "Meetings") {
    cols.push(
      {
        key: "title",
        label: "TITLE",
        render: (a) => <span>{a.title || "-"}</span>,
      },
       {
        key: "description",
        label: "DESCRIPTION",
        render: (a) => <span>{a.description || "-"}</span>,
      },
      {
        key: "time",
        label: "DATE & TIME",
          render: (a) => <span>{new Date(a.time || a.date).toLocaleString()}</span>,
      },
      {
        key: "participants",
        label: "PARTICIPANTS",
        render: (a) =>
          a.participants?.length
            ? <span>{a.participants.join(", ")}</span>
            : <span className="text-gray-400 italic">-</span>,
      }
    );
  } else /* Tasks */ {
    cols.push(
      {
        key: "title",
        label: "TITLE",
        render: (a) => <span>{a.title || "-"}</span>,
      },
      {
        key: "assignee",
        label: "ASSIGNEE",
        render: (a) => <span>{a.assignee || "-"}</span>,
      },
       {
        key: "description",
        label: "DESCRIPTION",
        render: (a) => <span>{a.description || "-"}</span>,
      },
      {
        key: "status",
        label: "STATUS",
        render: (a) => <span>{a.status || "-"}</span>,
      }
    );
  }

  if (tab === "Leads" && (onView || onDelete)) {
    cols.push({
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (a) => (
        <div className="flex justify-end space-x-2">
          {onView && (
            <button
              className="text-gray-500 hover:text-gray-700 cursor-pointer cursor-pointer"
              onClick={() => onView(a)}
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              className="text-red-500 hover:text-red-700 cursor-pointer cursor-pointer"
              onClick={() => onDelete(a)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    });
  }

  return {
    pageTitle: "Recent Activity",
    tableColumns: cols,
  };
};
