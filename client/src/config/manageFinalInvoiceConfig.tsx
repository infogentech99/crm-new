// src/config/manageFinalInvoiceConfig.tsx

import { FinalInvoice } from "@customTypes/index";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import React from "react";
import { DataTableProps } from "@components/Common/DataTable";

// Define the shape of the callbacks you’ll pass in
export interface ManageFinalInvoiceConfigParams {
  onView: (invoice: FinalInvoice) => void;
}

export const manageFinalInvoiceConfig = (
  { onView }: ManageFinalInvoiceConfigParams,
  currentPage: number,
  limit: number
): {
  pageTitle: string;
  tableColumns: DataTableProps<FinalInvoice>["columns"];
} => {
  const cols: DataTableProps<FinalInvoice>["columns"] = [
    {
      key: "_id",
      label: "S.NO",
      render: (_inv, idx) => (
        <span>
          {idx !== undefined ? (currentPage - 1) * limit + idx + 1 : ""}
        </span>
      ),
    },
    {
      key: "invoiceNumber",
      label: "INVOICE NO",
      render: (inv) => <span>{inv.invoiceNumber || inv._id}</span>,
    },
    // {
    //   key: "clientName",
    //   label: "CLIENT",
    //   render: (inv) => (
    //     <span>{inv.clientName || "N/A"}</span>
    //   ),
    // },

    {
          key: 'projectId',
          label: 'PROJECT TITLE',
          render: (item: FinalInvoice) => {
            const project = item.user?.projects?.find(
              (p) => p._id === item.projectId
            );
            return <span>{project?.title ?? 'N/A'}</span>;
          },
        },
    {
      key: "issuedAt",
      label: "ISSUE DATE",
      render: (inv) => (
        <span>
          {inv.createdAt
            ? dayjs(inv.createdAt).format("DD/MM/YYYY hh:mm A")
            : "-"}
        </span>
      ),
    },
    {
      key: "total",
      label: "TOTAL (₹)",
      render: (inv) => (
        <span>₹{(inv.totals?.total ?? 0).toFixed(2)}</span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (inv) => (
        <button
          onClick={() => onView(inv)}
          className="text-gray-600 hover:text-gray-800 cursor-pointer"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return {
    pageTitle: "Manage Final Invoices",
    tableColumns: cols,
  };
};
