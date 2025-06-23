'use client';

import React, { useState } from 'react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { toast } from 'sonner';
import { RxCross2 } from 'react-icons/rx';
import dayjs from 'dayjs';
import { updateTransaction } from '@services/transactionService';
import { Transaction } from '@customTypes/index';

interface Props {
  selectedInvoice: Transaction;
  onClose: () => void;
}

export default function EditTransactionForm({ selectedInvoice, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    dayjs(selectedInvoice.transactionDate).format('YYYY-MM-DD')
  );
  const [transactionId, setTransactionId] = useState(selectedInvoice.transactionId || '');
  const [amount, setAmount] = useState(selectedInvoice.amount || 0);
  const [method, setMethod] = useState(selectedInvoice.method || '');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        transactionDate: transactionDate,
        transactionId,
        amount,
        method,
      };

      await updateTransaction(selectedInvoice._id, payload);
      toast.success('Transaction updated successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">Edit Transaction</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Transaction Date</label>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Transaction ID</label>
          <Input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Amount (₹)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Method</label>
          <Input
            type="text"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Update'}
        </Button>
      </div>
    </div>
  );
}
