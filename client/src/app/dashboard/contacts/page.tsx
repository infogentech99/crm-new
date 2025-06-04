"use client";

import React, { useCallback, useState } from 'react';
// Added this comment to trigger re-evaluation
import { useQuery } from '@tanstack/react-query';
import { getContacts } from '@services/contactService'; // Will create this service
import DataTable from '@components/Common/DataTable';
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import CreateContactButton from '@components/Common/CreateContactButton'; // Will create this component
import { manageContactsConfig } from '@config/manageContactsConfig'; // Will create this config
import Modal from '@components/Common/Modal';
import { Contact } from '@customTypes/index'; // Use Contact interface
// import ContactSummaryCards from '@components/Contacts/ContactSummaryCards'; // Will create this component
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

const ManageContactsPage: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  // Removed statusFilter as contacts typically don't have complex statuses like leads

  const userRole = useSelector((state: RootState) => state.user.role || '');

  const handleViewContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handleEditContact = useCallback((contact: Contact) => {
    alert(`Edit contact: ${contact.name}`);
    // Implement actual edit logic here
  }, []);

  const handleDeleteContact = useCallback((contact: Contact) => {
    alert(`Delete contact: ${contact.name}`);
    // Implement actual delete logic here
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contacts', page, limit, search], // Removed statusFilter from queryKey
    queryFn: () => getContacts(page, limit, search), // Removed statusFilter from queryFn
  });

  const contacts = data?.contacts || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  const config = manageContactsConfig(handleViewContact, handleEditContact, handleDeleteContact, userRole, currentPage, limit); // Pass userRole, currentPage, and limit

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

  // Removed statusOptions as contacts typically don't have complex statuses

  return (
    <DashboardLayout>
      <div className="p-6 rounded-lg shadow-md bg-white">
        {/* <ContactSummaryCards /> Add the summary cards here */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
          <CreateContactButton onClick={config.createContactButtonAction} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          {/* Removed status filter select */}
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
          data={contacts}
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
          {selectedContact && (
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Contact Details</h2>
              <p>Name: {selectedContact.name}</p>
              <p>Email: {selectedContact.email}</p>
              <p>Phone: {selectedContact.phone}</p>
              <p>Company: {selectedContact.company}</p>
              {/* Add more contact details as needed */}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ManageContactsPage;
