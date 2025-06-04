"use client";

import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '@services/invoiceService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateInvoiceButton from '@components/Common/CreateInvoiceButton';
import { manageInvoicesConfig } from '@config/manageInvoicesConfig';
import Modal from '@components/Common/Modal';
import { Invoice } from '@customTypes/index';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

const ManageInvoicesPage: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleEditInvoice = useCallback((invoice: Invoice) => {
    alert(`Edit invoice: ${invoice.invoiceNumber}`);
    // Implement actual edit logic here
  }, []);

  const handleDeleteInvoice = useCallback((invoice: Invoice) => {
    alert(`Delete invoice: ${invoice.invoiceNumber}`);
    // Implement actual delete logic here
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', page, limit, search],
    queryFn: () => getInvoices(page, limit, search),
  });

  const invoices = data?.invoices || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const config = manageInvoicesConfig(handleViewInvoice, handleEditInvoice, handleDeleteInvoice, userRole, currentPage, limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1); // Reset to first page on limit change
  };

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
          <CreateInvoiceButton onClick={config.createInvoiceButtonAction} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={handleSearchChange}
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

        <DataTable
          columns={config.tableColumns}
          data={invoices}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />

        <div className="mt-4 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(i + 1); }}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
              </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e: React.MouseEvent) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {selectedInvoice && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
              <p>Invoice Number: {selectedInvoice.invoiceNumber}</p>
              <p>Client Name: {selectedInvoice.clientName}</p>
              <p>Client Email: {selectedInvoice.clientEmail}</p>
              <p>Total Amount: ${selectedInvoice.totalAmount.toFixed(2)}</p>
              <p>Status: {selectedInvoice.status}</p>
              <p>Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
              <p>Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              {selectedInvoice.relatedQuotation && <p>Related Quotation: {selectedInvoice.relatedQuotation}</p>}
              {/* Display items */}
              <h3 className="text-lg font-semibold mt-4 mb-2">Items:</h3>
              {selectedInvoice.items.length > 0 ? (
                <ul>
                  {selectedInvoice.items.map((item, index) => (
                    <li key={index} className="mb-1">
                      {item.name} (x{item.quantity}) - ${item.unitPrice.toFixed(2)} each = ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items in this invoice.</p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageInvoicesPage;
