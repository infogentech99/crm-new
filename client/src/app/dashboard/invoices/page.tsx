"use client";

import React, { useCallback, useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { deleteInvoice, getInvoices } from '@services/invoiceService';
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
import { useRouter } from 'next/navigation';
import InvoiceForm from '@components/invoice/InoviceForm';
import DeleteModal from '@components/Common/DeleteModal';

const ManageInvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
   const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewInvoice = useCallback((invoice: Invoice) => {
     setSelectedInvoice(invoice);
   if (invoice?._id) {
    router.push(`/dashboard/invoice/${invoice._id}`)
   }
  }, [router]);

  const handleEditInvoice = useCallback((invoice: Invoice) => {
      setSelectedInvoice(invoice);
      setIsInvoiceOpen(true);
  }, []);

  const handleDeleteInvoice = useCallback((invoice: Invoice) => {
   setInvoiceToDelete(invoice);
   setIsDeleteModalOpen(true);
     
  }, []);
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice(invoiceToDelete._id);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };
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
    setPage(1); 
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
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

           <Modal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          widthClass="max-w-5xl"
        >
          <InvoiceForm
            mode="Edit"
            data={selectedInvoice}
            onClose={() => {
              setIsInvoiceOpen(false);
              queryClient.invalidateQueries({ queryKey: ['invoices'] });
            }}
          />
        </Modal>
          {invoiceToDelete && (
                  <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                      setIsDeleteModalOpen(false);
                      setInvoiceToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    itemLabel={invoiceToDelete?.invoiceNumber || 'this quotation'}
                  />
                )}
      </div>
    </DashboardLayout>
  );
};

export default ManageInvoicesPage;
