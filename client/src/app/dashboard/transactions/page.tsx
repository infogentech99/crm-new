"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTransactions, deleteTransaction } from '@services/transactionService';
import DataTable from '@components/Common/DataTable';
import { manageTransactionsConfig } from '@config/manageTransactionsConfig';
import { Transaction } from '@customTypes/index';
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
import Modal from '@components/Common/Modal';
import DeleteModal from '@components/Common/DeleteModal';
import TransactionForm from '@components/Transaction/TrasactionForm';
const ManageTransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const userRole = useSelector((state: RootState) => state.user.role || '');
 useEffect(() => {
   document.title = "Manage Transactions – CRM Application";
 }, []);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['allTransactions', search],
    queryFn: () => getTransactions(1, 10000, search),
    enabled: isMounted, 
  });

  const allTransactions = data?.transactions || [];
  const totalTransactions = allTransactions.length;
  const totalPages = Math.ceil(totalTransactions / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const transactionsToDisplay = allTransactions.slice(startIndex, endIndex);

  const handleEditTransaction = useCallback((txn: Transaction) => {
    setSelectedTransaction(txn);
    setIsTransactionModalOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback((txn: Transaction) => {
    setTransactionToDelete(txn);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(transactionToDelete._id);
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const config = manageTransactionsConfig(
    handleEditTransaction,
    handleDeleteTransaction,
    page,
    limit
  );

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
    return null; 
  }

  return (
    <>
      <div className="p-6 rounded-lg shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by transaction ID or method..."
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
          data={transactionsToDisplay}
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
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          widthClass="max-w-xl"
        >
          {selectedTransaction && (
            <TransactionForm
              selectedInvoice={selectedTransaction}
              onClose={() => {
                setIsTransactionModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
              }}
            />
          )}
        </Modal>

        {transactionToDelete && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setTransactionToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            itemLabel={`Transaction ${transactionToDelete?.transactionId || ''}`}
               
          />
        )}
      </div>
    </>
  );
};

export default ManageTransactionsPage;
