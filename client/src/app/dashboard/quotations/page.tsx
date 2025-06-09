"use client";

import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuotations, deleteQuotation } from '@services/quotationService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateQuotationButton from '@components/Common/CreateQuotationButton';
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
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious
} from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import QuotationForm from '@components/Quotation/QuotationForm';
import DeleteModal from '@components/Common/DeleteModal';

const ManageQuotationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewQuotation = useCallback((quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsModalOpen(true);
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setQuotationToDelete(null);
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['quotations', page, limit, search],
    queryFn: () => getQuotations(page, limit, search),
  });
  const quotations = data?.quotations || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const config = manageQuotationsConfig(handleViewQuotation, handleEditQuotation, handleDeleteQuotation, userRole, currentPage, limit);

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
          data={quotations}
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
          isOpen={isQuotationOpen}
          onClose={() => setIsQuotationOpen(false)}
          widthClass="max-w-5xl"
        >
          <QuotationForm
            mode="Edit"
            data={selectedQuotation}
            onClose={() => {
              setIsQuotationOpen(false);
              queryClient.invalidateQueries({ queryKey: ['quotations'] });
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
