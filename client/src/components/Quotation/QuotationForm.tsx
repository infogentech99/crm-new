'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createQuotation, updateQuotation } from '@services/quotationService';
import dayjs from 'dayjs';
import { Bill, QuotationItem, Quotation } from '@customTypes/index';
import { RxCross2 } from 'react-icons/rx';
import { Input } from '@components/ui/input';
import { getBills } from '@services/billService';
import CreatableSelect from 'react-select/creatable';

interface Props {
  data: Quotation;
  mode: 'Create' | 'Edit';
  onClose: () => void;
}

interface PredefinedItem {
  label: string;
  value: string;
  price: number;
  hsn: string;
}

export default function QuotationForm({ data, mode, onClose }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [items, setItems] = useState<QuotationItem[]>(
    mode === 'Edit' && data?.items?.length
      ? data.items
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

  const [gstin, setGstin] = useState(
    mode === 'Edit' ? data?.user?.gstin || '' : ''
  );
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await getBills();
        setBills(res.bills);
      } catch (err: unknown) {
        console.error('Failed to fetch bills:', err);
        // setBillError(err.message || 'Failed to load bills'); // billError is unused
      } finally {
        // setLoadingBills(false); // loadingBills is unused
      }
    };

    fetchBills();
  }, []);

  const predefinedItems = bills?.map((bill) => ({
    label: bill.description,
    value: bill.description,
    price: bill.amount,
    hsn: bill.hsnCode,
  }));

  const handleSelect = (selected: PredefinedItem | null, index: number) => {
    const updated = [...items];
    if (selected) {
      updated[index] = {
        ...updated[index],
        description: selected.value,
        price: selected.price || 0,
        hsn: selected.hsn || '',
        quantity: 1,
      };
    } else {
      updated[index] = {
        ...updated[index],
        description: '',
        price: 0,
        hsn: '',
        quantity: 1,
      };
    }
    setItems(updated);
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]:
        typeof value === 'string' &&
        ['description', 'hsn', 'name'].includes(field)
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

  const taxable = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const igst = +(taxable * 0.18).toFixed(2);
  const total = +(taxable + igst).toFixed(2);
  const user = data?.user || data;
  const leadId = user?._id || data?._id;

  const handleSubmit = async () => {
    setValidationError('');
    setSubmitting(true);

    // Validation for items
    if (!leadId) {
      setValidationError('Lead (client) is required.');
      setSubmitting(false);
      return;
    }
    if (!items.length || items.some(i => !i.description || !i.price)) {
      setValidationError('Each item must have description and price.');
      setSubmitting(false);
      return;
    }
    if (!taxable) {
      setValidationError('At least one item with valid amount required.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        _id: leadId,          // <--- THIS FIELD IS REQUIRED BY BACKEND!
        gstin,
        items: items.map(i => ({
          description: i.description,
          quantity: Number(i.quantity),
          price: Number(i.price),
          hsn: i.hsn || '',
        })),
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
        <div>
          <label className="text-sm font-medium block mb-1">Date</label>
          <Input
            type="text"
            value={dayjs(data?.date || new Date()).format('YYYY-MM-DD')}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Company Name</label>
          <Input
            type="text"
            value={user?.name || ''}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">GSTIN</label>
          <Input
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium block mb-1">
            Company Address
          </label>
          <Input
            type="text"
            value={user?.address || ''}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <Input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Phone No</label>
          <Input
            type="text"
            value={user?.phoneNumber || ''}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
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
                <CreatableSelect
                  options={predefinedItems}
                  placeholder="Search or type"
                  onChange={(selected) => handleSelect(selected, idx)}
                  value={
                    item.description === ''
                      ? null
                      : predefinedItems.find(
                          (opt) => opt.value === item.description
                        ) || {
                          label: item.description || '',
                          value: item.description || '',
                          price: item.price, // Ensure price is included
                          hsn: item.hsn,     // Ensure hsn is included
                        }
                  }
                  isClearable
                  isSearchable
                  menuPortalTarget={
                    typeof window !== 'undefined' ? document.body : null
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '36px',
                      fontSize: '0.85rem',
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </td>
              <td className="p-2 w-20 text-center">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(idx, 'quantity', e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded text-center"
                />
              </td>
              <td className="p-2 w-28 text-center">
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(idx, 'price', e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded text-center"
                />
              </td>
              <td className="p-2 w-28 text-center">
                <Input
                  type="text"
                  value={item.hsn}
                  onChange={(e) =>
                    handleItemChange(idx, 'hsn', e.target.value)
                  }
                  className="w-full border px-2 py-1 rounded text-center"
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

      <Button variant="outline" className="mt-4" onClick={handleAddItem}>
        + Add Item
      </Button>

      <div className="flex justify-end mt-6 text-sm">
        <div className="space-y-1 text-right">
          <p>Taxable: ₹{taxable.toLocaleString('en-IN')}</p>
          <p>IGST (18%): ₹{igst.toLocaleString('en-IN')}</p>
          <p className="font-semibold text-lg">
            Total: ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Show any error */}
      {validationError && (
        <div className="text-red-600 mt-2 text-right">{validationError}</div>
      )}

      <div className="col-span-2 mt-6 flex justify-end gap-3">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? 'Saving...'
            : mode === 'Create'
            ? 'Create Quotation'
            : 'Update Quotation'}
        </Button>
      </div>
    </div>
  );
}
