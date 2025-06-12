'use client';

import { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { updateLead } from '@services/leadService';
import { toast } from 'sonner';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import { Lead } from '@customTypes/index';

const projectStatuses = [
  'new',
  'contacted',
  'approved',
  'quotation_submitted',
  'quotation_approved',
  'invoice_issued',
  'invoice_accepted',
  'processing_payments',
  'completed', 
];

export default function AddProjectModal({
  isOpen,
  onClose,
  leadId,
  onProjectAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  onProjectAdded: (updatedLead: any) => void;
}) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('new');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Project title is required');
      return;
    }

    try {
      setLoading(true);
      const payload: Partial<Lead> = {
        projects: [{ title, status }],
      };
      const updated = await updateLead(leadId, payload);
      toast.success('Project added successfully');
      onProjectAdded(updated);
      onClose();
    } catch (err) {
      toast.error('Failed to save project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-600">Add Project</h2>
          <button
            onClick={onClose}
            className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
            aria-label="Close"
          >
            <RxCross2 />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Select Project Status" />
            </SelectTrigger>
            <SelectContent>
              {projectStatuses.map((statusKey) => (
                <SelectItem key={statusKey} value={statusKey}>
                  {statusKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
