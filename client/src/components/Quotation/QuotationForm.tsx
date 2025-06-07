'use client';

import React, { useState } from 'react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createQuotation } from '@services/quotationService';
import dayjs from 'dayjs';
import { QuotationItem } from '@customTypes/index';
import { RxCross2 } from 'react-icons/rx';

interface Props {
  leadData: {
    _id: string;
    date: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gstin?: string;
    items?: QuotationItem[];
  };
  mode: 'Create' | 'Edit';
  onClose: () => void; 
}

export default function QuotationForm({ leadData, mode, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('id');

  const [items, setItems] = useState<QuotationItem[]>(
    leadData.items?.length
      ? leadData.items
      : [
        {
          name: '',
          description: '',
          quantity: 1,
          price: 0,
          unitPrice: 0,
          hsn: '',
          total: 0,
        },
      ]
  );
  const [gstin, setGstin] = useState(leadData.gstin || '');
  const [submitting, setSubmitting] = useState(false);

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]:
        typeof value === 'string' && (field === 'description' || field === 'hsn' || field === 'name')
          ? value
          : parseFloat(value as string) || 0,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        price: 0,
        unitPrice: 0,
        hsn: '',
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const taxable = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const igst = +(taxable * 0.18).toFixed(2);
  const total = +(taxable + igst).toFixed(2);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        _id: leadData._id,
        gstin,
        items,
        totals: {
          taxable,
          igst,
          total,
        },
      };

      await createQuotation(payload);
      toast.success('Quotation created successfully!');
      router.push('/dashboard/quotations');
    } catch (err) {
      console.error('Error creating quotation:', err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === "Create" ? "Create Quotation" : "Update Quotation"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <InputGroup label="Date" value={dayjs().format('YYYY-MM-DD')} readOnly />
        <InputGroup label="Company Name" value={leadData.name} readOnly />
        <InputGroup label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
        <InputGroup label="Company Address" value={leadData.address} readOnly className="col-span-2" />
        <InputGroup label="Email" value={leadData.email} readOnly />
        <InputGroup label="Phone No" value={leadData.phone} readOnly />
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
                <Input value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} />
              </td>
              <td className="p-2">
                <Input type="number" min={1} value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
              </td>
              <td className="p-2">
                <Input type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} />
              </td>
              <td className="p-2">
                <Input value={item.hsn} onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)} />
              </td>
              <td className="p-2 text-right font-semibold text-gray-800">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </td>
              <td className="p-2 text-center">
                <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:underline">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button variant="outline" className="mt-4" onClick={handleAddItem}>+ Add Item</Button>

      <div className="flex justify-end mt-6 text-sm">
        <div className="space-y-1 text-right">
          <p>Taxable: ₹{taxable.toLocaleString('en-IN')}</p>
          <p>IGST (18%): ₹{igst.toLocaleString('en-IN')}</p>
          <p className="font-semibold text-lg">Total: ₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="col-span-2 mt-6 flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : mode === "Create" ? "Create Quotation" : "Update Quotation"}
        </Button>
      </div>
    </div>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  readOnly = false,
  className = '',
}: {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <Input value={value} onChange={onChange} readOnly={readOnly} className={readOnly ? 'bg-gray-100' : ''} />
    </div>
  );
}
