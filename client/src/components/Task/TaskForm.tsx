'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@components/ui/select';
import MultiSelectDropdown, { OptionType } from '@components/Common/MultiSelectDropdown';
import { createTask, updateTask } from '@services/taskService';
import { fetchUsers } from '@services/userService';
import { RxCross2 } from 'react-icons/rx';
import { TaskEmailSender } from './TaskEmailSender';
import { Task, User } from '@customTypes/index';

interface Props {
  data?: Task;
  mode: 'Create' | 'Edit';
  onClose: () => void;
}

export default function TaskForm({ data, mode, onClose }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    assignee: data?.assignee?.join(', ') || '',
    dueDate: data?.dueDate || '',
    priority: data?.priority || 'Medium',
    status: data?.status || 'Pending',
    repeat: data?.repeat || 'None',
  });

  const [users, setUsers] = useState<OptionType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<OptionType[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers();
        const formatted = response.users.map((user: User) => ({
          label: `${user.name} (${user.email})`,
          value: user.email,
        }));
        setUsers(formatted);
        if (mode === 'Edit') {
          const initialAssignees = data?.assignee || [];
          const assigneeEmails = initialAssignees.map((assignee) =>
            typeof assignee === 'string' ? assignee : assignee.email
          );

          const selected = formatted.filter((user) =>
            assigneeEmails.includes(user.value)
          );
          setSelectedUsers(selected);
          const manualEmails = assigneeEmails.filter(
            (email) => !selected.find((u) => u.value === email)
          );
          setFormData((prev) => ({
            ...prev,
            assignee: manualEmails.join(', '),
          }));
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, [mode, data]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const manualList = formData.assignee
        ? formData.assignee.split(',').map((p: string) => p.trim())
        : [];

      const allAssignees = [
        ...selectedUsers.map((u) => u.value),
        ...manualList,
      ].filter(Boolean);

      const payload = {
        ...formData,
        assignee: allAssignees,
      };

      if (data?._id) {
        await updateTask(data._id, payload);
        toast.success('Task updated successfully!');
      } else {
        await createTask(payload);
        toast.success('Task created successfully!');
      }

      TaskEmailSender({
        assignees: allAssignees,
        taskData: {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          status: formData.status,
        },
        mode: mode,
      });

      router.push('/dashboard/tasks');
      onClose();
    } catch (err) {
      console.error('Task submission error:', err);
      toast.error('Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === 'Edit' ? 'Edit Task' : 'Create Task'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
          aria-label="Close"
        >
          <RxCross2 />
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
          </div>


          <div>
            <label className="text-sm font-medium mb-1 block">Due Date</label>
            <Input type="date" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Priority</label>
            <Select value={formData.priority} onValueChange={(val) => handleChange('priority', val)}>
              <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Repeat</label>
            <Select value={formData.repeat} onValueChange={(val) => handleChange('repeat', val)}>
              <SelectTrigger><SelectValue placeholder="Repeat schedule" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Assignee (comma-separated emails)</label>
            <Input value={formData.assignee} onChange={(e) => handleChange('assignee', e.target.value)} placeholder="Enter name or email" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Assign Team Members</label>
            <MultiSelectDropdown options={users} selected={selectedUsers} setSelected={setSelectedUsers} placeholder="Select users" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : mode === 'Edit' ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
