'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createQuotation, updateQuotation } from '@services/quotationService';
import dayjs from 'dayjs';

interface QuotationItem {
  description: string;
  quantity: number;
  price: number;
  hsn: string;
}

interface Props {
  leadData: {
    date: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
    items?: QuotationItem[];
  };
  mode: 'Create' | 'Edit';
  onCancel?: () => void;
}

export default function QuotationForm({ leadData, mode, onCancel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('id');

  const [items, setItems] = useState<QuotationItem[]>(
    leadData.items?.length ? leadData.items : [{ description: '', quantity: 1, price: 0, hsn: '' }]
  );
  const [gstin, setGstin] = useState(leadData.gstin || '');
  const [submitting, setSubmitting] = useState(false);

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updated = [...items];
    updated[index][field] =
      field === 'description' || field === 'hsn'
        ? String(value)
        : parseFloat(String(value)) || 0;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0, hsn: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const taxable = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const igst = taxable * 0.18;
  const total = taxable + igst;

const handleSubmit = async () => {
  setSubmitting(true);
  try {
    const totals = {
      taxable,
      igst,
      total
    };

    const payload = {
      _id: leadData._id,      
      gstin,                  
      items,                  
      totals,                 
    };

    await createQuotation(payload); 
    toast.success('Quotation created successfully!');
    // router.push('/quotations');
  } catch (err) {
    console.error('Error creating quotation:', err);
    toast.error('Something went wrong. Try again.');
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="p-6 bg-white shadow rounded-md w-full">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'Create' ? 'Create Quotation' : 'Update Quotation'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium block mb-1">Date</label>
           <Input value={dayjs().format('YYYY-MM-DD')} readOnly className="bg-gray-100" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Company Name</label>
          <Input value={leadData.name} readOnly className="bg-gray-100" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">GSTIN</label>
          <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1">Company Address</label>
          <Input value={leadData.address} readOnly className="bg-gray-100" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <Input value={leadData.email} readOnly className="bg-gray-100" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Phone No</label>
          <Input value={leadData.phone} readOnly className="bg-gray-100" />
        </div>
      </div>

      <table className="w-full mt-6 text-sm border rounded-md overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Description</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price (₹)</th>
            <th className="p-2">HSN</th>
            <th className="p-2">Total (₹)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  value={item.hsn}
                  onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                />
              </td>
              <td className="p-2 text-right text-gray-800 font-semibold">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </td>
              <td className="p-2 text-center">
                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:underline">
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button variant="outline" className="mt-4" onClick={handleAddItem}>
        + Add Item
      </Button>

      <div className="flex justify-end mt-6 text-sm">
        <div className="space-y-1 text-right">
          <p>Taxable: ₹{taxable.toLocaleString('en-IN')}</p>
          <p>IGST (18%): ₹{igst.toLocaleString('en-IN')}</p>
          <p className="font-semibold text-lg">Total: ₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" onClick={onCancel || (() => {})}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'Create' ? 'Create Quotation' : 'Update Quotation'}
        </Button>
      </div>
    </div>
  );
}
