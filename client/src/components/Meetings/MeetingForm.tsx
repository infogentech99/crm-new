"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createMeeting, updateMeeting } from '@services/meetingService';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import MultiSelectDropdown, { OptionType } from '@components/Common/MultiSelectDropdown';
import { fetchUsers } from '@services/userService';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@components/ui/select';
import { RxCross2 } from 'react-icons/rx';
import { sendMeetingEmail } from './MeetingEmailSender';

interface Props {
  data?: any;
  mode: 'Create' | 'Edit';
  onClose: () => void;
}

export default function MeetingForm({ data, mode, onClose }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [platform, setPlatform] = useState('google');
  const [meetLinks, setMeetLinks] = useState({
    google: data?.meetlink || '',
    zoom: '',
    microsoft: '',
  });

  const [formData, setFormData] = useState({
    title: data?.title || '',
    date: data?.date || '',
    duration: data?.duration || 30,
    platform: data?.platform || '',
    meetlink: data?.meetlink || '',
    participants: data?.participants?.join(', ') || '',
    description: data?.description || '',
    status: data?.status || 'scheduled'
  });

  const [users, setUsers] = useState<OptionType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<OptionType[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchUsers();
        const formatted = response.users.map((user: any) => ({
          label: `${user.name} (${user.email})`,
          value: user.email,
        }));
        setUsers(formatted);
        if (mode === 'Edit') {
          const allParticipants = data?.participants || [];
          const selected = formatted.filter((user) =>
            allParticipants.includes(user.value)
          );
          setSelectedUsers(selected);
          const manualEmails = allParticipants.filter(
            (email: string) => !selected.find((u) => u.value === email)
          );
          const isoString = new Date(data.date).toISOString();
          const localFormat = isoString.slice(0, 16);
          setFormData((prev) => ({
            ...prev,
            date: localFormat,
            participants: manualEmails.join(', '),
          }));
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, [mode, data]);

  const handleSubmit = async () => {

    setSubmitting(true);
    try {
      const manualList = formData.participants
        ? formData.participants.split(',').map((p: string) => p.trim())
        : [];

      const allParticipants = [
        ...selectedUsers.map((u) => u.value),
        ...manualList,
      ].filter(Boolean);

      const payload = {
        ...formData,
        platform: platform,
        participants: allParticipants,
      };

      if (mode === 'Create') {
        await createMeeting(payload);
        toast.success('Meeting created successfully!');
      } else {
        await updateMeeting(data._id, payload);
        toast.success('Meeting updated successfully!');
      }
      if (allParticipants.length > 0) {
        setSendingEmail(true);
        try {
          await sendMeetingEmail({
            title: payload.title,
            date: payload.date,
            duration: payload.duration,
            platform: payload.platform,
            meetlink: payload.meetlink,
            description: payload.description,
            participants: allParticipants,
          });
          toast.success('Meeting email sent successfully!');
        } catch (emailErr) {
          console.error('Error sending meeting email:', emailErr);
          toast.error('Failed to send meeting email.');
        } finally {
          setSendingEmail(false);
        }
      }

      router.push('/dashboard/meetings');
      onClose();
    } catch (err) {
      console.error('Error submitting meeting:', err);
      toast.error('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          {mode === 'Edit' ? 'Edit Meeting' : 'Create Meeting'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <Input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Date & Time</label>
            <Input type="datetime-local" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Duration (minutes)</label>
            <Input type="number" min={1} value={formData.duration} onChange={(e) => handleChange('duration', Number(e.target.value))} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Meeting Platform</label>
            <Select value={platform} onValueChange={(val) => {
              setPlatform(val);
              const defaultLinks = {
                google: 'https://meet.google.com/landing',
                zoom: 'https://app.zoom.us/wc/home?from=pwa',
                microsoft: 'https://teams.live.com/free',
                other: ''
              };
              const defaultLink = defaultLinks[val as keyof typeof defaultLinks];
              handleChange('meetlink', val === 'other' ? '' : defaultLink);
            }}>

              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Meet</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="microsoft">Microsoft Teams</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className=" flex gap-2 items-end">
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Meet Link</label>
                {platform !== 'other' && (
                  <button
                    type="button"
                    className="text-blue-600 underline text-sm text-nowrap cursor-pointer"
                    onClick={() => {
                      const directLinks = {
                        google: 'https://meet.google.com/landing',
                        zoom: 'https://app.zoom.us/wc/home?from=pwa',
                        microsoft: 'https://teams.live.com/free',
                      };

                      const linkToOpen = directLinks[platform as keyof typeof directLinks];
                      if (linkToOpen) {
                        window.open(linkToOpen, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {platform} Link
                  </button>
                )}

              </div>
              <Input
                type="text"
                value={formData.meetlink}
                onChange={(e) => handleChange('meetlink', e.target.value)}
                placeholder=""
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Status</label>
            <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Participants (comma-separated emails)</label>
            <Input type="text" value={formData.participants} onChange={(e) => handleChange('participants', e.target.value)} placeholder="alice@example.com, bob@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Assign Team Members</label>
            <MultiSelectDropdown options={users} selected={selectedUsers} setSelected={setSelectedUsers} placeholder="Select users" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea className="w-full border rounded-md px-2 py-1" rows={4} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || sendingEmail}>
            {submitting ? 'Submitting...' : mode === 'Edit' ? 'Update Meeting' : 'Create Meeting'}
          </Button>
        </div>
      </form>
    </div>
  );
}
