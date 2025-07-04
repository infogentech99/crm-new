
"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { getMeetings, deleteMeeting } from '@services/meetingService';
import DataTable from '@components/Common/DataTable';
import AddMeetingButton from '@components/Common/AddMeetingButton';
import { manageMeetingsConfig } from '@config/manageMeetingsConfig';
import Modal from '@components/Common/Modal';
import DeleteModal from '@components/Common/DeleteModal';
import MeetingForm from '@components/Meetings/MeetingForm';
import { Meeting } from '@customTypes/index';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { PaginationComponent } from '@components/ui/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import MeetingView from '@components/Meetings/MeetingView';
import { useRouter } from 'next/navigation';

const ManageMeetingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userRole = useSelector((state: RootState) => state.user.role || '');

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewMeeting, setViewMeeting] = useState<Meeting | null>(null);
  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {
    document.title = "Manage Meetings – CRM Application";
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && userRole === 'accounts') {
      router.replace('/dashboard');
    }
  }, [isMounted, userRole, router]);

  // 3️⃣ Guard rendering
  if (!isMounted || userRole === 'accounts') return null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['allMeetings', search],
    queryFn: () => getMeetings(1, 10000, search),
    enabled: isMounted,
  });

  const allMeetings = data?.meetings || [];

  const filteredMeetings = allMeetings.filter(meeting =>
    (meeting.title?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalMeetings = filteredMeetings.length;
  const totalPages = Math.ceil(totalMeetings / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const meetingsToDisplay = filteredMeetings.slice(startIndex, endIndex);

  const handleViewMeeting = useCallback((meeting: Meeting) => {
    setViewMeeting(meeting);
    setIsViewModalOpen(true);
  }, []);

  const handleEditMeeting = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  }, []);

  const handleDeleteMeeting = useCallback((meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setIsDeleteOpen(true);
  }, []);

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    await deleteMeeting(meetingToDelete._id);
    queryClient.invalidateQueries({ queryKey: ['allMeetings'] });
    setIsDeleteOpen(false);
    setMeetingToDelete(null);
  };
  const handleCreateMeeting = () => {
    setSelectedMeeting(null);
    setIsModalOpen(true);
  };

  const config = manageMeetingsConfig(
    handleViewMeeting,
    handleEditMeeting,
    handleDeleteMeeting,
    userRole,
    page,
    limit
  );
  config.addMeetingButtonAction = handleCreateMeeting;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else if (newPage < 1) {
      setPage(1);
    } else if (newPage > totalPages) {
      setPage(totalPages);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">{config.pageTitle}</h1>
          <AddMeetingButton onClick={handleCreateMeeting} />
        </div>

        <div className="flex items-center justify-between mb-4 space-x-4">
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Select onValueChange={handleLimitChange} value={String(limit)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={config.tableColumns}
          data={meetingsToDisplay}
          isLoading={isLoading}
          error={isError ? error?.message || 'Unknown error' : null}
        />

        <div className="mt-4 flex justify-end">
          <PaginationComponent
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          widthClass="max-w-3xl"
        >
          <MeetingForm
            data={selectedMeeting ?? undefined}
            mode={selectedMeeting ? 'Edit' : 'Create'}
            onClose={() => {
              setIsModalOpen(false);
              queryClient.invalidateQueries({ queryKey: ['allMeetings'] });
            }}

          />

        </Modal>
        {viewMeeting && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewMeeting(null);
            }}
            widthClass="max-w-3xl"
          >
            <MeetingView
              data={viewMeeting}
              onClose={() => {
                setIsViewModalOpen(false);
                setViewMeeting(null);
              }}
            />
          </Modal>
        )}
        {meetingToDelete && (
          <DeleteModal
            isOpen={isDeleteOpen}
            onClose={() => { setIsDeleteOpen(false); setMeetingToDelete(null); }}
            onConfirm={confirmDeleteMeeting}
            itemLabel={meetingToDelete.title}
          />
        )}
      </div>
  );
};

export default ManageMeetingsPage;
