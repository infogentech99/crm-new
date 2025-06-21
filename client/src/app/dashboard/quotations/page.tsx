"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuotations, deleteQuotation } from '@services/quotationService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import { manageQuotationsConfig } from '@config/manageQuotationsConfig';
import Modal from '@components/Common/Modal';
import { Quotation } from '@customTypes/index';
import { Input } from '@components/ui/input';
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
import QuotationForm from '@components/Quotation/QuotationForm';
import DeleteModal from '@components/Common/DeleteModal';
import { useRouter } from 'next/navigation';

const ManageQuotationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const router = useRouter();
  const userRole = useSelector((state: RootState) => state.user.role || '');
  const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
     document.title = "Manage Quotations – CRM Application";
   }, []);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['allQuotations', search],
    queryFn: () => getQuotations(1, 10000, search),
    enabled: isMounted, // Only fetch data if mounted
  });

  const allQuotations = data?.quotations || [];
  const totalQuotations = allQuotations.length;
  const totalPages = Math.ceil(totalQuotations / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const quotationsToDisplay = allQuotations.slice(startIndex, endIndex);

  const handleViewQuotation = useCallback((quotation: Quotation) => {
    setSelectedQuotation(quotation);
    if (quotation?._id) {
      router.push(`/dashboard/quotations/${quotation._id}`)
    }
  }, [router]);

  const handleEditQuotation = useCallback((quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsQuotationOpen(true);
  }, []);

  const handleDeleteQuotation = useCallback((quotation: Quotation) => {
    setQuotationToDelete(quotation);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!quotationToDelete) return;

    try {
      await deleteQuotation(quotationToDelete._id);
      queryClient.invalidateQueries({ queryKey: ['allQuotations'] });
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setQuotationToDelete(null);
    }
  };

  const config = manageQuotationsConfig(handleViewQuotation, handleEditQuotation, handleDeleteQuotation, userRole, page, limit);

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
    return null; // Or a loading spinner, to prevent hydration mismatch
  }

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by quotation number or client name..."
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
          data={quotationsToDisplay}
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
          isOpen={isQuotationOpen}
          onClose={() => setIsQuotationOpen(false)}
          widthClass="max-w-5xl"
        >
          <QuotationForm
            mode="Edit"
            data={selectedQuotation}
            onClose={() => {
              setIsQuotationOpen(false);
              queryClient.invalidateQueries({ queryKey: ['allQuotations'] });
            }}
          />
        </Modal>

        {quotationToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setQuotationToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            itemLabel={quotationToDelete?.quotationNumber || 'this quotation'}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageQuotationsPage;
