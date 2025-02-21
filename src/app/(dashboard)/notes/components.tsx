import { BubbleMenu, Editor, EditorContent } from "@tiptap/react";
import { MdSave, MdClose } from "react-icons/md";
import { RiCodeBlock } from "react-icons/ri";
import {
  RxHeading,
  RxFontBold,
  RxFontItalic,
  RxCode,
  RxQuote,
  RxListBullet,
} from "react-icons/rx";
import { updateNote, addNote } from "./actions";
import { SetStateAction, Dispatch, useState } from "react";
import { NoteProps } from "@/types/Note";

export const MenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear marks
        </button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
        >
          Paragraph
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          H4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          H5
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          Blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>
          Hard break
        </button>
        <button onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>
    </div>
  );
};

export const NoteEditor = ({
  noteVisibility,
  isEditing,
  id,
  title,
  setTitle,
  setNoteVisibility,
  setIsEditing,
  editor,
}: {
  noteVisibility: boolean;
  isEditing: boolean;
  id: string;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  setNoteVisibility: Dispatch<SetStateAction<boolean>>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  editor: Editor | null;
}) => {
  const [html, setHTML] = useState("");

  if (noteVisibility)
    return (
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
    );
};

export const NoteComponent = ({
  note,
  onClick,
}: {
  note: NoteProps;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex flex-col w-fit lg:max-w-[160px] p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
      key={note.note_id}
      onClick={onClick}
    >
      <h1>{note.title}</h1>
    </div>
  );
};
