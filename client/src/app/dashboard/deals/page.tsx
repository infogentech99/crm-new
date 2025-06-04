"use client";

import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeals } from '@services/dealService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateDealButton from '@components/Common/CreateDealButton';
import { manageDealsConfig } from '@config/manageDealsConfig';
import Modal from '@components/Common/Modal';
import { Deal } from '@customTypes/index';
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

const ManageDealsPage: React.FC = () => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewDeal = useCallback((deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  const handleEditDeal = useCallback((deal: Deal) => {
    alert(`Edit deal: ${deal.dealName}`);
    // Implement actual edit logic here
  }, []);

  const handleDeleteDeal = useCallback((deal: Deal) => {
    alert(`Delete deal: ${deal.dealName}`);
    // Implement actual delete logic here
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['deals', page, limit, search],
    queryFn: () => getDeals(page, limit, search),
  });

  const deals = data?.deals || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const config = manageDealsConfig(handleViewDeal, handleEditDeal, handleDeleteDeal, userRole, currentPage, limit);

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
          <CreateDealButton onClick={config.createDealButtonAction} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by deal name or company..."
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
          data={deals}
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
          {selectedDeal && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Deal Details</h2>
              <p>Deal Name: {selectedDeal.dealName}</p>
              <p>Amount: ${selectedDeal.amount.toFixed(2)}</p>
              <p>Stage: {selectedDeal.stage}</p>
              <p>Close Date: {new Date(selectedDeal.closeDate).toLocaleDateString()}</p>
              <p>Company: {selectedDeal.company || 'N/A'}</p>
              <p>Contact Person: {typeof selectedDeal.contactPerson === 'object' ? selectedDeal.contactPerson.name : selectedDeal.contactPerson || 'N/A'}</p>
              {/* Add more deal details as needed */}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageDealsPage;
