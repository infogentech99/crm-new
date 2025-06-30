'use client';

import dayjs from 'dayjs';
import React from 'react';

import { Transaction } from '../../types';

interface Props {
  transactions: Transaction[];
  projects: { _id: string; title: string; status: string }[];
}

export default function TransactionList({ transactions, projects }: Props) {
  const mergedTransactions = transactions.map((txn) => {
    const project = projects.find((p) => p._id === txn.projectId);
    return {
      ...txn,
      projectTitle: project?.title || 'N/A',
      projectStatus: project?.status || 'Unknown',
    };
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Project Transactions</h2>
      <div className="flex justify-between font-semibold bg-gray-100 text-gray-700 px-4 py-3 rounded">
        <span className="flex-1">Invoice</span>
        <span className="flex-1">Txn ID</span>
        <span className="flex-1">Project</span>

        <span className="flex-1">Method</span>
        <span className="flex-1">Amount</span>
        <span className="flex-1 text-right">Date & Time</span>
      </div>
      {mergedTransactions.length > 0 ? (
        mergedTransactions.map((txn) => (

          <div
            key={txn.transactionId}
            className="flex justify-between px-4 py-3 border-b text-sm hover:bg-gray-50"
          >
            <span className="flex-1">{txn.invoiceId}</span>
            <span className="flex-1 text-gray-800">{txn.transactionId}</span>
            <span className="flex-1">{txn.projectTitle}</span>

            <span className="flex-1">{txn.method}</span>
            <span className="flex-1 text-green-700">₹{txn.amount}</span>
            <span className="flex-1 text-gray-600 text-right">
             {dayjs(txn.transactionDate).format('D MMM YYYY, hh:mm A')}
            </span>
          </div>
        ))
      ) : (
        <div className="px-4 py-3 text-gray-500 italic">No transactions for this project.</div>
      )}
    </div>
  );
}
