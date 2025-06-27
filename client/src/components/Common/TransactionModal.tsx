"use client";

import React, { useState } from "react";
import { createTransaction, TransactionInput } from "@services/transactionService";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@components/ui/input";
import { Transaction } from "@customTypes/index";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import { useRouter } from "next/navigation";


export default function TransactionModal({
  selectedInvoice,
  onClose,
}: {
  selectedInvoice: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("");
  const router = useRouter();
  if (!selectedInvoice) return null;
  console.log("Selected Invoice:", selectedInvoice);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const transactionId = formData.get("transactionId") as string;

    const remaining =
      selectedInvoice?.totals?.total - (selectedInvoice?.paidAmount || 0);

    if (amount > remaining) {
      toast.error("Amount exceeds invoice balance.");
      return;
    }

    if (!method) {
      toast.error("Please select a payment method.");
      return;
    }
    const payload: TransactionInput = {
      amount,
      method,
      transactionId,
      invoiceId: selectedInvoice._id,
      leadId: selectedInvoice.user,
      projectId: selectedInvoice.projectId
    };

    try {
      setLoading(true);
      await createTransaction(payload);
      toast.success("Transaction saved Successfully.");
      router.push('/dashboard/transactions');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-600">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
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
            required
          />
          <Input
            type="text"
            name="transactionId"
            placeholder="Transaction ID"
          />

          <Select onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className=""
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>

        {selectedInvoice.transactions?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Previous Transactions</h4>

            <div className="grid grid-cols-4 text-xs font-medium text-gray-500 px-2 pb-1 border-b">
              <span>Date</span>
              <span>Txn ID</span>
              <span>Method</span>
              <span className="text-right">Amount</span>
            </div>

            <ul className="text-sm max-h-40 overflow-y-auto divide-y">
              {selectedInvoice.transactions.map((txn: Transaction) => (
                <li key={txn._id} className="grid grid-cols-4 py-1 px-2 items-center">
                  <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                  <span className="truncate" title={txn.transactionId}>{txn.transactionId || '-'}</span>
                  <span>{txn.method}</span>
                  <span className="text-right">₹{txn.amount}</span>
                </li>
              ))}
            </ul>
          </div>

        )}
      </div>
    </div>
  );
}