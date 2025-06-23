"use client";

import LeadDetailsShimmer from "@components/ui/LeadDetailsShimmer";
import { createEmail } from "@services/emailService";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useParams } from 'next/navigation';
import Image from 'next/image'; // Import Image component
import { QuotationItem } from "@customTypes/index";
import { Button } from "@components/ui/button";
import { generatePDFBlob } from "@utils/pdfGenerator";
import dayjs from "dayjs";
import { getQuotationById } from "@services/quotationService";

export default function Page() {
    const params = useParams();
    const id = params?.id as string;
    const invoiceRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const [sending, setSending] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState({
        order: { id: "", totalAmount: 0 },
        customer: { name: "", address: "", city: "", postalCode: "", email: "", phone: "", gstn: "" }, // Added gstn
        items: [] as QuotationItem[], // Explicitly type items as QuotationItem[]
        invoiceDate: "",
        totals: { taxable: 0, igst: 0, total: 0 },
    });

    useEffect(() => {
        if (!id) return;

        getQuotationById(id)
            .then((quotation) => { // Directly use quotation as the response
                setData({
                    order: {
                        id: quotation._id,
                        totalAmount: quotation.totals?.total || 0,
                    },
                    customer: {
                        name: quotation.user?.name || '',
                        address: quotation.user?.address || '',
                        city: quotation.user?.city || '',
                        postalCode: quotation.user?.zipCode || '',
                        email: quotation.user?.email || '',
                        phone: quotation.user?.phone || '',
                        gstn: quotation.user?.gstin || '',
                    },
                    items: (quotation.items || []).map((item: QuotationItem) => ({
                        name: item.description || '', // Assuming name can be description
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.price, // Assuming unitPrice is the same as price
                        total: item.quantity * item.price, // Calculate total
                        price: item.price,
                        hsn: item.hsn,
                    })),
                    invoiceDate: dayjs(quotation.date || quotation.createdAt).format("DD/MM/YYYY"),
                    totals: {
                        taxable: quotation.totals?.taxable || 0,
                        igst: quotation.totals?.igst || 0,
                        total: quotation.totals?.total || 0,
                    },
                });
            })
            .catch((err) => {
                console.error("Failed to fetch quotation:", err);
                toast.error("Failed to load quotation."); // Use toast for error
            });
    }, [id]);

     useEffect(() => {
       document.title = "Quotation Details – CRM Application";
     }, []);

    const downloadPDF = async () => {
        setDownloading(true);
        const doc = await generatePDFBlob(invoiceRef);
        doc.save(`invoice-${data.order.id}.pdf`);
        toast.success("Quotation Download successfully.");
        setDownloading(false);
    };
    const sendPDFEmail = async () => {
        setSending(true);
        try {
            const doc = await generatePDFBlob(invoiceRef);
            const blob = doc.output("blob");

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;

                const formData = new FormData();
                formData.append("pdfBase64", base64 as string);
                formData.append("customerEmail", data.customer.email);
                formData.append("invoiceId", data.order.id);
                formData.append("clientName", data.customer.name);

                try {
                    const response = await createEmail(formData);

                    if (response.message) {
                        toast.success("Invoice sent to customer's email.");
                    } else {
                        toast.error("Failed to send invoice email.");
                    }
                } catch (err) {
                    console.error("Email send error:", err);
                    toast.error("Failed to send invoice email.");
                } finally {
                    setSending(false);
                }
            };

            reader.readAsDataURL(blob);
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF.");
            setSending(false);
        }
    };


    if (!id) return <p className="p-4 text-center"><LeadDetailsShimmer /></p>;

    const { order, customer, items, invoiceDate, totals } = data; // Removed payment
    const subtotal = totals.taxable;
    const total = totals.total;

    return (
        <>
            <div className="bg-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div ref={invoiceRef} className="bg-white p-6 shadow rounded-lg">
                        <div className="flex justify-between border-b pb-4">

                            <div>
                                <Image src="/assets/img/companyLogo.webp" alt="Company Logo" width={100} height={64} className="h-16 mb-2" />
                                <h5 className="text-lg font-bold">INFOGENTECH SOFTWARES LLP</h5>
                                <p className="text-sm leading-tight">
                                    <strong>Address:</strong> A-85, First Floor, G.T. Karnal Road,<br />
                                    Indl Area, Near Vardhaman Mall,<br />
                                    Delhi, 110033<br />
                                    <strong>Website:</strong> www.infogentech.com
                                </p>
                            </div>
                            <div className="text-right mt-16">
                                <h4 className="text-xl font-semibold text-blue-600">PROFORMA INVOICE</h4>
                                <p className="text-sm"><strong>Date:</strong> {invoiceDate}</p>
                                <p className="text-sm"><strong>Quotation No:</strong> {order.id}</p>
                                <p className="text-sm"><strong>GSTIN:</strong> 07AAKFI8691P1ZC</p>
                                <p className="text-sm"><strong>Email:</strong> info@infogentech.com</p>
                            </div>
                        </div>
                        <div className="mt-4 border-b pb-4">
                            <h6 className="font-semibold">Bill To:</h6>
                            <p className="text-sm font-medium">{customer.name}</p>
                            <p className="text-sm">Address: {customer.address}, {customer.city} {customer.postalCode}</p>
                            <p className="text-sm">Email: {customer.email}</p>
                            <p className="text-sm">Phone: {customer.phone}</p>
                            <p className="text-sm">GSTN: {customer.gstn}</p>
                        </div>

                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-200 text-left">
                                    <tr>
                                        <th className="p-2">S No.</th>
                                        <th className="p-2">Description</th>
                                        <th className="p-2">Quantity</th>
                                        <th className="p-2">Price (Rs.)</th>
                                        <th className="p-2">HSN Code</th>
                                        <th className="p-2 text-right">Total (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it: QuotationItem, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-2">{i + 1}</td>
                                            <td className="p-2">{it.description}</td>
                                            <td className="p-2">{it.quantity}</td>
                                            <td className="p-2">₹{it.price.toLocaleString("en-IN")}</td>
                                            <td className="p-2">{it.hsn}</td>
                                            <td className="p-2 text-right">₹{(it.quantity * it.price).toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 border-t pt-4 flex justify-end">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-sm py-1">
                                    <span>Taxable Amount (Rs.)</span>
                                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span>CGST (9%)</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span>SGST (9%)</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between text-sm py-1">
                                    <span>IGST (18%)</span>
                                    <span>₹{totals.igst.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                                    <span>Total Invoice Value</span>
                                    <span>₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h6 className="font-bold mb-2">BANK DETAILS</h6>
                            <div className="flex flex-col md:flex-row md:justify-between">
                                <div className="text-sm">
                                    <p>Infogentech Softwares LLP</p>
                                    <p>Kotak Mahindra Bank</p>
                                    <p>Model Town 3, Delhi 110009</p>
                                    <p>Current Account: 1049022633</p>
                                    <p>IFSC: KKBK0004626</p>
                                </div>
                                <div className="text-center mt-4 md:mt-0">
                                    <Image src="/assets/img/qr.webp" alt="QR Code" width={160} height={160} className="h-40 mx-auto" />
                                    <p className="font-semibold mt-2">UPI ID : Infogentechsoftwares@kotak</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h6 className="font-bold mb-2">TERMS AND CONDITIONS</h6>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Payment shall be made via Bank Transfer/Check/Online</li>
                                <li>Do not make direct payments on UPI of Employees</li>
                                <li>Infogentech is not liable for personal account payments</li>
                                <li>A late payment fee of 3% will be incurred on unpaid balances after 15 days</li>
                                <li>The company reserves the right to terminate if payment is not made within stipulated time</li>
                                <li>Payment is due within 5 days from the date of the invoice</li>
                                <li>All disputes are subject to Delhi Jurisdiction</li>
                            </ul>
                        </div>

                        <div className="mt-6 text-right">
                            <Image src="/assets/img/sign.webp" alt="Signature" width={100} height={64} className="h-16 ml-auto " />
                            <p className="font-semibold">Authorised Signatory</p>
                            <p className="text-sm">For INFOGENTECH SOFTWARES LLP</p>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            className="mx-2 !bg-yellow-500 !hover:bg-yellow-600 !text-white px-4 py-2 rounded focus:outline-none !active:bg-yellow-500"
                            onClick={sendPDFEmail}
                        >

                            {sending ? <span className="loader mr-2"></span> : null}
                            {sending ? "Sending..." : "Send Email"}
                        </Button>

                        <Button
                            className="!bg-blue-600 !hover:bg-blue-700 !text-white px-4 py-2 rounded focus:outline-none !active:bg-blue-600"
                            onClick={downloadPDF}
                        >

                            {downloading ? <span className="loader mr-2"></span> : null}
                            {downloading ? "Downloading..." : "Download PDF"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
