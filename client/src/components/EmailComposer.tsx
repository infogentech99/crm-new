'use client';

import React, { useState } from 'react';
import Modal from '@components/Common/Modal';
import { Button } from './ui/button';
import RichTextEditor from './ui/RichTextEditor';
import { FiPaperclip } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
import { sendUserEmail } from '@services/emailService';
import { toast } from "sonner";

export default function EmailComposer({
    toEmail,
    isOpen,
    onClose,
}: {
    toEmail: string;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<FileList | null>(null);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!subject || !body) return;

        try {
            setIsSending(true);
            const formData = new FormData();
            formData.append('to', toEmail);
            formData.append('subject', subject);
            formData.append('body', body);

            if (attachments) {
                Array.from(attachments).forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            const response = await sendUserEmail(formData);
            if (response?.message) {
                toast.success('Email sent successfully!');
                resetForm();
                onClose();
            }
        } catch (err) {
            console.error('Send failed', err);
            toast.error('Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    const resetForm = () => {
        setSubject('');
        setBody('');
        setAttachments(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} widthClass="max-w-3xl">
            <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white rounded">
                <h2 className="text-base font-semibold">New Message</h2>
                <button
                    onClick={onClose}
                    className="text-2xl leading-none hover:text-gray-200 cursor-pointer"
                    aria-label="Close"
                >
                    <RxCross2 />
                </button>
            </div>
            <div className="py-3 space-y-4 text-sm">
                <input
                    type="email"
                    value={toEmail}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 rounded-md outline-none text-gray-700"
                    placeholder="To"
                />
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                    placeholder="Subject"
                />
                <RichTextEditor value={body} onChange={setBody} />
                <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <FiPaperclip className="text-blue-500" />
                        Attach files
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setAttachments(e.target.files)}
                            className="hidden"
                        />
                    </label>
                    <p className="text-xs text-gray-500 ml-6">Max file size: 24MB</p>
                </div>
            </div>
            <div className="flex justify-end items-center px-4 py-3 bg-gray-50 border-t">
                <Button
                    onClick={handleSend}
                    disabled={isSending}
                    className={`px-5 py-2 text-sm rounded-md text-white ${isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </Button>
            </div>
        </Modal>
    );
}
