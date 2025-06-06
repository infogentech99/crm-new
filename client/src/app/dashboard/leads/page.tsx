// File: src/pages/leads/ManageLeadsPage.tsx
"use client";

import React, { useCallback, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getLeads, deleteLead } from '@services/leadService';
import DataTable from '@components/Common/DataTable';
import DashboardLayout from '@components/Dashboard/DashboardLayout';
import CreateLeadButton from '@components/Common/CreateLeadButton';
import { manageLeadsConfig } from '@config/manageLeadsConfig';
import { Lead } from '@customTypes/index';
import DeleteModal from '@components/Common/DeleteModal';
import LeadSummaryCards from '@components/Leads/LeadSummaryCards';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import LeadForm from '@components/Leads/Leadform';
import Modal from '@components/Common/Modal';
import { useRouter } from 'next/navigation'; 


const ManageLeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["leads", page, limit, search, statusFilter],
    queryFn: () => getLeads(page, limit, search, statusFilter),
  });

  const leads = data?.leads || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

const handleViewLead = useCallback((lead: Lead) => {
  setSelectedLead(lead);
   if (lead?._id) {
    router.push(`/dashboard/leads/${lead._id}`)
  }
 }, [router]);

  const handleEditLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }, []);

 const handleCreateLead = () => {
  setSelectedLead(null);
  setIsModalOpen(true);
};

  const handleDeleteLead = useCallback((lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  }, []);

 
   const handleConfirmDelete = async () => {
    if (!leadToDelete) return;

    try {
      // Use _id instead of id
      await deleteLead(leadToDelete._id);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (err) {
      console.error("Failed to delete lead:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const config = manageLeadsConfig(
    handleViewLead,
    handleEditLead,
    handleDeleteLead,
    userRole,
    currentPage,
    limit
  );
  config.createLeadButtonAction = handleCreateLead;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' }, // Changed from '' to 'all'
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'denied', label: 'Denied' },
    { value: 'approved', label: 'Approved' },
    { value: 'quotation_submitted', label: 'Quotation Submitted' },
    { value: 'quotation_rejected', label: 'Quotation Rejected' },
    { value: 'quotation_approved', label: 'Quotation Approved' },
    { value: 'invoice_issued', label: 'Invoice Issued' },
    { value: 'invoice_accepted', label: 'Invoice Accepted' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing_payments', label: 'Processing Payments' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
  ];


  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <LeadSummaryCards />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {config.pageTitle}
          </h1>
        <CreateLeadButton onClick={handleCreateLead} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Select onValueChange={handleStatusFilterChange} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          data={leads}
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
   
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedLead(null); }} widthClass="max-w-3xl">
          <LeadForm
            initialData={selectedLead || undefined}
            mode={selectedLead ? "edit" : "create"}
            onClose={() => { setIsModalOpen(false); setSelectedLead(null); }}
          />
        </Modal>

        {leadToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setLeadToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            itemLabel={leadToDelete.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageLeadsPage;
