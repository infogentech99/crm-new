// File: src/pages/bills/ManageBillsPage.tsx
"use client";

import React, { useCallback, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getBills, deleteBill } from "@services/billService";
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateBillButton from '@components/Common/CreateBillButton';
import { manageBillsConfig } from '@config/manageBillsConfig';
import Modal from '@components/Common/Modal';
import DeleteModal from '@components/Common/DeleteModal';
import BillForm from "@components/Bills/BillForm";
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
  const queryClient = useQueryClient();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');


  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bills', page, limit, search],
    queryFn: () => getBills(page, limit, search),
  });
  const bills = data?.bills || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;


  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);



  const handleCreateBill = () => {
    setSelectedBill(null);
    setIsModalOpen(true);
  };
  const handleEditBill = useCallback((bill: Bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  }, []);

  const handleDeleteBill = useCallback((bill: Bill) => {
    setBillToDelete(bill);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteBill = async () => {
    if (!billToDelete) return;
    await deleteBill(billToDelete._id);
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    setIsDeleteModalOpen(false);
    setBillToDelete(null);
  };

  const config = manageBillsConfig(
    /* view */() => { },
    handleEditBill,
    handleDeleteBill,
    userRole,
    currentPage,
    limit
  );
  config.createBillButtonAction = handleCreateBill;

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
          <CreateBillButton onClick={handleCreateBill} />
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


        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          widthClass="max-w-lg"
        >
          <BillForm
            data={selectedBill ?? undefined}
            mode={selectedBill ? "Edit" : "Create"}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>

        {billToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setBillToDelete(null); }}
            onConfirm={confirmDeleteBill}
            itemLabel={`${billToDelete.description}`}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageBillsPage;
