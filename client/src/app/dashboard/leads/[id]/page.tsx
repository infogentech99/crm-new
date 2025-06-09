'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLeadById, updateLead } from '@services/leadService';
import DashboardLayout from '@components/Dashboard/DashboardLayout';
import dayjs from 'dayjs';
import Modal from '@components/Common/Modal';
import LeadForm from '@components/Leads/Leadform';
import { Button } from '@components/ui/button';
import EmailComposer from '@components/EmailComposer';
import { toast } from 'sonner';
import LeadNotes from '@components/Leads/LeadNotes';
import PipelineStepper from '@components/ui/PipelineStepper';
import { LeadStatus } from '@customTypes/index';
import LeadDetailsShimmer from '@components/ui/LeadDetailsShimmer';
import QuotationForm from '@components/Quotation/QuotationForm';

export default function LeadDetailsPage() {
    const { id } = useParams();
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lead, setLead] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);

    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getLeadById(id as string);
                setLead(data);
                console.log(data, "updaeted")

            } catch (err: any) {
                setError(err.message || 'Failed to fetch lead');
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);


    const handleStatusChange = async (newStatus: LeadStatus) => {
        if (lead.status === newStatus) return;

        try {
            const updatedLead = await updateLead(lead._id, { status: newStatus });
            setLead(updatedLead);
            toast.success('Status updated successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    if (loading) return <LeadDetailsShimmer />;
    return (
        <DashboardLayout>
            <div className="w-full px-8 py-6 bg-white shadow-sm rounded-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Lead Details</h2>
                    <div className="space-x-2">
                        <Button
                            onClick={() => setIsEmailModalOpen(true)}
                        >
                            Send Email
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedLead(lead);
                                setIsModalOpen(true);
                            }}
                        >
                            Edit Details
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {lead?.name || '-'}</p>
                        <p><strong>Email:</strong> {lead?.email || '-'}</p>
                        <p><strong>Phone:</strong> {lead?.phone || '-'}</p>
                        <p><strong>Job Title:</strong> {lead?.jobTitle || '-'}</p>
                        <p><strong>Company:</strong> {lead?.company || '-'}</p>
                        <p><strong>Industry:</strong> {lead?.industry || '-'}</p>
                        <p><strong>City:</strong> {lead?.city || '-'}</p>
                        <p><strong>State:</strong> {lead?.state || '-'}</p>
                        <p><strong>Country:</strong> {lead?.country || '-'}</p>
                        <p><strong>Zip Code:</strong> {lead?.zipCode || '-'}</p>
                        <p>
                            <strong>Website:</strong>{' '}
                            {lead?.website ? (
                                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    {lead.website}
                                </a>
                            ) : (
                                '-'
                            )}
                        </p>
                        <p>
                            <strong>LinkedIn:</strong>{' '}
                            {lead?.linkedIn ? (
                                <a href={lead.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    {lead.linkedIn}
                                </a>
                            ) : (
                                '-'
                            )}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p><strong>Lead Status:</strong> {lead?.status || '-'}</p>
                        <p><strong>Source:</strong> {lead?.source || '-'}</p>
                        <p><strong>Best Time To Call:</strong> {lead?.bestTimeToCall || '-'}</p>
                        <p><strong>Call Response:</strong> {lead?.callResponse || '-'}</p>
                        <p><strong>Address:</strong> {lead?.address || '-'}</p>
                        <p><strong>Remark:</strong> {lead?.remark || '-'}</p>
                        <p><strong>Added By:</strong> {lead?.createdBy?.name || '-'}</p>
                        <p><strong>Added At:</strong> {lead?.createdAt ? dayjs(lead.createdAt).format('DD MMM YYYY, hh:mm A') : '-'}</p>
                        <p><strong>Updated At:</strong> {lead?.updatedAt ? dayjs(lead.updatedAt).format('DD MMM YYYY, hh:mm A') : '-'}</p>
                    </div>
                </div>
            </div>
            <PipelineStepper
                currentStatus={lead.status}
                onStatusChange={(status: string) => handleStatusChange(status as LeadStatus)}
                onCreateQuotation={() => setIsQuotationOpen(true)}
            />

            <LeadNotes
                leadId={lead._id}
                notes={lead.notes || []}
                onNotesUpdated={(updatedNotes) => setLead((prev: any) => ({ ...prev, notes: updatedNotes }))}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLead(null);
                }}
                widthClass="max-w-3xl"
            >
                <LeadForm
                    initialData={selectedLead || undefined}
                    mode="edit"
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedLead(null);
                    }}
                />
            </Modal>
            <Modal
                isOpen={isQuotationOpen}
                onClose={() => setIsQuotationOpen(false)}
                widthClass="max-w-5xl"
            >
                <QuotationForm
                    mode="Create"
                    leadData={lead}
                />
            </Modal>
            <EmailComposer
                toEmail={lead.email}
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
            />
        </DashboardLayout>
    );
}


