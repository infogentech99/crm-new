// File: client/src/app/dashboard/final-invoice/[invoiceNumber]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { toWords } from 'number-to-words';
import { toast } from 'sonner';
import LeadDetailsShimmer from '@components/ui/LeadDetailsShimmer';
import { Button } from '@components/ui/button';
import { generatePDFBlob } from '@utils/pdfGenerator';
import { InvoiceItem, CustomerData, InvoiceResponse } from '@customTypes/index';
import { getInvoiceByNumber } from '@services/invoiceService';
import { createEmail } from '@services/emailService';

export default function FinalInvoicePage() {
  const { invoiceNumber } = useParams();
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const [invoice, setInvoice] = useState<InvoiceResponse['data'] | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [sending, setSending]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!invoiceNumber) {
      setError('No invoice number provided.');
      setLoading(false);
      return;
    }
    const invoiceNumStr = Array.isArray(invoiceNumber) ? invoiceNumber[0] : invoiceNumber;
    getInvoiceByNumber(invoiceNumStr)
      .then(res => setInvoice(res.data))
      .catch(err => {
        console.error(err);
        const msg = err.message || `Could not load invoice ${invoiceNumStr}`;
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [invoiceNumber]);

  if (loading) return <LeadDetailsShimmer />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-gray-600">
        <p>Invoice not found.</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Destructure
  const {
    invoiceNumber: num,
    date,
    items,
    totals,
    user: rawUser
  } = invoice;
  const customer = rawUser as unknown as CustomerData;
  const lineItems = items as InvoiceItem[];

  // Compute GST
  const taxable = totals.taxable;
  let cgst = 0, sgst = 0, igst = 0;
  if ((customer.city || '').trim().toLowerCase() === 'delhi') {
    cgst = taxable * 0.09;
    sgst = taxable * 0.09;
  } else {
    igst = taxable * 0.18;
  }
  const total = taxable + cgst + sgst + igst;

  // Pad to 6 rows
  const displayRows: (InvoiceItem|null)[] = [
    ...lineItems,
    ...Array.from({ length: Math.max(0, 6 - lineItems.length) }, () => null)
  ];

  const amountInWords = `${toWords(Math.round(total))
    .replace(/(^\w|\s\w)/g, m => m.toUpperCase())} Rupees Only`;

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    const pdf = await generatePDFBlob(invoiceRef);
    pdf.save(`invoice-${num}.pdf`);
    toast.success('Downloaded PDF successfully!');
    setDownloading(false);
  };

  const sendPDFEmail = async () => {
    if (!invoiceRef.current) return;
    setSending(true);
    try {
      const doc = await generatePDFBlob(invoiceRef);
      const blob = doc.output('blob');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const form = new FormData();
        form.append('pdfBase64', reader.result as string);
        form.append('customerEmail', customer.email);
        form.append('invoiceId', num);
        form.append('clientName', customer.name);

        const resp = await createEmail(form);
        resp.message
          ? toast.success("Invoice emailed successfully!")
          : toast.error("Failed to send email.");
        setSending(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      toast.error("Failed to generate/send PDF.");
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <article
          ref={invoiceRef}
          className="relative bg-white mx-auto my-[10mm] w-[210mm] min-h-[297mm] p-[15mm]
                     border border-black print:border-0 print:shadow-none text-xs"
        >
          {/* Original for Recipient */}
          <span className="absolute top-[5mm] right-[5mm] text-xs italic text-gray-600">
            Original for Recipient
          </span>

          {/* Header */}
          <div className="flex items-start space-x-12 mb-4">
            <img
              src="/assets/img/companyLogo.webp"
              alt="InfoGentech Logo"
              className="h-[14mm]"
            />
            <div className="text-xs leading-snug space-y-1">
              <p><strong>Company:</strong> InfoGentech Softwares LLP</p>
              <p><strong>Website:</strong> www.infogentech.com</p>
              <p><strong>Email:</strong> info@infogentech.com</p>
              <p><strong>GSTIN:</strong> 07AAKFI8691P1ZC</p>
            </div>
          </div>

          {/* Company & Invoice Details */}
          <table className="w-full border-collapse border border-black text-xs mb-4">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 w-1/2 align-top space-y-1">
                  <p className="font-semibold">INFOGENTECH SOFTWARES LLP</p>
                  <p>A-85, First Floor, G.T. Karnal Road, Indl. Area</p>
                  <p>Near Vardhaman Mall</p>
                  <p>Delhi, 110033</p>
                  <p className="mt-1"><strong>GSTIN:</strong> 07AAKFI8691P1ZC</p>
                  <p><strong>Email:</strong> info@infogentech.com</p>
                </td>
                <td className="border border-black px-2 py-1 w-1/2 align-top space-y-1">
                  <div><strong>Date:</strong> {dayjs(date).format('DD-MM-YYYY')}</div>
                  <div className="mt-1"><strong>Invoice No:</strong> Proforma/{invoiceNumber}</div>
                  <div className="mt-1"><strong>Bill To:</strong> {customer.name}</div>
                  <div className="mt-1">
                    <strong>Address:</strong> {customer.address},{' '}
                    {customer.city} {customer.postalCode}
                  </div>
                  {customer.email && (
                    <div className="mt-1"><strong>Email:</strong> {customer.email}</div>
                  )}
                  {customer.phone && (
                    <div className="mt-1"><strong>Phone:</strong> {customer.phone}</div>
                  )}
                  {customer.gstin && (
                    <div className="mt-1"><strong>GSTIN:</strong> {customer.gstin}</div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Items & Totals */}
          <table className="w-full border-collapse border border-black text-sm mb-4">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead className="bg-gray-100">
              <tr>
                {['S. No.','Description','Quantity','Price (₹)','HSN Code','Total (₹)']
                  .map(h => (
                    <th
                      key={h}
                      className="border border-black px-3 py-2 text-center"
                    >
                      {h}
                    </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center text-[13px]">
              {displayRows.map((it, idx) => (
                <tr key={idx} style={{ height: '10mm' }}>
                  <td className="border-l border-r border-black px-3 py-2">
                    {it ? idx + 1 : ''}
                  </td>
                  <td className="border-l border-r border-black px-3 py-2">
                    {it?.description || ''}
                  </td>
                  <td className="border-l border-r border-black px-3 py-2">
                    {it?.quantity ?? ''}
                  </td>
                  <td className="border-l border-r border-black px-3 py-2 text-right">
                    {it ? `₹${it.price.toLocaleString('en-IN')}` : ''}
                  </td>
                  <td className="border-l border-r border-black px-3 py-2">
                    {it?.hsn || ''}
                  </td>
                  <td className="border-l border-r border-black px-3 py-2 text-right">
                    {it
                      ? `₹${(it.price * it.quantity).toLocaleString('en-IN')}`
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {[
                ['Taxable Amount (₹)', taxable],
                ['CGST (9%) (₹)', cgst],
                ['SGST (9%) (₹)', sgst],
                ['IGST (18%) (₹)', igst],
                ['Total Invoice Value (₹)', total],
              ].map(([label, val], i) => (
                <tr key={i} className={i === 4 ? 'bg-gray-100' : ''}>
                  <td colSpan={5}
                      className="border border-black px-2 py-1 text-right font-semibold">
                    {label}
                  </td>
                  <td className="border border-black px-2 py-1 font-semibold">
                    ₹{(val as number).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} className="border border-black p-0">
                  <div className="px-2 py-1 flex justify-between items-start text-xs font-semibold">
                    <span>Amount in Words:</span>
                    <span>{amountInWords}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Terms, Bank & Signature */}
          <div className="grid grid-cols-2 border border-black text-[10px] mb-4">
            {/* Terms & Conditions */}
            <div className="p-3 border-r border-black space-y-1">
              <p className="font-semibold uppercase">Terms &amp; Conditions</p>
              {[
                'Payment shall be made via Bank Transfer/Check/Online only.',
                'No direct UPI payments to employees.',
                'InfoGentech is not liable for personal account payments.',
                '3% late fee applies after 15 days on unpaid balances.',
                'Company may terminate services if payment is not made on time.',
                'Payment due within 5 days from the invoice date.',
                'All disputes are subject to Delhi jurisdiction.',
              ].map((t, i) => (
                <p key={i} className="flex items-start">
                  <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                  {t}
                </p>
              ))}
            </div>
            {/* Bank Details + QR */}
            <div className="p-3 space-y-2">
              <div className="space-y-1">
                <p className="font-semibold uppercase">Bank Details</p>
                <p>InfoGentech Softwares LLP</p>
                <p>Kotak Mahindra Bank, Model Town III, Delhi 110009</p>
                <p>Current Account: 1049022633</p>
                <p>IFSC: KKBK0004626</p>
              </div>
              <div className="text-center">
                <img
                  src="/assets/img/qr.webp"
                  alt="UPI QR"
                  className="h-[20mm] mx-auto"
                />
                <p className="font-semibold">UPI ID: infogentechsoftwares@kotak</p>
              </div>
            </div>
          </div>

          {/* Signature & Footer */}
          <div className="pt-3 border-t border-black text-center space-y-1 mb-4">
            <p className="font-semibold uppercase">For InfoGentech Softwares LLP</p>
            <img
              src="/assets/img/sign.webp"
              alt="Signature"
              className="h-[12mm] mx-auto"
            />
            <p className="font-semibold">Authorised Signatory</p>
          </div>
          <div className="border-t border-black py-1 text-center font-semibold">
            E. &amp; O.E.
          </div>
        </article>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 print:hidden mt-4">
          <Button
            onClick={sendPDFEmail}
            disabled={sending}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2"
          >
            {sending ? 'Sending…' : 'Send Email'}
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
