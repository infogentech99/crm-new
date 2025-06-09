'use client';

import { useState } from 'react';
import { Button } from '@components/ui/button';
import dayjs from 'dayjs';
import { updateLead } from '@services/leadService';
import { toast } from 'sonner';

interface LeadNotesProps {
  leadId: string;
  notes: { message: string; createdAt?: string }[] | [];
  onNotesUpdated: (updatedNotes: any[]) => void;
}

export default function LeadNotes({ leadId, notes, onNotesUpdated }: LeadNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editedNoteText, setEditedNoteText] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return toast.error('Note cannot be empty');
    setIsAddingNote(true);
    try {
      const updatedNotes = [...notes, { message: newNote }];
      const updatedLead = await updateLead(leadId, { notes: updatedNotes });
      onNotesUpdated(updatedLead.notes || []);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);

    try {
      const updatedLead = await updateLead(leadId, { notes: updatedNotes });
      onNotesUpdated(updatedLead.notes || []);
      toast.success("Note deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-md border">
      <h3 className="font-semibold mb-4 text-lg">Notes</h3>
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
                        className="text-blue-600 text-sm"
                        onClick={() => {
                          setEditingNoteIndex(index);
                          setEditedNoteText(note.message);
                        }}
                        title="Edit Note"
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-600 text-sm"
                        onClick={() => handleDeleteNote(index)}
                        title="Delete Note"
                      >
                        🗑️
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
        <Button onClick={handleAddNote} disabled={!newNote.trim() || isAddingNote} >
          Save Note
        </Button>
      </div>
    </div>
  );
}
