import { PostPhotoDropzone } from "@/components/ui/file-upload";
import { createClient } from "@/supabase/client";
import { PostProps } from "@/types/Post";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, EditorProvider, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import {
  MdAccountCircle,
  MdClose,
  MdImage,
  MdUploadFile,
} from "react-icons/md";
import { RiCodeBlock } from "react-icons/ri";
import {
  RxHeading,
  RxFontBold,
  RxFontItalic,
  RxCode,
  RxQuote,
  RxListBullet,
} from "react-icons/rx";
import { toast } from "sonner";

export const CreatePostModal = ({
  modalVisibility,
  setModalVisibility,
}: {
  modalVisibility: boolean;
  setModalVisibility: Dispatch<SetStateAction<boolean>>;
}) => {
  const instance = createClient();
  const user = instance.auth.getSession();
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [isPhotoDropzoneVisible, setPhotoDropzoneVisibility] = useState(false);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "dark:bg-stone-700 bg-stone-100 dark:shadow-none shadow p-4 min-h-full rounded-md focus:outline-none",
      },
    },
    extensions: [
      StarterKit.configure({}),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    content: postContent,
    immediatelyRender: false,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setPostContent(html);
    },
  });

  const uploadImagesToSupabase = async (
    files: { file: File; url: string }[]
  ): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExt = file["file"].name.split(".").pop();
      const fileName = `public/${
        (await user).data.session?.user.id
      }_${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { data, error } = await instance.storage
        .from("posts")
        .upload(fileName, file["file"], {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.log(error);
        toast(`Upload error: ${error.message}`);
        continue;
      }

      const { data: publicUrlData } = instance.storage
        .from("posts")
        .getPublicUrl(data.path);
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!postContent) return;

    setIsUploading(true);
    let imageUrls: string[] = [];

    if (files.length > 0) {
      imageUrls = await uploadImagesToSupabase(files);
    }

    const { status } = await instance
      .from("post")
      .insert({
        user_id: (await user).data.session?.user.id,
        title: postTitle,
        content: postContent,
        image_public_url: imageUrls,
      })
      .select();

    setIsUploading(false);
    if (status === 201) {
      toast.success("Posted.");
      setFiles([]);
      setModalVisibility(false);
    } else {
      toast.error("Post failed. Try again.");
    }
  };

  if (modalVisibility) {
    return (
      <form
        className="fixed inset-0 bg-black/70 rounded-md z-50 flex flex-col justify-center items-center"
        onClick={async (e) => {
          if (e.target === e.currentTarget) {
            setModalVisibility(false);
          }
        }}
        onSubmit={handleSubmit}
      >
        <div className="relative dark:bg-stone-800 bg-[#fefefe] 2xl:w-[40vw] 2xl:min-h-[39vh] xl:w-[50vw] xl:h-[50vh] mx-auto my-auto lg:w-[70vw] lg:h-[50vh] md:h-[50vh] md:w-[90vw] h-[90vh] w-[90vw] rounded-md p-4 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 items-center">
              <MdClose
                size={32}
                onClick={() => setModalVisibility(false)}
                className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              />
              <input
                type="text"
                className="font-bold outline-none lg:text-4xl w-full dark:bg-stone-800"
                placeholder="Put your title here..."
                name="title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </div>
          </div>
          {editor && (
            <div className="hidden lg:flex flex-row gap-4 bg-stone-50 shadow dark:shadow-none dark:bg-stone-800 rounded-md h-fit">
              <button
                onClick={() =>
                  editor!.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor!.isActive("heading")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-800 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxHeading />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBold().run()}
                className={
                  editor!.isActive("bold")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxFontBold />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleItalic().run()}
                className={
                  editor!.isActive("italic")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxFontItalic />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleCode().run()}
                className={
                  editor!.isActive("code")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxCode />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBlockquote().run()}
                className={
                  editor!.isActive("blockquote")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxQuote />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleCodeBlock().run()}
                className={
                  editor!.isActive("codeBlock")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RiCodeBlock />
              </button>
              <button
                onClick={() => editor!.chain().focus().toggleBulletList().run()}
                className={
                  editor!.isActive("bulletList")
                    ? "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-600 rounded-md"
                    : "p-2 hover:bg-stone-100 dark:bg-stone-600 dark:hover:bg-stone-500 rounded-md"
                }
                type="button"
              >
                <RxListBullet />
              </button>
            </div>
          )}
          <EditorContent
            editor={editor}
            maxLength={1200}
            className="flex-1 max-h-full text-wrap overflow-y-auto"
            placeholder="What's on your mind?"
            content={postContent}
          />
          {isPhotoDropzoneVisible && <PostPhotoDropzone setFiles={setFiles} />}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <button
                type="button"
                className="hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2"
              >
                <MdUploadFile size={24} className="flex-shrink-0" />
              </button>
              <button
                type="button"
                className="md:flex md:flex-row hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2"
                onClick={() => {
                  setPhotoDropzoneVisibility((prev) => !prev);
                }}
              >
                <MdImage size={24} className="flex-shrink-0" />
              </button>
            </div>
            <div className="flex flex-row gap-4 rounded-md justify-between">
              <button
                className="p-4 dark:bg-stone-700 transition-all bg-stone-100 shadow dark:shadow-none disabled:bg-stone-300 hover:bg-stone-200 delay-0 duration-200 dark:hover:bg-stone-600 flex-1 rounded-md disabled:dark:bg-stone-900 disabled:dark:text-stone-700"
                disabled={isUploading || !postContent}
                type="submit"
              >
                {isUploading ? "Uploading..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
};

export const Posts = ({ posts }: { posts: PostProps[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.isArray(posts) &&
        posts.map((post: PostProps) => {
          return (
            <div
              className="flex flex-col shadow dark:shadow-none bg-stone-50 dark:bg-stone-800 p-4 rounded-md gap-4 "
              key={post.post_id}
            >
              <div className="flex flex-row gap-4 items-center">
                <MdAccountCircle size={28} />
                <p>{post.user?.username ?? "Loading..."}</p>
              </div>
              <Link
                href={`post/${post.post_id}`}
                className="font-bold text-2xl delay-0 duration-300 transition-all hover:text-green-400"
              >
                {post.title}
              </Link>
              <EditorProvider
                content={post.content}
                extensions={[StarterKit]}
                editable={false}
              />
            </div>
          );
        })}
    </div>
  );
};
