"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdClose, MdSave } from "react-icons/md";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import {
  RxFontBold,
  RxFontItalic,
  RxCode,
  RxHeading,
  RxListBullet,
  RxQuote,
} from "react-icons/rx";
import { RiCodeBlock } from "react-icons/ri";
import { addNote, updateNote } from "./actions";
import { createClient } from "@/supabase/client";
import { NoteProps } from "@/types/Note";
import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";

export default function ClientSideLayout({
  user,
  serverNotes,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  serverNotes: NoteProps[];
}) {
  const [html, setHTML] = useState("");
  const [title, setTitle] = useState("");
  const [id, setID] = useState("");
  const [noteVisibility, setNoteVisibility] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(serverNotes);

  const instance = createClient();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: " focus:outline-none",
      },
    },
    extensions: [
      StarterKit.configure({
        code: {
          HTMLAttributes: { class: "dark:bg-stone-600 p-2" },
        },
        codeBlock: {
          HTMLAttributes: { class: "dark:bg-stone-600 p-2" },
        },
      }),
      Placeholder.configure({
        placeholder: "Jot down your thoughts/notes here...",
      }),
    ],
    content: html,
    immediatelyRender: false,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHTML(html);
    },
  });

  useEffect(() => {
    const channel = instance
      .channel("note_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "note",
          schema: "public",
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setNotes((prevNotes: any[]) => {
            const index = prevNotes.findIndex(
              (note: NoteProps) => note.note_id === payload.old.note_id
            );
            if (index !== -1) {
              const updatedNotes = [...prevNotes];
              updatedNotes[index] = payload.new;
              return updatedNotes;
            } else {
              return [...prevNotes, payload.new];
            }
          });
        }
      )
      .subscribe();

    return () => {
      instance.removeChannel(channel);
    };
  }, [instance, user.data.user.id]);

  return (
    <>
      <section className="flex flex-col lg:p-8 py-4 px-8 gap-2 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        {!noteVisibility && (
          <>
            <div className="flex flex-row gap-4 items-center">
              <MdAdd
                size={28}
                color={"#fefefe"}
                className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                onClick={() => setNoteVisibility(true)}
              />
              <h1 className="font-bold lg:text-3xl text-xl">Notes</h1>
            </div>
            <div className="flex flex-row gap-4 flex-wrap">
              {notes?.map((note: NoteProps) => (
                <div
                  className="flex flex-col w-fit lg:max-w-[160px] p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
                  key={note.note_id}
                  onClick={() => {
                    setIsEditing(true);
                    setTitle(note.title);
                    setID(note.note_id);
                    if (editor) {
                      editor.commands.setContent(note.html);
                      setHTML(note.html);
                    }
                    setNoteVisibility(true);
                  }}
                >
                  <h1>{note.title}</h1>
                </div>
              ))}
            </div>
          </>
        )}
        {noteVisibility && (
          <form
            action={async (e) => {
              if (isEditing) {
                await updateNote(e);
                editor!.commands.setContent("");
                setIsEditing(false);
              } else {
                await addNote(e);
                editor!.commands.setContent("");
              }
              setHTML("");
              setTitle("");
              setNoteVisibility(false);
            }}
            className="flex flex-col"
          >
            <div className="flex flex-row gap-4 items-center">
              {title ? (
                <button type="submit">
                  <MdSave
                    size={32}
                    className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                  />
                </button>
              ) : (
                <MdClose
                  size={32}
                  onClick={() => setNoteVisibility(false)}
                  className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                />
              )}

              <input
                type="text"
                className="font-bold outline-none lg:text-4xl w-full"
                placeholder="Put your title here..."
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-row gap-4 my-4">
              <div className="hidden lg:flex flex-col gap-4 dark:bg-stone-800 rounded-md p-2 h-fit">
                <button
                  onClick={() =>
                    editor!.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={
                    editor!.isActive("heading")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxHeading />
                </button>
                <button
                  onClick={() => editor!.chain().focus().toggleBold().run()}
                  className={
                    editor!.isActive("bold")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxFontBold />
                </button>
                <button
                  onClick={() => editor!.chain().focus().toggleItalic().run()}
                  className={
                    editor!.isActive("italic")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxFontItalic />
                </button>
                <button
                  onClick={() => editor!.chain().focus().toggleCode().run()}
                  className={
                    editor!.isActive("code")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxCode />
                </button>
                <button
                  onClick={() =>
                    editor!.chain().focus().toggleBlockquote().run()
                  }
                  className={
                    editor!.isActive("blockquote")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxQuote />
                </button>
                <button
                  onClick={() =>
                    editor!.chain().focus().toggleCodeBlock().run()
                  }
                  className={
                    editor!.isActive("codeBlock")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RiCodeBlock />
                </button>
                <button
                  onClick={() =>
                    editor!.chain().focus().toggleBulletList().run()
                  }
                  className={
                    editor!.isActive("bulletList")
                      ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                      : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                  }
                  type="button"
                >
                  <RxListBullet />
                </button>
              </div>
              <input type="hidden" value={id} name="note_id" />
              <input type="hidden" value={html} name="note" />
              <EditorContent
                editor={editor}
                maxLength={2500}
                className="flex-1"
                placeholder="Jot down your thoughts/notes here..."
                content={html}
              />
              {editor && (
                <BubbleMenu
                  editor={editor}
                  className="bg-white p-2 rounded shadow dark:bg-stone-700"
                >
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="px-2 py-1 hover:bg-stone-600 rounded"
                  >
                    Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="px-2 py-1 hover:bg-stone-600 rounded"
                  >
                    Italic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className="px-2 py-1 hover:bg-stone-600 rounded"
                  >
                    H2
                  </button>
                </BubbleMenu>
              )}
            </div>
            <div className="lg:hidden flex flex-row fixed self-center bottom-2 gap-4 dark:bg-stone-800 rounded-md p-2 h-fit">
              <button
                onClick={() =>
                  editor!.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor!.isActive("heading")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxHeading />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBold().run()}
                className={
                  editor!.isActive("bold")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxFontBold />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleItalic().run()}
                className={
                  editor!.isActive("italic")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxFontItalic />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleCode().run()}
                className={
                  editor!.isActive("code")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxCode />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBlockquote().run()}
                className={
                  editor!.isActive("blockquote")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxQuote />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleCodeBlock().run()}
                className={
                  editor!.isActive("codeBlock")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RiCodeBlock />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBulletList().run()}
                className={
                  editor!.isActive("bulletList")
                    ? "p-2 hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-md"
                    : "p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md"
                }
                type="button"
              >
                <RxListBullet />
              </button>
            </div>
          </form>
        )}
      </section>
      <FloatingDock
        items={links}
        mobileClassName={noteVisibility ? "hidden" : ""}
      />
    </>
  );
}
