"use client";

import React, { useState } from "react";
import { createTransaction } from "@services/transactionService";
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

export default function TransactionModal({
  selectedInvoice,
  onClose,
}: {
  selectedInvoice: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(""); 

  if (!selectedInvoice) return null;

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

    const payload: Transaction = {
      amount,
      method,
      transactionId,
      invoiceId: selectedInvoice._id,
      leadId: selectedInvoice.user,
    };

    try {
      setLoading(true);
      await createTransaction(payload);
      toast.success("Transaction saved Successfully.");
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        {selectedInvoice.transactions?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">
              Previous Transactions
            </h4>
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {selectedInvoice.transactions.map((txn: any) => (
                <li key={txn._id} className="flex justify-between border-b pb-1">
                  <span>{new Date(txn.createdAt).toLocaleDateString()}</span>
                  <span>₹{txn.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
