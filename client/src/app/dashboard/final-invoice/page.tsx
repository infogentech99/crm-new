// src/app/dashboard/final-invoice/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@components/Common/DataTable";
import { Input } from "@components/ui/input";
import { PaginationComponent } from "@components/ui/pagination";
import { manageFinalInvoiceConfig } from "@config/manageFinalInvoiceConfig";
import { getInvoices } from "@services/invoiceService";
import { FinalInvoice } from "@customTypes/index";
import { useRouter } from "next/navigation";

const ManageFinalInvoicesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["allInvoices", search],
    queryFn: () => getInvoices(1, 10000, search),
    enabled: mounted,
  });

  const all = data?.invoices || [];

  // Safe `.toLowerCase()` on possibly undefined fields
  const filtered = all.filter((inv) => {
    const invoiceNum = String(inv.invoiceNumber || inv._id).toLowerCase();
    const clientName = (inv.clientName || "").toLowerCase();
    return (
      invoiceNum.includes(search.toLowerCase()) ||
      clientName.includes(search.toLowerCase())
    );
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pageData = filtered.slice(start, start + limit);
  const router = useRouter();

 const { pageTitle, tableColumns } = manageFinalInvoiceConfig(
  { onView: (inv) => router.push(`/dashboard/final-invoice/${inv.invoiceNumber || inv._id}`) },
  page,
  limit
);



  useEffect(() => {
    document.title = `${pageTitle} – CRM Application`;
  }, [pageTitle]);

  if (!mounted) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">{pageTitle}</h1>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search by invoice # or client..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable<FinalInvoice>
        columns={tableColumns}
        data={pageData}
        isLoading={isLoading}
        error={isError ? (error as Error).message : null}
      />

      <div className="mt-4 flex justify-end">
        <PaginationComponent
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ManageFinalInvoicesPage;
