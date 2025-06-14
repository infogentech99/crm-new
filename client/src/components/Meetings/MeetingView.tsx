'use client';

import React from 'react';
import { RxCross2 } from 'react-icons/rx';

interface ViewMeetingProps {
    data: any;
    onClose: () => void;
}

export default function ViewMeeting({ data, onClose }: ViewMeetingProps) {
    return (
        <>
       
            <div className="flex items-center justify-between border-b pb-3 mb-5">
                <h2 className="text-xl font-semibold text-blue-600">
                   Meeting Details
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-200 rounded-full p-1 text-2xl leading-none hover:text-gray-500 cursor-pointer"
                    aria-label="Close"
                >
                    <RxCross2 />
                </button>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-y-4 gap-x-6">
                <LabelValue label="Title" value={data?.title} />
                <LabelValue label="Date & Time" value={new Date(data?.date).toLocaleString()} />
                <LabelValue label="Duration" value={`${data?.duration} min`} />
                <LabelValue label="Status" value={capitalize(data?.status)} />
                <LabelValue label="Platform" value={capitalize(data?.platform)} />
                <LabelValue
                    label="Meet Link"
                    value={
                        data?.meetlink ? (
                            <a
                                href={data.meetlink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline break-all"
                            >
                                {data.meetlink}
                            </a>
                        ) : (
                            'N/A'
                        )
                    }
                />
                <LabelValue
                    label="Participants"
                    value={
                        data?.participants?.length ? (
                            <ul className="list-disc pl-5">
                                {data.participants.map((email: string, idx: number) => (
                                    <li key={idx}>{email}</li>
                                ))}
                            </ul>
                        ) : (
                            'N/A'
                        )
                    }
                />
                <LabelValue
                    label="Description"
                    value={data?.description || '—'}
                />
                <LabelValue
                    label="Created By"
                    value={`${data?.createdBy?.name} (${data?.createdBy?.email})`}
                />
            </div>
             </>
    );
}

const LabelValue = ({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) => (
    <>
        <div className="text-gray-600 font-medium">{label}</div>
        <div className="text-gray-900">{value}</div>
    </>
);

function capitalize(str: string = '') {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
