"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@components/Common/DataTable';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { PaginationComponent } from '@components/ui/pagination';
import { manageProjectsConfig } from '@src/config/manageProjectsConfig';
import { getLeads } from '@services/leadService';

const ManageProjectsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['allLeadsForProjects', search],
    queryFn: () => getLeads(1, 10000, search),
    enabled: isMounted, 
  });

  const allLeads = data?.leads || [];
  const allProjectsData = allLeads.flatMap(lead =>
    lead.projects.map((project, projectIndex) => ({
      _id: project._id || `${lead._id}-${projectIndex}`, 
      title: project.title,
      status: project.status,
      leadName: lead.name,
      industry: lead.industry,
    }))
  );

  const filteredProjects = allProjectsData.filter(project =>
    (project.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (project.leadName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (project.industry?.toLowerCase() || '').includes(search.toLowerCase())
  );
  const projectsFilteredByStatus = filteredProjects.filter(project =>
    statusFilter === '' || statusFilter === 'all' || project.status === statusFilter
  );

  const totalProjects = projectsFilteredByStatus.length;
  const totalPages = Math.ceil(totalProjects / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const projectsToDisplay = projectsFilteredByStatus.slice(startIndex, endIndex);

  const config = manageProjectsConfig(page, limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else if (newPage < 1) {
      setPage(1);
    } else if (newPage > totalPages) {
      setPage(totalPages);
    }
  };
   useEffect(() => {
     document.title = "Manage Projects – CRM Application";
   }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'quotation_submitted', label: 'Quotation Submitted' },
    { value: 'quotation_approved', label: 'Quotation Approved' },
    { value: 'invoice_issued', label: 'Invoice Issued' },
    { value: 'invoice_accepted', label: 'Invoice Accepted' },
    { value: 'processing_payments', label: 'Processing Payments' },
    { value: 'payments_complete', label: 'Payments Completed' },
     { value: 'final_invoice', label: 'Final Invoice' },
    { value: 'completed', label: 'Completed' },
    { value: 'denied', label: 'Denied' },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">All Projects</h1>
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by project name, company, or industry..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-4">
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
        </div>

        <DataTable
          columns={config.tableColumns}
          data={projectsToDisplay}
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
      </div>
    </>
  );
};

export default ManageProjectsPage;
