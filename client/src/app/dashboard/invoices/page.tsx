"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteInvoice, getInvoices } from '@services/invoiceService';
import DataTable from '@components/Common/DataTable';
import { manageInvoicesConfig } from '@config/manageInvoicesConfig';
import Modal from '@components/Common/Modal';
import { Invoice } from '@customTypes/index';
import { Input } from '@components/ui/input';
import TransactionModal from '@components/Common/TransactionModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { PaginationComponent } from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@components/invoice/InoviceForm';
import DeleteModal from '@components/Common/DeleteModal';

const ManageInvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const userRole = useSelector((state: RootState) => state.user.role || '');


  useEffect(() => {
    document.title = "Manage Invoices – CRM Application";
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['allInvoices', search], 
    queryFn: () => getInvoices(1, 10000, search),
    enabled: isMounted, 
  });
  const allInvoices = data?.invoices || [];
console.log("All Invoices:", data);
const totalInvoices = allInvoices.length;
const totalPages = Math.ceil(totalInvoices / limit);
const startIndex = (page - 1) * limit;
const endIndex = startIndex + limit;
const invoicesToDisplay = allInvoices.slice(startIndex, endIndex);

  const handleViewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    if (invoice?._id) {
      router.push(`/dashboard/invoices/${invoice._id}`)
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
  const handleOpenTransactionModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsTransactionModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice(invoiceToDelete._id);
      queryClient.invalidateQueries({ queryKey: ['allInvoices'] });
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };
  const config = manageInvoicesConfig(handleViewInvoice, handleEditInvoice, handleDeleteInvoice, handleOpenTransactionModal, userRole, page, limit);

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

  if (!isMounted) {
    return null; 
  }

  return (
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
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
          data={invoicesToDisplay}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />

        <div className="mt-4 flex justify-end">
          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

          <Modal
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            widthClass="max-w-5xl"
          >
            <InvoiceForm
              mode="Edit"
              data={selectedInvoice}
              projectId=''
              onClose={() => {
                setIsInvoiceOpen(false);
                queryClient.invalidateQueries({ queryKey: ['allInvoices'] });
              }}
            />
          </Modal>
        {isTransactionModalOpen && selectedInvoice && (
          <TransactionModal
            selectedInvoice={{
              _id: selectedInvoice._id,
              totals: selectedInvoice.totals,
              paidAmount: selectedInvoice.paidAmount,
              user: selectedInvoice.user._id,
              projectId: selectedInvoice.projectId,
            }}
            onClose={() => {
              setIsTransactionModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['allInvoices'] });
              
            }}
          />
        )}

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
  );
};

export default ManageInvoicesPage;
