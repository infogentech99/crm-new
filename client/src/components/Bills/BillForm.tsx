
'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBill, updateBill } from '@services/billService';
import { toast } from 'sonner';
import { RxCross2 } from 'react-icons/rx';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input'; 
import RequiredLabel from '@components/ui/RequiredLabel'; // Assuming this is the correct path for RequiredLabel]
interface Props {
  data: any;
  mode: 'Create' | 'Edit';
  onClose: () => void;
}

export default function BillForm({ data, mode, onClose }: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    description: data?.description || '',
    hsnCode: data?.hsnCode || '',
    amount: data?.amount || '',
  });

  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
const isDescriptionInvalid = touched.description && !form.description;
const isAmountInvalid = touched.amount && !form.amount;

const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  setTouched((prev) => ({ ...prev, [e.target.name]: true }));
};


  const [submitting, setSubmitting] = useState(false);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const payload = {
        description: form.description,
        hsnCode: form.hsnCode,
        amount: form.amount,
      };

      try {
        if (data?._id) {
          return await updateBill(data._id, payload);
        } else {
          return await createBill(payload);
        }
      } catch (error) {
        console.error("Error in mutationFn:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success(`Bill ${data?._id ? 'updated' : 'created'} successfully`);
      onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error('Something went wrong. Try again.');
    },
    onSettled: () => setSubmitting(false),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  setTouched({ description: true, amount: true });
  if (!form.description || !form.amount) return;
  setSubmitting(true);
  mutate();
};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === 'Edit' ? 'Update Bill' : 'Create Bill'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
        <RequiredLabel required>Description</RequiredLabel>
  <Input
    type="text"
    name="description"
    value={form.description}
    onChange={handleChange}
    onBlur={handleBlur}
    aria-invalid={isDescriptionInvalid}
    className={`w-full border rounded px-3 py-2 ${isDescriptionInvalid ? 'border-red-500' : ''}`}
  />
  {isDescriptionInvalid && (
    <span className="text-xs text-red-500">Description is required</span>
  )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">HSN Code</label>
          <Input
            type="text"
            name="hsnCode"
            value={form.hsnCode}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
           <RequiredLabel required>Amount (₹)</RequiredLabel>
  <Input
    type="number"
    name="amount"
    value={form.amount}
    onChange={handleChange}
    onBlur={handleBlur}
    aria-invalid={isAmountInvalid}
    className={`w-full border rounded px-3 py-2 ${isAmountInvalid ? 'border-red-500' : ''}`}
  />
  {isAmountInvalid && (
    <span className="text-xs text-red-500">Amount is required</span>
  )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'Edit' ? 'Update Bill' : 'Create Bill'}
        </Button>
      </div>
    </div>
  );
}
