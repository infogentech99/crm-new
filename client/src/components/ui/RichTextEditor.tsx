'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const buttonBase = 'px-2 py-1 rounded text-sm cursor-pointer transition-colors';
    const activeStyle = 'bg-blue-500 text-white';
    const inactiveStyle = 'bg-gray-100 text-gray-800 hover:bg-gray-200';

    return (
        <div className="rounded">
            <div className="flex flex-wrap gap-2 p-2 border bg-gray-50 rounded-t">
                <button
                    className={`${buttonBase} ${editor.isActive('bold') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    B
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('italic') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    I
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('underline') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    U
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('bulletList') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    • List
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('heading', { level: 2 }) ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('paragraph') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                >
                    P
                </button>
                <button
                    className={`${buttonBase} ${editor.isActive('highlight') ? activeStyle : inactiveStyle}`}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    Highlight 
                </button>
                <div className="flex items-center gap-1">
                    <label className="text-sm text-gray-600">Text Color:</label>
                    <input
                        type="color"
                        onChange={(e) =>
                            editor
                                ?.chain()
                                .focus()
                                .setColor(e.target.value)
                                .run()
                        }
                        className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
                    />
                </div>
            </div>

            <EditorContent
                editor={editor}
                className="min-h-[300px] max-h-[400px] overflow-auto p-4 focus:outline-none border border-gray-200 border-t-0 rounded-b"
            />
        </div>
    );
}
