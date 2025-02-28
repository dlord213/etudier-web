import { PostPhotoDropzone } from "@/components/ui/file-upload";
import { createClient } from "@/supabase/client";
import { PostProps } from "@/types/Post";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import {
  MdAccountCircle,
  MdArrowDownward,
  MdArrowUpward,
  MdClose,
  MdComment,
  MdImage,
  MdUploadFile,
} from "react-icons/md";
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
  const [postContent, setPostContent] = useState("What's on your mind?");
  const [isPhotoDropzoneVisible, setPhotoDropzoneVisibility] = useState(false);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "dark:bg-stone-700 p-4 min-h-full rounded-md focus:outline-none",
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    content: postContent,
    immediatelyRender: false,
    autofocus: true,
    onUpdate: ({ editor }) => {
      const html = editor.getText();
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

    const { status } = await instance.from("post").insert({
      user_id: (await user).data.session?.user.id,
      content: postContent,
      image_public_url: imageUrls,
    });

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
        <div className="relative dark:bg-stone-800 bg-[#fefefe] 2xl:w-[30vw] 2xl:min-h-[39vh] xl:w-[50vw] xl:h-[50vh] mx-auto my-auto lg:w-[70vw] lg:h-[50vh] md:h-[50vh] md:w-[90vw] h-[90vh] w-[90vw] rounded-md p-4 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 items-center">
              <MdClose
                size={32}
                onClick={() => setModalVisibility(false)}
                className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              />
              <h1 className="font-bold text-xl">Create post</h1>
            </div>
          </div>
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
                className="p-4 dark:bg-stone-700 transition-all bg-stone-100 hover:bg-stone-200 delay-0 duration-200 dark:hover:bg-stone-600 flex-1 rounded-md disabled:dark:bg-stone-900 disabled:dark:text-stone-700"
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
  const instance = createClient();

  const handleVote = async (post_id: string, type: "upvote" | "downvote") => {
    const user_id = (await instance.auth.getSession()).data.session?.user.id;
    const opposite_type = type === "upvote" ? "downvote" : "upvote";

    const { data: existingVote, error: checkError } = await instance
      .from("post_votes")
      .select("vote_type")
      .eq("user_id", user_id)
      .eq("post_id", post_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      toast.error(`Error checking vote: ${checkError.code}`);
      return;
    }

    // Fetch current post data to get upvote/downvote counts
    const { data: postData, error: fetchError } = await instance
      .from("post")
      .select("upvote, downvote")
      .eq("post_id", post_id)
      .single();

    if (fetchError) {
      toast.error("Error fetching post data.");
      return;
    }

    let updatedUpvote = postData.upvote;
    let updatedDownvote = postData.downvote;

    // If user already voted with the same type, remove their vote
    if (existingVote && existingVote.vote_type === type) {
      await instance
        .from("post_votes")
        .delete()
        .eq("user_id", user_id)
        .eq("post_id", post_id);

      if (type === "upvote") updatedUpvote -= 1;
      else updatedDownvote -= 1;

      await instance
        .from("post")
        .update({ upvote: updatedUpvote, downvote: updatedDownvote })
        .eq("post_id", post_id);

      return;
    }

    // If user voted opposite type (switch vote)
    if (existingVote && existingVote.vote_type === opposite_type) {
      await instance
        .from("post_votes")
        .update({ vote_type: type })
        .eq("user_id", user_id)
        .eq("post_id", post_id);

      if (type === "upvote") {
        updatedUpvote += 1;
        updatedDownvote -= 1;
      } else {
        updatedDownvote += 1;
        updatedUpvote -= 1;
      }

      await instance
        .from("post")
        .update({ upvote: updatedUpvote, downvote: updatedDownvote })
        .eq("post_id", post_id);

      return;
    }

    // If user hasn't voted yet, insert new vote
    await instance
      .from("post_votes")
      .insert([{ user_id, post_id, vote_type: type }]);

    if (type === "upvote") updatedUpvote += 1;
    else updatedDownvote += 1;

    await instance
      .from("post")
      .update({ upvote: updatedUpvote, downvote: updatedDownvote })
      .eq("post_id", post_id);
  };

  return (
    <div className="flex flex-col gap-4">
      {Array.isArray(posts) &&
        posts.map((post: PostProps) => (
          <div
            className="flex flex-col dark:bg-stone-800 p-4 rounded-md gap-4"
            key={post.post_id}
          >
            <div className="flex flex-row gap-4 items-center">
              <MdAccountCircle size={28} />
              <p>{post.user?.username ?? "Loading..."}</p>
            </div>
            <p>{post.content}</p>
            {post.image_public_url.length >= 1 && (
              <div className="flex flex-row gap-2 items-center">
                {post.image_public_url.map((img) => (
                  <img
                    src={img}
                    className="w-full h-full aspect-auto rounded-md overflow-x-scroll"
                    key={img}
                  />
                ))}
              </div>
            )}
            <div className="flex flex-row gap-2">
              <button
                type="button"
                className="flex flex-row gap-2 items-center py-2 px-4 dark:bg-stone-700 rounded-full"
                onClick={() => handleVote(post.post_id, "upvote")}
              >
                <MdArrowUpward className="flex-shrink-0" />
                <p>{post.upvote ?? 0}</p>
              </button>
              <button
                type="button"
                className="flex flex-row gap-2 items-center py-2 px-4 dark:bg-stone-700 rounded-full"
                onClick={() => handleVote(post.post_id, "downvote")}
              >
                <MdArrowDownward className="flex-shrink-0" />
                <p>{post.downvote ?? 0}</p>
              </button>
              <button
                type="button"
                className="hidden flex-row gap-2 items-center py-2 px-4 dark:bg-stone-700 rounded-full"
              >
                <MdComment className="flex-shrink-0" />
                <p>Comment</p>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};
