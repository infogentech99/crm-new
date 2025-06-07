"use client";

import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuotations } from '@services/quotationService';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

const ManageQuotationsPage: React.FC = () => {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewQuotation = useCallback((quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuotation(null);
  };

  const handleEditQuotation = useCallback((quotation: Quotation) => {
    alert(`Edit quotation: ${quotation.quotationNumber}`);
  
  }, []);

  const handleDeleteQuotation = useCallback((quotation: Quotation) => {
    alert(`Delete quotation: ${quotation.quotationNumber}`);
   
  }, []);

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
          <CreateQuotationButton onClick={config.createQuotationButtonAction} />
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

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {selectedQuotation && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Quotation Details</h2>
              <p>Quotation Number: {selectedQuotation.quotationNumber}</p>
              <p>Client Name: {selectedQuotation.clientName}</p>
              <p>Client Email: {selectedQuotation.clientEmail}</p>
              <p>Total Amount: ${selectedQuotation.totalAmount.toFixed(2)}</p>
              <p>Status: {selectedQuotation.status}</p>
              <p>Issue Date: {new Date(selectedQuotation.issueDate).toLocaleDateString()}</p>
              <p>Valid Until: {new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
              {/* Display items */}
              <h3 className="text-lg font-semibold mt-4 mb-2">Items:</h3>
              {selectedQuotation.items.length > 0 ? (
                <ul>
                  {selectedQuotation.items.map((item, index) => (
                    <li key={index} className="mb-1">
                      {item.name} (x{item.quantity}) - ${item.unitPrice.toFixed(2)} each = ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items in this quotation.</p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageQuotationsPage;
