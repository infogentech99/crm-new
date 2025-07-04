'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { toWords } from 'number-to-words';
import { toast } from 'sonner';
import LeadDetailsShimmer from '@components/ui/LeadDetailsShimmer';
import { Button } from '@components/ui/button';
import { generatePDFBlob } from '@utils/pdfGenerator';
import { InvoiceItem, CustomerData, InvoiceResponse } from '@customTypes/index';
import { getInvoiceById } from '@services/invoiceService';
import { createEmail } from '@services/emailService';

export default function FinalInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<{
    order: { id: string; totalAmount: number };
    customer: CustomerData;
    items: InvoiceItem[];
    invoiceDate: string;
    totals: { taxable: number; cgst: number; sgst: number; igst: number; total: number };
  }>({
    order: { id: '', totalAmount: 0 },
    customer: { name: '', address: '', city: '', state: '', postalCode: '', email: '', phone: '', gstn: '' },
    items: [],
    invoiceDate: '',
    totals: { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  });

  useEffect(() => {
    if (!id) return;

    async function fetchInvoice() {
      try {
        const response: InvoiceResponse = await getInvoiceById(id);
        // Log the full response and data for debugging
        console.log('Fetched Invoice Response:', response);
        console.log('Fetched Invoice Data:', response.data);

        const invoice = response.data;
        const taxable = invoice.totals?.taxable || 0;
        let cgst = 0,
          sgst = 0,
          igst = 0;
      const userState = (invoice.user?.state || "").trim().toLowerCase();
      if (userState === "delhi") {
          cgst = taxable * 0.09;
          sgst = taxable * 0.09;
        } else {
          igst = taxable * 0.18;
        }
        const total = taxable + cgst + sgst + igst;

        setData({
          order: { id: invoice._id, totalAmount: total },
          customer: {
            name: invoice.user?.name || '',
            address: invoice.user?.address || '',
            city: invoice.user?.city || '',
            state: invoice.user?.state || '',
            postalCode: invoice.user?.zipCode || '',
            email: invoice.user?.email || '',
            phone: invoice.user?.phone || '',
            gstn: invoice.user?.gstin || '',
          },
          items: (invoice.items || []).map((it: InvoiceItem) => ({
            description: it.description,
            quantity: it.quantity,
            price: it.price,
            hsn: it.hsn,
          })),
          invoiceDate: dayjs(invoice.date || invoice.createdAt).format('DD-MM-YYYY'),
          totals: { taxable, cgst, sgst, igst, total },
        });
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
        toast.error('Couldn’t load invoice details.');
      }
    }

    fetchInvoice();
  }, [id]);

  const downloadPDF = async () => {
    setDownloading(true);
    if (invoiceRef.current) {
      const pdf = await generatePDFBlob(invoiceRef);
      pdf.save(`Final-Invoice-${data.order.id}.pdf`);
      toast.success('Downloaded PDF successfully!');
    } else {
      toast.error('Failed to generate PDF: Invoice content not found.');
    }
    setDownloading(false);
  };

  const sendPDFEmail = async () => {
    setSending(true);
    if (!invoiceRef.current) {
      toast.error('Invoice content not found.');
      setSending(false);
      return;
    }

    try {
      const doc = await generatePDFBlob(invoiceRef);
      const blob = doc.output('blob');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const formData = new FormData();
        formData.append('pdfBase64', reader.result as string);
        formData.append('customerEmail', data.customer.email);
        formData.append('invoiceId', data.order.id);
        formData.append('clientName', data.customer.name);
        const res = await createEmail(formData);
        if (res.message) {
          toast.success('Invoice sent to Successfully email.');
        } else {
          toast.error('Failed to send invoice email.');
        }
        setSending(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to generate or send PDF:', err);
      toast.error('Failed to generate PDF.');
      setSending(false);
    }
  };

  if (!id) {
    return (
      <div className="p-4 text-center">
        <LeadDetailsShimmer />
      </div>
    );
  }

  const { order, customer, items, invoiceDate, totals } = data;
  const MIN_ROWS = 6;
  const displayRows = [
    ...items,
    ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null),
  ];
  const amountInWords = `${toWords(Math.round(totals.total))} Rupees Only`
    .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase());

  return (
   <div className="bg-gray-50 py-10">
          <div className="max-w-4xl mx-auto px-6">
            <article
              ref={invoiceRef}
              className="
              bg-white p-12 rounded-lg shadow-lg relative mb-5
              "
            >
  
              <span className="absolute top-[5mm] right-[5mm] text-xs italic text-gray-600">
                Original for Recipient
              </span>
  
              <div className="flex justify-between items-start mb-4">
                <Image
                  src="/assets/img/companyLogo.webp"
                  alt="InfoGentech Logo"
                  width={230}
                  height={45}
                />
                <div className="text-xs leading-snug space-y-1">
                  <p>
                    <strong>Company:</strong> InfoGentech Softwares LLP
                  </p>
                  <p>
                    <strong>Website:</strong> www.infogentech.com
                  </p>
                  <p>
                    <strong>Email:</strong> info@infogentech.com
                  </p>
                  <p>
                    <strong>GSTIN:</strong> 07AAKFI8691P1ZC
                  </p>
                </div>
              </div>
  
              <div className="font-bold text-xl flex justify-center border border-black border-b-0">PROFORMA INVOICE</div>
              <table className="w-full border-collapse border border-black text-xs">
  
                <tbody>
                  <tr>
                    <td className="border border-black px-2 py-1 align-top w-1/2 leading-snug space-y-1">
                      <p className="font-bold text-[16px]">INFOGENTECH SOFTWARES LLP</p>
                      <p> <strong>Address:</strong> A-85, First Floor, G.T. Karnal Road, Indl. Area</p>
                      <p>Near Vardhaman Mall</p>
                      <p>Delhi, 110033</p>
                      <p className="mt-1">
                        <strong>GSTIN:</strong> 07AAKFI8691P1ZC
                      </p>
                      <p>
                        <strong>Email:</strong> info@infogentech.com
                      </p>
                    </td>
                    <td className="border border-black px-2 py-1 align-top w-1/2 leading-snug">
                      <div>
                        <strong>Date:</strong> {invoiceDate}
                      </div>
                      <div className="mt-1">
                        <strong>Invoice No:</strong> Proforma/{order.id}
                      </div>
                      <div className="mt-1">
                        <strong>Bill To:</strong> {customer.name}
                      </div>
                      <div className="mt-1">
  <strong>Address:</strong> {customer.address}, {customer.city}, {customer.state} {customer.postalCode}
</div>
                      {customer.email && (
                        <div className="mt-1">
                          <strong>Email:</strong> {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="mt-1">
                          <strong>Phone:</strong> {customer.phone}
                        </div>
                      )}
                      {customer.gstn && (
                        <div className="mt-1">
                          <strong>GSTIN:</strong> {customer.gstn}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
  
              <table className="w-full border-collapse border border-white text-sm">
                <colgroup>
                  <col style={{ width: "2%" }} />
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                </colgroup>
  
                <thead className="text-[12px]">
                  <tr>
                    {[
                      "S. No.",
                      "Description",
                      "Quantity",
                      "Price (₹)",
                      "HSN Code",
                      "Total (₹)",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`
                          border border-black border-t-0
  
                          px-2 py-0.5
                          text-center
                          ${i === 0 ? "whitespace-nowrap" : ""}
                        `}
                      >
                        {h}
  
  
                      </th>
                    ))}
                  </tr>
                </thead>
  
                <tbody className="text-center text-[12px] ">
                  {displayRows.map((it, idx) => (
                    <tr
                      key={idx}
                      className="align-top"
                      style={{ height: "10mm" }}
                    >
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it ? idx + 1 : ""}
                      </td>
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it?.description || ""}
                      </td>
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it?.quantity ?? ""}
                      </td>
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it
                          ? `₹${(it.price ?? 0).toLocaleString("en-IN")}`
                          : ""}
                      </td>
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it?.hsn || ""}
                      </td>
                      <td className="border-l border-r border-black px-2 py-0.5 leading-snug">
                        {it
                          ? `₹${(((it.price ?? 0) * (it.quantity || 0)).toLocaleString(
                            "en-IN"
                          ))}`
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
  
  
                <tfoot className="text-[12px]">
                  {[
                    ["Taxable Amount (₹)", totals.taxable],
                    ["CGST (9%) (₹)", totals.cgst],
                    ["SGST (9%) (₹)", totals.sgst],
                    ["IGST (18%) (₹)", totals.igst],
                    ["Total Invoice Value (₹)", totals.total],
                  ].map(([label, val], i) => (
                    <tr key={i}>
                      <td
                        colSpan={5}
                        className="border border-black px-2 py-0.5 text-right font-semibold"
                      >
                        {label}
                      </td>
                      <td className="border border-black px-2 py-0.5 text-right">
                        {(val as number).toLocaleString("en-IN")}
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
  
              {/* Payment History */}
              {/* <div className="mb-6">
                <h6 className="font-semibold mb-2">Payment History</h6>
                {payments.length===0?
                  <p className="text-sm italic">No payments recorded for this invoice.</p>
                :
                  <table className="w-full text-sm border">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Txn. ID</th>
                        <th className="p-2">Amount (₹)</th>
                        <th className="p-2">Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pmt,idx)=>(
                        <tr key={pmt._id} className="border-t">
                          <td className="p-2">{idx+1}</td>
                          <td className="p-2">{dayjs(pmt.transactionDate).format("DD-MM-YYYY")}</td>
                          <td className="p-2">{pmt.transactionId}</td>
                          <td className="p-2">₹{pmt.amount.toLocaleString("en-IN")}</td>
                          <td className="p-2">{pmt.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              </div> */}
  
              {/* Terms & Bank & Sig */}
              <div className="grid grid-cols-2 border border-black text-[12px] border-t-0">
                <div className="p-3 border-r border-black leading-snug space-y-2">
                  <p className="font-semibold uppercase mb-1">Terms &amp; Conditions</p>
                  <div className="space-y-1">
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      Payment shall be made via Bank Transfer/Check/Online only.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      No direct UPI payments to employees.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      InfoGentech is not liable for personal account payments.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      3% late fee applies after 15 days on unpaid balances.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      Company may terminate services if payment is not made on time.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      Payment due within 5 days from the invoice date.
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-1 h-1 bg-black rounded-full mt-1 mr-2" />
                      All disputes are subject to Delhi jurisdiction.
                    </p>
                  </div>
  
                </div>
   
                <div className="p-2 leading-snug space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-x-3">
                    <div className="space-y-1">
                      <p className="font-semibold uppercase ">Bank Details</p>
                      <p className="">InfoGentech Softwares LLP</p>
                      <p className="">Kotak Mahindra Bank, Model Town III, Delhi 110009</p>
                      <p className="">Current Account: 1049022633</p>
                      <p className="">IFSC: KKBK0004626</p>
                    </div>
                    <div className="text-center space-y-1">
                      <Image
                        src="/assets/img/qr.webp"
                        alt="UPI QR"
                        width={120}
                        height={120}
                        className=" mx-auto"
                      />
                      <p className="font-semibold mb-0">
                        UPI ID: infogentechsoftwares@kotak
                      </p>
                    </div>
                  </div>
  
                  <div className="pt-3 border-t border-black flex flex-col items-end space-y-1 mr-1">
                    <p className="font-semibold uppercase mb-0">For InfoGentech Softwares LLP</p>
                    <Image
                      src="/assets/img/sign.webp"
                      alt="Signature"
                      width={100}
                      height={45}
                      className="h-[12mm]"
                    />
                    <p className="font-semibold mb-0">Authorised Signatory</p>
                  </div>
  
                </div>
  
                <div className="col-span-2 border-t border-black py-1 text-center font-semibold">
                  E. &amp; O.E.
                </div>
              </div>
            </article>
  
            <div className="flex justify-end space-x-4">
              <Button onClick={sendPDFEmail} disabled={sending} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2">
                {sending ? "Sending…" : "Send Email"}
              </Button>
              <Button onClick={downloadPDF} disabled={downloading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                {downloading ? "Downloading…" : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>
  );
}
