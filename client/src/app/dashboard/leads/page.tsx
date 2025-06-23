
"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getLeads, deleteLead, createLead } from '@services/leadService';
import DataTable from '@components/Common/DataTable';
import CreateLeadButton from '@components/Common/CreateLeadButton';
import { exportLeadsToCSV } from '@utils/exportUtils';
import { parseLeadsCSV } from '@utils/importUtils';
import { manageLeadsConfig } from '@config/manageLeadsConfig';
import { Lead } from '@customTypes/index';
import DeleteModal from '@components/Common/DeleteModal';
import LeadSummaryCards from '@components/Leads/LeadSummaryCards';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
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
import LeadForm from '@components/Leads/Leadform';
import Modal from '@components/Common/Modal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


const ManageLeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  const userRole = useSelector((state: RootState) => state.user.role || '');
  useEffect(() => {
   document.title = "Manage Leads – CRM Application";
 }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["allLeads", search, statusFilter],
    queryFn: () => getLeads(page, limit, search, statusFilter),
   enabled: isMounted,
  });

  const allLeads = data?.leads || [];
  const filteredLeads = allLeads.filter(lead => {
    const lowerCaseSearch = search.toLowerCase();
    const matchesSearch = (
      (lead.name?.toLowerCase() || '').includes(lowerCaseSearch) ||
      (lead.companyName?.toLowerCase() || '').includes(lowerCaseSearch) ||
      (lead.email?.toLowerCase() || '').includes(lowerCaseSearch) ||
      (lead.phoneNumber?.toLowerCase() || '').includes(lowerCaseSearch)
    );
    const matchesStatus =
      statusFilter === undefined ||
      lead.status === statusFilter ||
      lead.projects?.some(project => project.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const leadsToDisplay = filteredLeads.slice(startIndex, endIndex);

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
      await deleteLead(leadToDelete._id);
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
    } catch (err) {
      console.error("Failed to delete lead:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      const { leads: allLeads } = await getLeads(1, 9999, search, statusFilter);
      exportLeadsToCSV(allLeads);
      toast.success('Exported leads successfully');
    } catch (err) {
      console.error("Export all failed:", err);
      toast.error('Export failed');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const parsedLeads = parseLeadsCSV(text);
      let duplicateCount = 0;
      let successCount = 0;
      for (const leadData of parsedLeads) {
        try {
          await createLead(leadData as Lead);
          successCount++;
        } catch (err: unknown) {
          let msg = 'An unknown error occurred';
          if (err instanceof Error) {
            msg = err.message;
          } else if (typeof err === 'object' && err !== null && 'response' in err && (err as { response: { data?: { message?: string } } }).response?.data?.message) {
            msg = (err as { response: { data: { message: string } } }).response.data.message;
          }
          if (msg.includes('E11000') || msg.includes('duplicate key')) {
            duplicateCount++;
          } else {
            console.error('Import error:', err);
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (duplicateCount > 0) {
        toast.error(`Skipped ${duplicateCount} duplicate email${duplicateCount > 1 ? 's' : ''}`);
      } else {
        toast.success(`Imported ${successCount} lead${successCount > 1 ? 's' : ''} successfully`);
      }
    };
    reader.readAsText(file);
  };

  const config = manageLeadsConfig(
    handleViewLead,
    handleEditLead,
    handleDeleteLead,
    userRole,
    page,
    limit
  );

  config.createLeadButtonAction = handleCreateLead;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else if (newPage < 1) {
      setPage(1);
    } else if (newPage > totalPages) {
      setPage(totalPages);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending_approval', label: 'Pending Approval' },
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
    // { value: 'denied', label: 'Denied' },
  ];


  return (
      <div className="p-6 rounded-lg shadow-md bg-white">
        <LeadSummaryCards />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            {config.pageTitle}
          </h1>
        <div className="flex space-x-2">
          {userRole === 'superadmin' && (
            <>
              <Button onClick={handleImportClick}>
                Import CSV
              </Button>
              <Button onClick={handleExport}>
                Export CSV
              </Button>
            </>
          )}
          <CreateLeadButton onClick={handleCreateLead} />
        </div>
        </div>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search by name,or company..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-4">
            <Select onValueChange={handleStatusFilterChange} value={statusFilter || 'all'}>
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
        </div>

        <DataTable
          columns={config.tableColumns}
          data={leadsToDisplay}
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

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedLead(null); }} widthClass="max-w-3xl">
          <LeadForm
            initialData={selectedLead || undefined}
            mode={selectedLead ? "Edit" : "Create"}
            onClose={() => { setIsModalOpen(false); setSelectedLead(null); queryClient.invalidateQueries({ queryKey: ["allLeads"] }); }}

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
  );
};

export default ManageLeadsPage;
