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
import InvoiceForm from '@components/invoice/InoviceForm';
import AddProjectModal from '@components/AddProjectModal';
import ProjectSelector from '@components/Leads/ProjectSelector'
import TransactionList from '@components/Leads/TransactionList';
export default function LeadDetailsPage() {
    const { id } = useParams();
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lead, setLead] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(0);
    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getLeadById(id as string);
                setLead(data);
                console.log(data, "updated")

            } catch (err: any) {
                setError(err.message || 'Failed to fetch lead');
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    const handleStatusChange = async (newStatus: LeadStatus) => {
        if (lead.projects[selectedProject].status === newStatus) return;

        try {
            const updatedProjects = lead.projects.map((project: object, index: number) =>
                index === selectedProject
                    ? { ...project, status: newStatus }
                    : project
            );

            const updatedLead = await updateLead(lead._id, {
                projects: updatedProjects,
            });

            setLead(updatedLead);
            toast.success('Project status updated successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update project status');
        }
    };





    if (loading) return <LeadDetailsShimmer />;
    return (
        <DashboardLayout>
            <div className="w-full px-8 py-6 bg-white shadow-sm rounded-md mb-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Lead Details</h2>
                    <div className="space-x-2">
                        <Button onClick={() => setIsProjectModalOpen(true)}>Add Project</Button>
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
                        <p><strong>Position:</strong> {lead?.position || '-'}</p>
                        <p><strong>Company:</strong> {lead?.company || '-'}</p>
                        <p><strong>Industry:</strong> {lead?.industry || '-'}</p>
                        <p><strong>State:</strong> {lead?.state || '-'}</p>
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
                        <p><strong>Current Project:</strong> {lead.projects?.[selectedProject]?.title || '-'}</p>
                        <p><strong>Project Status:</strong> {lead.projects?.[selectedProject]?.status || '-'}</p>
                        <p><strong>Source:</strong> {lead?.source || '-'}</p>
                        <p><strong>Best Time To Call:</strong> {lead?.bestTimeToCall || '-'}</p>
                        <p><strong>Call Response:</strong> {lead?.callResponse || '-'}</p>
                        <p><strong>Address:</strong> {lead?.address || '-'}</p>
                        <p><strong>Remark:</strong> {lead?.remark || '-'}</p>
                        <p><strong>Added At:</strong> {lead?.createdAt ? dayjs(lead.createdAt).format('DD MMM YYYY, hh:mm A') : '-'}</p>
                        <p><strong>Updated At:</strong> {lead?.updatedAt ? dayjs(lead.updatedAt).format('DD MMM YYYY, hh:mm A') : '-'}</p>
                    </div>
                </div>
            </div>
            
            <LeadNotes
                leadId={lead._id}
                notes={lead.notes || []}
                onNotesUpdated={(updatedNotes) => setLead((prev: any) => ({ ...prev, notes: updatedNotes }))}
            />
            <div className='bg-white shadow-sm rounded-md my-6 p-4'>
                <ProjectSelector
                projects={lead.projects || []}
                selectedProjectIndex={selectedProject}
                onSelect={(index: any) => {
                    setSelectedProject(index);
                }}
            />
            <PipelineStepper
                currentStatus={lead.projects?.[selectedProject]?.status || 'new'}
                onStatusChange={(status: string) => handleStatusChange(status as LeadStatus)}
                onCreateQuotation={() => setIsQuotationOpen(true)}
                onCreateInvoice={() => setIsInvoiceOpen(true)}
            />
            </div>
            <TransactionList
                transactions={
                    (lead.transactions || []).filter(
                        (txn: any) =>
                            txn.projectId === lead.projects?.[selectedProject]?._id
                    )
                }
                projects={lead.projects}
            />

            <AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                leadId={lead._id}
                onProjectAdded={(updatedLead) => setLead(updatedLead)}
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
                    mode="Edit"
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
                    data={lead}
                    onClose={() => {
                        setIsQuotationOpen(false);
                    }}
                />
            </Modal>
            <Modal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                widthClass="max-w-5xl"
            >
                <InvoiceForm
                    mode="Create"
                    data={lead}
                    projectId={lead?.projects?.[selectedProject]?._id || null}
                    onClose={() => {
                        setIsInvoiceOpen(false);
                    }}
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


