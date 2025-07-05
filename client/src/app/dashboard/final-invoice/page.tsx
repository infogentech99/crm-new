// src/app/dashboard/final-invoice/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@store/store";
import DataTable from "@components/Common/DataTable";
import { Input } from "@components/ui/input";
import { PaginationComponent } from "@components/ui/pagination";
import { manageFinalInvoiceConfig } from "@config/manageFinalInvoiceConfig";
import { getInvoices } from "@services/invoiceService";
import { FinalInvoice } from "@customTypes/index";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";

const ManageFinalInvoicesPage: React.FC = () => {
  const router = useRouter();
  const userRole = useSelector((state: RootState) => state.user.role || '');

  // Only allow superadmin & accounts
  const allowed = ["superadmin", "accounts"];
  const isAllowed = allowed.includes(userRole);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Redirect unauthorized users immediately after mount
  useEffect(() => {
    if (mounted && !isAllowed) {
      router.replace("/dashboard");
    }
  }, [mounted, isAllowed, router]);


  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["allFinalInvoices", search],
    queryFn: () => getInvoices(1, 10000, search),
    enabled: mounted && isAllowed,
  });
   
    
  

  const all = data?.invoices.filter((inv) => { 
       return inv.paidAmount === inv.totals.total;
  })|| [];
  
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

 const { pageTitle, tableColumns } = manageFinalInvoiceConfig(
  { onView: (inv) => router.push(`/dashboard/final-invoice/${inv.invoiceNumber || inv._id}`) },
  page,
  limit
);

 const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  useEffect(() => {
    document.title = `${pageTitle} – CRM Application`;
  }, [pageTitle]);

  if (!mounted || !isAllowed) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">{pageTitle}</h1>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search by invoice"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
         <Select onValueChange={handleLimitChange} value={String(limit)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
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
