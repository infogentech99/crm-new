'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLeadById, updateLead } from '@services/leadService';
import dayjs from 'dayjs';
import Modal from '@components/Common/Modal';
import LeadForm from '@components/Leads/Leadform';
import { Button } from '@components/ui/button';
import EmailComposer from '@components/EmailComposer';
import { toast } from 'sonner';
import LeadNotes from '@components/Leads/LeadNotes';
import PipelineStepper from '@components/ui/PipelineStepper';
import { LeadStatus, Lead, Project, Note, Transaction } from '@customTypes/index';
import LeadDetailsShimmer from '@components/ui/LeadDetailsShimmer';
import QuotationForm from '@components/Quotation/QuotationForm';
import InvoiceForm from '@components/invoice/InoviceForm';
import AddProjectModal from '@components/AddProjectModal';
import ProjectSelector from '@components/Leads/ProjectSelector'
import TransactionList from '@components/Leads/TransactionList';
import { RxCross2 } from 'react-icons/rx';
import DeleteModal from '@components/Common/DeleteModal';
export default function LeadDetailsPage() {
    const { id } = useParams();
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lead, setLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
     useEffect(() => {
       document.title = "Leads Details – CRM Application";
     }, []);
    useEffect(() => {
        const fetchLead = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getLeadById(id as string);
                setLead(data);

            } catch (err: unknown) {
                setError((err as Error).message || 'Failed to fetch lead');
            } finally {
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    const handleStatusChange = async (newStatus: LeadStatus) => {
        if (!lead || !lead.projects || lead.projects.length === 0 || selectedProject === undefined || lead.projects[selectedProject] === undefined) {
            toast.error('Please add a project first.');
            return;
        }

        if (lead.projects[selectedProject].status === newStatus) return;

        try {
            const updatedProjects = lead.projects.map((project: Project, index: number) =>
                index === selectedProject
                    ? { ...project, status: newStatus }
                    : project
            );

            const updatedLead = await updateLead(lead._id, {
                projects: updatedProjects,
            });

            setLead(updatedLead);
            toast.success('Project status updated successfully');
        } catch (err: unknown) {
            toast.error((err as Error).message || 'Failed to update project status');
        }
    };

    const handleEditProject = (index: number) => {
        if (!lead) return; // Add null check
        setEditTitle(lead.projects[index].title || '');
        setEditIndex(index);
        setIsEditModalOpen(true);
    };

    const handleDeleteProject = (index: number) => {
        if (!lead) return; // Add null check
        setDeleteIndex(index);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (deleteIndex === null || !lead) return; // Add null check

        const updatedProjects = lead.projects.filter((_: Project, i: number) => i !== deleteIndex);

        try {
            const updated = await updateLead(lead._id, { projects: updatedProjects });
            setLead(updated);
            toast.success("Project deleted successfully");
            if (selectedProject === deleteIndex) setSelectedProject(0);
        } catch {
            toast.error("Failed to delete project");
        } finally {
            setDeleteIndex(null);
            setIsDeleteModalOpen(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (editIndex === null || !editTitle.trim() || !lead) return; // Add null check

        const updatedProjects = lead.projects.map((p: Project, i: number) =>
            i === editIndex ? { ...p, title: editTitle.trim() } : p
        );

        try {
            const updated = await updateLead(lead._id, { projects: updatedProjects });
            setLead(updated);
            toast.success("Project title updated");
            setIsEditModalOpen(false);
            setEditIndex(null);
        } catch {
            toast.error("Failed to update title");
        }
    };

    if (loading) return <LeadDetailsShimmer />;
    if (error) {
        return (
            <DashboardLayout>
                <div className="text-red-500 text-center p-6 rounded-lg shadow-md">
                    Error loading lead: {error}
                </div>
            </DashboardLayout>
        );
    }

    if (!lead) {
        return (
            <DashboardLayout>
                <div className="text-gray-600 text-center p-6 rounded-lg shadow-md">
                    No lead found with this ID.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
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
                leadId={lead!._id}
                notes={lead!.notes || []}
                onNotesUpdated={(updatedNotes: Note[]) => setLead((prev: Lead | null) => (prev ? { ...prev, notes: updatedNotes } : null))}
            />
            <div className='bg-white shadow-sm rounded-md my-6 p-4'>
                <ProjectSelector
                    projects={lead!.projects || []}
                    selectedProjectIndex={selectedProject}
                    onSelect={(index: number) => setSelectedProject(index)}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                />
                <PipelineStepper
                    currentStatus={lead!.projects?.[selectedProject]?.status || 'new'}
                    onStatusChange={(status: string) => handleStatusChange(status as LeadStatus)}
                    onCreateQuotation={() => setIsQuotationOpen(true)}
                    onCreateInvoice={() => setIsInvoiceOpen(true)}
                />
            </div>
            <TransactionList
                transactions={
                    (lead!.transactions || []).filter(
                        (txn: Transaction) =>
                            txn.projectId === lead!.projects?.[selectedProject]?._id
                    )
                }
                projects={lead!.projects}
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
                    data={lead!}
                    projectId={lead!.projects?.[selectedProject]?._id || null}
                    onClose={() => {
                        setIsInvoiceOpen(false);
                    }}
                />
            </Modal>

            <EmailComposer
                toEmail={lead!.email}
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
            />
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} widthClass='max-w-md'>
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-blue-600">
                            Edit Project Title
                        </h2>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
                            aria-label="Close"
                        >
                            <RxCross2 />
                        </button>
                    </div>
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new project title"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitEdit}>Update</Button>
                    </div>
                </div>
            </Modal>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteIndex(null);
                }}
                onConfirm={confirmDeleteProject}
                itemLabel={deleteIndex !== null && lead!.projects?.[deleteIndex]?.title ? lead!.projects[deleteIndex].title : "Project"}
                title="Delete Project"
            />

        </>
    );
}
