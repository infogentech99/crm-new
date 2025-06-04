"use client";

import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBills } from '@services/billService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateBillButton from '@components/Common/CreateBillButton';
import { manageBillsConfig } from '@config/manageBillsConfig';
import Modal from '@components/Common/Modal';
import { Bill } from '@customTypes/index';
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

const ManageBillsPage: React.FC = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewBill = useCallback((bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  const handleEditBill = useCallback((bill: Bill) => {
    alert(`Edit bill: ${bill.billNumber}`);
    // Implement actual edit logic here
  }, []);

  const handleDeleteBill = useCallback((bill: Bill) => {
    alert(`Delete bill: ${bill.billNumber}`);
    // Implement actual delete logic here
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bills', page, limit, search],
    queryFn: () => getBills(page, limit, search),
  });

  const bills = data?.bills || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const config = manageBillsConfig(handleViewBill, handleEditBill, handleDeleteBill, userRole, currentPage, limit);

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
          <CreateBillButton onClick={config.createBillButtonAction} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by bill number or vendor name..."
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
          data={bills}
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
          {selectedBill && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Bill Details</h2>
              <p>Bill Number: {selectedBill.billNumber}</p>
              <p>Vendor Name: {selectedBill.vendorName}</p>
              <p>Amount: ${selectedBill.amount.toFixed(2)}</p>
              <p>Status: {selectedBill.status}</p>
              <p>Issue Date: {new Date(selectedBill.issueDate).toLocaleDateString()}</p>
              <p>Due Date: {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
              {/* Display items */}
              <h3 className="text-lg font-semibold mt-4 mb-2">Items:</h3>
              {selectedBill.items && selectedBill.items.length > 0 ? (
                <ul>
                  {selectedBill.items.map((item, index) => (
                    <li key={index} className="mb-1">
                      {item.name} (x{item.quantity}) - ${item.unitPrice.toFixed(2)} each = ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items in this bill.</p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageBillsPage;
