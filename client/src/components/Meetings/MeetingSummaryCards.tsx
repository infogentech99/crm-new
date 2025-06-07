// File: src/components/Meetings/MeetingSummaryCards.tsx
"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMeetingSummary } from '@services/dashboardService';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md text-white ${bgColor}`}>
      <div className="mr-4">{icon}</div>
      <div>
        <p className="text-sm font-medium uppercase">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
};

const MeetingSummaryCards: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['meetingSummary'],
    queryFn: fetchMeetingSummary,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mb-6">
        Error loading meeting summary: {(error as Error).message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total Meetings"
        value={data?.totalMeetings ?? 0}
        icon={<Calendar size={24} />}
        bgColor="bg-blue-500"
      />
      <SummaryCard
        title="Upcoming"
        value={data?.upcomingMeetings ?? 0}
        icon={<Clock size={24} />}
        bgColor="bg-yellow-500"
      />
      <SummaryCard
        title="Completed"
        value={data?.completedMeetings ?? 0}
        icon={<CheckCircle size={24} />}
        bgColor="bg-green-500"
      />
      <SummaryCard
        title="Cancelled"
        value={data?.cancelledMeetings ?? 0}
        icon={<XCircle size={24} />}
        bgColor="bg-red-500"
      />
    </div>
  );
};

export default MeetingSummaryCards;
