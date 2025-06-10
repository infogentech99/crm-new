'use client';

import React, { useState } from 'react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createQuotation, updateQuotation } from '@services/quotationService';
import dayjs from 'dayjs';
import { QuotationItem } from '@customTypes/index';
import { RxCross2 } from 'react-icons/rx';

interface Props {
  data: any;
  mode: 'Create' | 'Edit';
  onClose: () => void;
}

export default function QuotationForm({ data, mode, onClose }: Props) {
  const router = useRouter();

  const [items, setItems] = useState<QuotationItem[]>(
    mode === 'Edit' && data?.items?.length
      ? data.items
      : [{
        name: '',
        description: '',
        quantity: 1,
        price: 0,
        unitPrice: 0,
        hsn: '',
        total: 0,
      }]
  );

  const [gstin, setGstin] = useState(
    mode === 'Edit' ? data?.user?.gstin || '' : data?.gstin || ''
  );

  const [submitting, setSubmitting] = useState(false);

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: typeof value === 'string' && ['description', 'hsn', 'name'].includes(field)
        ? value
        : parseFloat(value as string) || 0,
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, {
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      unitPrice: 0,
      hsn: '',
      total: 0,
    }]);
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
        _id: data?.user?._id || data?._id,
        gstin,
        items,
        totals: {
          taxable,
          igst,
          total,
        },
      };

      if (mode === 'Create') {
        await createQuotation(payload);
        toast.success('Quotation created successfully!');
      } else {
        await updateQuotation(data._id, payload);
        toast.success('Quotation updated successfully!');
      }

      router.push('/dashboard/quotations');
      onClose();
    } catch (err) {
      console.error('Error submitting quotation:', err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const user = data?.user || data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === 'Create' ? 'Create Quotation' : 'Update Quotation'}
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
        <InputGroup label="Date" value={dayjs(data?.date || new Date()).format('YYYY-MM-DD')} readOnly />
        <InputGroup label="Company Name" value={user?.name || ''} readOnly />
        <InputGroup label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
        <InputGroup label="Company Address" value={user?.address || ''} readOnly className="col-span-2" />
        <InputGroup label="Email" value={user?.email || ''} readOnly />
        <InputGroup label="Phone No" value={user?.phone || ''} readOnly />
      </div>

      <table className="w-full mt-6 text-sm border rounded-md overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left w-1/2">Description</th>
            <th className="p-2 w-20 text-center">Qty</th>
            <th className="p-2 w-28 text-center">Price (₹)</th>
            <th className="p-2 w-28 text-center">HSN</th>
            <th className="p-2 text-right w-32">Total (₹)</th>
            <th className="p-2 w-12 text-center"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 w-1/2">
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                />
              </td>
              <td className="p-2 w-20 text-center">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                />
              </td>
              <td className="p-2 w-28 text-center">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                />
              </td>
              <td className="p-2 w-28 text-center">
                <Input
                  value={item.hsn}
                  onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)}
                />
              </td>
              <td className="p-2 text-right w-32 font-semibold text-gray-800">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </td>
              <td className="p-2 text-center w-12">
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-500 hover:underline cursor-pointer mt-2"
                >
                  <RxCross2 />
                </button>
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
        <Button type="button" onClick={onClose} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'Create' ? 'Create Quotation' : 'Update Quotation'}
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
