"use client";

import LeadDetailsShimmer from "@components/ui/LeadDetailsShimmer";
import { createEmail } from "@services/emailService";
import { getQuotationById } from "@services/quotationService";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import DashboardLayout from "@components/Dashboard/DashboardLayout";
import { QuotationItem } from "@customTypes/index";
import { Button } from "@components/ui/button";
import { generatePDFBlob } from "@utils/pdfGenerator";
import dayjs from "dayjs";
import { toWords } from "number-to-words";

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<{
    order: { id: string; totalAmount: number };
    customer: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      email: string;
      phone: string;
      gstn?: string;
    };
    items: QuotationItem[];
    invoiceDate: string;
    totals: {
      taxable: number;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    };
  }>({
    order: { id: "", totalAmount: 0 },
    customer: {
      name: "",
      address: "",
      city: "",
      postalCode: "",
      email: "",
      phone: "",
    },
    items: [],
    invoiceDate: "",
    totals: { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  });

  useEffect(() => {
    if (!id) return;
    getQuotationById(id)
      .then((res) => {
        const q = res.data;
        const taxable = q.totals?.taxable || 0;
        let cgst = 0,
          sgst = 0,
          igst = 0;
        if ((q.user?.city || "").trim().toLowerCase() === "delhi") {
          cgst = taxable * 0.09;
          sgst = taxable * 0.09;
        } else {
          igst = taxable * 0.18;
        }
        const total = taxable + cgst + sgst + igst;
        setData({
          order: { id: q._id, totalAmount: q.totals?.total || 0 },
          customer: {
            name: q.user?.name || "",
            address: q.user?.address || "",
            city: q.user?.city || "",
            postalCode: q.user?.zipCode || "",
            email: q.user?.email || "",
            phone: q.user?.phone || "",
            gstn: q.user?.gstin || "",
          },
          items: (q.items || []).map((it: QuotationItem) => ({
            description: it.description,
            quantity: it.quantity,
            price: it.price,
            hsn: it.hsn,
          })),
          invoiceDate: dayjs(q.date || q.createdAt).format("DD-MM-YYYY"),
          totals: { taxable, cgst, sgst, igst, total },
        });
      })
      .catch(() => {
        toast.error("Failed to load quotation.");
      });
  }, [id]);

  useEffect(() => {
    document.title = "Quotation Details – CRM Application";
  }, []);

  const downloadPDF = async () => {
    setDownloading(true);
    const pdf = await generatePDFBlob(invoiceRef);
    pdf.save(`quotation-${data.order.id}.pdf`);
    toast.success("Downloaded PDF successfully!");
    setDownloading(false);
  };

  const sendPDFEmail = async () => {
    setSending(true);
    try {
      const doc = await generatePDFBlob(invoiceRef);
      const blob = doc.output("blob");
      const reader = new FileReader();
      reader.onloadend = async () => {
        const formData = new FormData();
        formData.append("pdfBase64", reader.result as string);
        formData.append("customerEmail", data.customer.email);
        formData.append("invoiceId", data.order.id);
        formData.append("clientName", data.customer.name);

        const response = await createEmail(formData);
        response.message
          ? toast.success("Quotation sent to customer’s email.")
          : toast.error("Failed to send quotation email.");
        setSending(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      toast.error("Failed to generate PDF.");
      setSending(false);
    }
  };

  if (!id) {
    return (
      <p className="p-4 text-center">
        <LeadDetailsShimmer />
      </p>
    );
  }

  const { order, customer, items, invoiceDate, totals } = data;
  const MIN_ROWS = 6;
  const displayRows = [
    ...items,
    ...Array.from({ length: Math.max(0, MIN_ROWS - items.length) }, () => null),
  ];
   const amountInWords = `${toWords(Math.round(totals.total))
    .replace(/(^\w|\s\w)/g, m => m.toUpperCase())} Rupees Only`;

  return (
    <DashboardLayout>
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* A4 Invoice Container */}
          <article
            ref={invoiceRef}
            className="
              relative bg-white mx-auto
              my-[10mm] w-[210mm] min-h-[297mm]
              p-[15mm]
              border border-black
              print:shadow-none print:border-0 print:m-0
              print:w-[210mm] print:min-h-[297mm]
               text-xs
            "
          >
            {/* “Original for Recipient” */}
            <span className="absolute top-[5mm] right-[5mm] text-xs italic text-gray-600">
              Original for Recipient
            </span>

            {/* Top meta: logo + company info */}
            <div className="flex items-start space-x-12">
              <img
                src="/assets/img/companyLogo.webp"
                alt="InfoGentech Logo"
                className="h-[14mm]"
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

            {/* 1) Company & Invoice Details */}
            <table className="w-full border-collapse border border-black text-xs">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 align-top w-1/2 leading-snug space-y-1">
                    <p className="font-semibold">INFOGENTECH SOFTWARES LLP</p>
                    <p>A-85, First Floor, G.T. Karnal Road, Indl. Area</p>
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
                      <strong>Address:</strong> {customer.address},{" "}
                      {customer.city} {customer.postalCode}
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

            {/* 2) Items & Totals */}
            <table className="w-full border-collapse border border-black text-sm">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>

              <thead className="bg-gray-100">
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
                        border border-black
                        px-3 py-2
                        text-center
                        ${i === 0 ? "whitespace-nowrap" : ""}
                      `}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-center text-[13px]">
                {displayRows.map((it, idx) => (
                  <tr
                    key={idx}
                    className="align-top"
                    style={{ height: "10mm" }}
                  >
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it ? idx + 1 : ""}
                    </td>
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it?.description || ""}
                    </td>
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it?.quantity ?? ""}
                    </td>
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it
                        ? `₹${it.price.toLocaleString("en-IN")}`
                        : ""}
                    </td>
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it?.hsn || ""}
                    </td>
                    <td className="border-l border-r border-black px-3 py-2 leading-snug">
                      {it
                        ? `₹${(it.price * it.quantity).toLocaleString(
                            "en-IN"
                          )}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Amount in Words row */}
              {/* <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="border border-black px-2 py-1 text-left font-semibold"
                  >
                    Amount in Words:
                  </td>
                  <td className="border border-black px-2 py-1">
                    {amountInWords}
                  </td>
                </tr>
              </tbody> */}

              <tfoot>
                {[
                  ["Taxable Amount (₹)", totals.taxable],
                  ["CGST (9%) (₹)", totals.cgst],
                  ["SGST (9%) (₹)", totals.sgst],
                  ["IGST (18%) (₹)", totals.igst],
                  ["Total Invoice Value (₹)", totals.total],
              ].map(([label, val], i) => (
                <tr key={i} className={i === 4 ? "bg-gray-100" : ""}>
                  <td
                    colSpan={5}
                    className="border border-black px-2 py-1 text-right font-semibold"
                  >
                    {label}
                  </td>
                  <td className="border border-black px-2 py-1 font-semibold">
                    ₹{(val as number).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}

              {/* Amount in Words */}
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
<div className="grid grid-cols-2 border border-black text-[10px]">
  {/* Terms & Conditions */}
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

  {/* Bank Details + QR in two columns, then Signature */}
  <div className="p-3 leading-snug space-y-4">
    {/* Bank & QR side-by-side */}
    <div className="grid grid-cols-2 gap-x-2">
      {/* Left: Bank Details */}
      <div className="space-y-1">
        <p className="font-semibold uppercase mb-0">Bank Details</p>
        <p className="mb-0">InfoGentech Softwares LLP</p>
        <p className="mb-0">Kotak Mahindra Bank, Model Town III, Delhi 110009</p>
        <p className="mb-0">Current Account: 1049022633</p>
        <p className="mb-0">IFSC: KKBK0004626</p>
      </div>
      {/* Right: QR Code + UPI ID */}
      <div className="text-center space-y-1">
        <img
          src="/assets/img/qr.webp"
          alt="UPI QR"
          className="h-[20mm] mx-auto"
        />
        <p className="font-semibold mt-1 mb-0">
          UPI ID: infogentechsoftwares@kotak
        </p>
      </div>
    </div>

    {/* Signature Panel */}
    <div className="pt-3 border-t border-black text-center space-y-1">
      <p className="font-semibold uppercase mb-0">
        For InfoGentech Softwares LLP
      </p>
      <img
        src="/assets/img/sign.webp"
        alt="Signature"
        className="h-[12mm] mx-auto"
      />
      <p className="font-semibold mb-0">Authorised Signatory</p>
    </div>
  </div>

  {/* E. & O.E. footer */}
  <div className="col-span-2 border-t border-black py-1 text-center font-semibold">
    E. &amp; O.E.
  </div>
</div>



          </article>

          {/* Action Buttons (hidden in print) */}
          <div className="flex justify-end space-x-4 print:hidden">
            <Button
              onClick={sendPDFEmail}
              disabled={sending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2"
            >
              {sending ? "Sending…" : "Send Email"}
            </Button>
            <Button
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {downloading ? "Downloading…" : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
