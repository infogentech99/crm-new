'use client';

import { useState } from 'react';
import { Button } from '@components/ui/button';
import dayjs from 'dayjs';
import { updateLead } from '@services/leadService';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '@components/Common/DeleteModal';

import { Note } from '@customTypes/index'; // Import Note interface

interface LeadNotesProps {
  leadId: string;
  notes: Note[] | [];
  onNotesUpdated: (updatedNotes: Note[]) => void;
}

export default function LeadNotes({ leadId, notes, onNotesUpdated }: LeadNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editedNoteText, setEditedNoteText] = useState('');

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null); // for modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return toast.error('Note cannot be empty');
    setIsAddingNote(true);
    try {
      const updatedNotes = [...notes, { message: newNote }];
      const updatedLead = await updateLead(leadId, { notes: updatedNotes });
      onNotesUpdated(updatedLead.notes || []);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (err: unknown) { // Changed to unknown
      toast.error((err as Error).message || 'Failed to add note'); // Safely access message
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateNote = async (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = { ...updatedNotes[index], message: editedNoteText };

    try {
      const updatedLead = await updateLead(leadId, { notes: updatedNotes });
      onNotesUpdated(updatedLead.notes || []);
      setEditingNoteIndex(null);
      toast.success('Note updated successfully');
    } catch (err: unknown) { // Changed to unknown
      toast.error((err as Error).message || 'Failed to update note'); // Safely access message
    }
  };

  const handleDeleteNote = async (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);

    try {
      const updatedLead = await updateLead(leadId, { notes: updatedNotes });
      onNotesUpdated(updatedLead.notes || []);
      toast.success("Note deleted successfully");
    } catch (err: unknown) { // Changed to unknown
      toast.error((err as Error).message || "Failed to delete note"); // Safely access message
    }
  };

  return (
    <div className="mt-6 bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Notes</h3>
      {notes.length > 0 ? (
        <ul className="space-y-4 mb-4">
          {notes.map((note, index) => (
            <li key={index} className="bg-white rounded-md p-4 border">
              {editingNoteIndex === index ? (
                <>
                  <textarea
                    value={editedNoteText}
                    onChange={(e) => setEditedNoteText(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md text-sm"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={() => handleUpdateNote(index)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingNoteIndex(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{note.message}</p>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center cursor-pointer"
                        onClick={() => {
                          setEditingNoteIndex(index);
                          setEditedNoteText(note.message);
                        }}
                        title="Edit Note"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 flex items-center cursor-pointer"
                        onClick={() => {
                          setDeleteIndex(index);
                          setShowDeleteModal(true);
                        }}
                        title="Delete Note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {note.createdAt ? dayjs(note.createdAt).format('MMMM D, YYYY, h:mm A') : ''}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No notes yet.</p>
      )}

      <textarea
        rows={3}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a Note..."
        className="w-full p-2 border rounded-md text-sm mb-2"
      />
      <div className="flex justify-end">
        <Button onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote}>
          Save Note
        </Button>
      </div>
      {deleteIndex !== null && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            handleDeleteNote(deleteIndex);
            setShowDeleteModal(false);
            setDeleteIndex(null);
          }}
          itemLabel=" this note"
        />
      )}
    </div>
  );
}
