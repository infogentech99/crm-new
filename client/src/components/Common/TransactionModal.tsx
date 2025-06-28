"use client";

import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { createTransaction, getTransactions } from "@services/transactionService";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
// import { Spinner } from "@components/ui/spinner";
import { Transaction as TxnType } from "@customTypes/index";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import { useRouter } from "next/navigation";

interface Props {
  selectedInvoice: {
    _id: string;
    totals: { total: number };
    paidAmount?: number;
    user: string;
    projectId: string;
  } | null;
  onClose: () => void;
}

export default function TransactionModal({ selectedInvoice, onClose }: Props) {
  const [amount, setAmount] = useState<number | "">("");
  const [transactionId, setTransactionId] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [transactions, setTransactions] = useState<TxnType[]>([]);
  const router = useRouter();

  const fetchTransactions = useCallback(async () => {
    if (!selectedInvoice?._id) return;
    setTxLoading(true);
    try {
      // fetch first page with invoiceId as search term
      const { transactions: allTxs } = await getTransactions(1, 100, selectedInvoice._id);
      setTransactions(allTxs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions.");
    } finally {
      setTxLoading(false);
    }
  }, [selectedInvoice]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!selectedInvoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amt = Number(amount);
    const remaining = selectedInvoice.totals.total - (selectedInvoice.paidAmount || 0);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (amt > remaining) {
      toast.error("Amount exceeds invoice balance.");
      return;
    }
    if (!method) {
      toast.error("Select a payment method.");
      return;
    }
    const payload = {
      amount: amt,
      method,
      transactionId,
      invoiceId: selectedInvoice._id,
      leadId: selectedInvoice.user,
      projectId: selectedInvoice.projectId,
    };

    setLoading(true);
    try {
      await createTransaction(payload);
      toast.success("Transaction saved successfully.");
      await fetchTransactions();
      router.push('/dashboard/transactions');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving transaction.");
    } finally {
      setLoading(false);
      setAmount("");
      setTransactionId("");
      setMethod("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-600">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-200 p-1 text-2xl hover:text-gray-500 cursor-pointer"
            aria-label="Close"
          >
            <RxCross2 />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            name="amount"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={loading}
            required
          />
          <Input
            type="text"
            name="transactionId"
            placeholder="Transaction ID (optional)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={loading}
          />
          <Select onValueChange={setMethod} value={method} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select Payment Method" />
            </SelectTrigger>
            <SelectContent>
              {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Other'].map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Previous Transactions</h4>

          <div className="grid grid-cols-4 text-xs font-medium text-gray-500 px-2 pb-1 border-b">
            <span>Date</span>
            <span>Txn ID</span>
            <span>Method</span>
            <span className="text-right">Amount</span>
          </div>

          {txLoading ? (
            <div className="flex justify-center py-4">
             
            </div>
          ) : transactions.length > 0 ? (
            <ul className="text-sm max-h-40 overflow-y-auto divide-y">
              {transactions.map(txn => (
                <li key={txn.transaction} className="grid grid-cols-4 py-1 px-2 items-center">
                  <span>{dayjs(txn.date).format('DD MM YYYY')}</span>
                  <span className="truncate" title={txn.transactionId}>{txn.transactionId || '-'}</span>
                  <span>{txn.method}</span>
                  <span className="text-right">₹{txn.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 italic">No transactions for this invoice.</div>
          )}
        </div>
      </div>
    </div>
  );
}
