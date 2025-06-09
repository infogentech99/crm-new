// File: src/components/Meetings/MeetingForm.tsx
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createMeeting, updateMeeting } from '@services/meetingService';
import { X } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Meeting } from '@customTypes/index';

// Define validation schema using Zod
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date & time is required'),
  duration: z.number({ invalid_type_error: 'Duration must be a number' }).min(1, 'Duration must be at least 1 minute'),
  location: z.string().optional(),
  participants: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
});

type FormData = z.infer<typeof schema>;

interface MeetingFormProps {
  initialData?: Meeting;
  onClose: () => void;
  mode: 'create' | 'edit';
}

const MeetingForm: React.FC<MeetingFormProps> = ({ initialData, onClose, mode }) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      date: '',
      duration: 30,
      location: '',
      participants: '',
      description: '',
      status: 'scheduled',
    },
  });

  const queryClient = useQueryClient();

 useEffect(() => {
  if (initialData) {
    const {
      title,
      date: rawDate,
      duration,
      location,
      participants,
      description,
      status,
    } = initialData;

    form.reset({
      title: title || '',
      date: rawDate
        ? new Date(rawDate).toISOString().slice(0, 16)
        : '',
      duration: duration ?? 30,
      location: location || '',
      participants: Array.isArray(participants) && participants.length
        ? participants.join(', ')
        : '',
      description: description || '',
      status: status as 'scheduled' | 'completed' | 'cancelled',
    });
  }
}, [initialData, form]);


  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        date: new Date(data.date),
        participants: data.participants
          ? data.participants.split(',').map(p => p.trim())
          : [],
      };
      return initialData && initialData._id
        ? updateMeeting(initialData._id, payload)
        : createMeeting(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings']);
      toast.success(`Meeting ${mode === 'edit' ? 'updated' : 'created'} successfully`);
      onClose();
    },
    onError: () => {
      toast.error('Failed to save meeting. Please try again.');
    },
  });

  const onSubmit = (values: FormData) => mutation.mutate(values);

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === 'edit' ? 'Edit Meeting' : 'Create Meeting'}
        </h2>
        <button onClick={onClose} aria-label="Close">
          <X className="w-5 h-5 text-gray-500 hover:text-red-500" />
        </button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Meeting Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date & Time<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="participants"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Participants (comma-separated emails)</FormLabel>
                <FormControl>
                  <Input placeholder="alice@example.com, bob@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full border rounded-md px-2 py-1"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                   <select className="w-full border rounded-md px-2 py-1" {...field}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2 mt-4 flex justify-end space-x-3">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Submitting...' : mode === 'edit' ? 'Update Meeting' : 'Create Meeting'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MeetingForm;
