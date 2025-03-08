/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/client";
import { EditorContent, EditorProvider, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  MdArrowUpward,
  MdArrowDownward,
  MdAccountCircle,
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

export const UserPostHeading = ({ post }: { post: any[] | null }) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl lg:text-5xl font-bold">{post![0].title}</h1>
      <div className="flex flex-row gap-4">
        <p>
          <span className="text-stone-500">Asked</span>{" "}
          {dayjs(post![0].created_at).format("DD/MM/YY")}
        </p>
        {post![0].last_edited && (
          <p>
            <span className="text-stone-500">Modified</span>{" "}
            {dayjs(post![0].last_edited).format("DD/MM/YY")}
          </p>
        )}
      </div>
    </div>
  );
};

export const UserPost = ({
  post,
  user,
}: {
  post: any[] | null;
  user: any | null;
}) => {
  const instance = createClient();

  const [userVote, setUserVote] = useState<string | null>(null);
  const [votes, setVotes] = useState(post![0].upvote - post![0].downvote); // votes for the post

  const handlePostVote = async (
    post_id: string,
    type: "upvote" | "downvote"
  ) => {
    try {
      const { data: sessionData, error: sessionError } =
        await instance.auth.getSession();
      const user_id = sessionData?.session?.user?.id;

      if (sessionError || !user_id) {
        toast.error("User not authenticated");
        return;
      }

      // Fetch user's existing vote
      const { data: existingVote, error: voteError } = await instance
        .from("post_votes")
        .select("vote_type")
        .eq("user_id", user_id)
        .eq("post_id", post_id)
        .maybeSingle();

      if (voteError) {
        toast.error("Error checking vote.");
        return;
      }

      // Fetch current post data (upvotes & downvotes)
      const { data: postData, error: postError } = await instance
        .from("post")
        .select("upvote, downvote")
        .eq("post_id", post_id)
        .maybeSingle();

      if (postError || !postData) {
        toast.error("Error fetching post data.");
        return;
      }

      let updatedUpvote = postData.upvote;
      let updatedDownvote = postData.downvote;
      let newVoteType: "upvote" | "downvote" | null = type;

      // Determine voting action
      if (existingVote) {
        if (existingVote.vote_type === type) {
          // **User is removing their vote**
          await instance
            .from("post_votes")
            .delete()
            .eq("user_id", user_id)
            .eq("post_id", post_id);

          newVoteType = null;
          if (type === "upvote") updatedUpvote = Math.max(0, updatedUpvote - 1);
          else updatedDownvote = Math.max(0, updatedDownvote - 1);
        } else {
          // **User is switching votes**
          await instance
            .from("post_votes")
            .update({ vote_type: type })
            .eq("user_id", user_id)
            .eq("post_id", post_id);

          if (type === "upvote") {
            updatedUpvote += 1;
            updatedDownvote = Math.max(0, updatedDownvote - 1);
          } else {
            updatedDownvote += 1;
            updatedUpvote = Math.max(0, updatedUpvote - 1);
          }
        }
      } else {
        // **User is voting for the first time**
        await instance
          .from("post_votes")
          .insert([{ user_id, post_id, vote_type: type }]);

        if (type === "upvote") updatedUpvote += 1;
        else updatedDownvote += 1;
      }

      // Update post vote count in a single call
      await instance
        .from("post")
        .update({ upvote: updatedUpvote, downvote: updatedDownvote })
        .eq("post_id", post_id);

      // Update local state
      setVotes(updatedUpvote - updatedDownvote);
      setUserVote(newVoteType);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const getUserVote = async () => {
      try {
        if (!post || post.length === 0 || !post[0].post_id) return;

        const { data: existingVote, error: voteError } = await instance
          .from("post_votes")
          .select("vote_type")
          .eq("user_id", (await user)!.data.session?.user.id)
          .eq("post_id", post[0].post_id)
          .maybeSingle();

        if (voteError) {
          toast.error("Error fetching vote.");
          return;
        }

        // Set vote state if user has voted
        setUserVote(existingVote?.vote_type ?? null);
      } catch (err) {
        console.error("Unexpected error fetching vote:", err);
        toast.error("Something went wrong while fetching your vote.");
      }
    };

    getUserVote();
  }, []);

  return (
    <div className="flex flex-row gap-4 items-start">
      <div className="flex flex-col gap-4 items-center">
        <button
          type="button"
          className={cn(
            "p-2 flex-shrink-0 cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-700 hover:bg-stone-200 rounded-md",
            userVote == "upvote"
              ? "bg-green-500 text-white"
              : "bg-stone-50 shadow dark:shadow-none dark:bg-stone-800"
          )}
          onClick={() => handlePostVote(post![0].post_id, "upvote")}
        >
          <MdArrowUpward size={24} />
        </button>
        <p className="font-black text-3xl">{votes ?? 0}</p>
        <button
          type="button"
          className={cn(
            "p-2 flex-shrink-0 cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100  hover:dark:bg-stone-700 hover:bg-stone-200 rounded-md",
            userVote == "downvote"
              ? "bg-red-500 text-white"
              : "bg-stone-50 shadow dark:shadow-none dark:bg-stone-800"
          )}
          onClick={() => handlePostVote(post![0].post_id, "downvote")}
        >
          <MdArrowDownward size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-6 p-4 rounded-xl bg-stone-50 shadow dark:bg-stone-800 w-full">
          <EditorProvider
            content={post![0].content}
            extensions={[StarterKit]}
            editable={false}
            immediatelyRender={false}
          />
          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-row justify-between items-end">
              <div className="flex flex-col gap-1">
                <h1 className="dark:text-stone-500">Asked by</h1>
                <div className="flex flex-row gap-2 items-center">
                  <MdAccountCircle size={36} />
                  <p>{post![0].user.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="dark:text-stone-500">Tags</h1>
          <div className="flex flex-row gap-2">
            {Array.isArray(post![0].tags) && post![0].tags.length >= 1 && (
              <>
                {post![0].tags.map((tag: string) => (
                  <p
                    className="px-3 py-1 dark:bg-stone-700 rounded-xl bg-stone-50 dark:shadow-none shadow"
                    key={tag}
                  >
                    {tag}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPostedAnswer = ({ answer }: { answer: any | null }) => {
  const instance = createClient();
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>();
  const [votes, setVotes] = useState(answer.upvote - answer.downvote);

  useEffect(() => {
    const fetchUserVote = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await instance.auth.getSession();
        if (sessionError || !sessionData?.session?.user?.id) return;

        const user_id = sessionData.session.user.id;

        const { data: existingVote, error: voteError } = await instance
          .from("answers_votes")
          .select("vote_type")
          .eq("user_id", user_id)
          .eq("answer_id", answer.id)
          .maybeSingle();

        if (voteError) {
          toast.error("Error fetching vote.");
          return;
        }

        setUserVote(existingVote?.vote_type ?? null);
      } catch (error) {
        console.error("Unexpected error fetching vote:", error);
        toast.error("Something went wrong while fetching your vote.");
      }
    };

    fetchUserVote();
  }, []);

  const handleAnswerVote = async (
    answer_id: string,
    type: "upvote" | "downvote"
  ) => {
    try {
      const { data: sessionData } = await instance.auth.getSession();
      const user_id = sessionData?.session?.user?.id;

      if (!user_id) {
        toast.error("User not authenticated");
        return;
      }

      // Fetch user's existing vote
      const { data: existingVote, error: voteError } = await instance
        .from("answers_votes")
        .select("vote_type")
        .eq("user_id", user_id)
        .eq("answer_id", answer_id)
        .maybeSingle();

      if (voteError) {
        toast.error("Error checking vote.");
        return;
      }

      // Fetch current vote counts from post_answers
      const { data: answerData, error: answerError } = await instance
        .from("post_answers")
        .select("upvote, downvote")
        .eq("id", answer_id)
        .maybeSingle();

      if (answerError || !answerData) {
        toast.error("Error fetching answer data.");
        return;
      }

      let updatedUpvotes = answerData.upvote;
      let updatedDownvotes = answerData.downvote;
      let newVoteType: "upvote" | "downvote" | null = type;

      if (existingVote) {
        if (existingVote.vote_type === type) {
          // **Removing existing vote**
          await instance
            .from("answers_votes")
            .delete()
            .eq("user_id", user_id)
            .eq("answer_id", answer_id);

          newVoteType = null;
          if (type === "upvote")
            updatedUpvotes = Math.max(0, updatedUpvotes - 1);
          else updatedDownvotes = Math.max(0, updatedDownvotes - 1);
        } else {
          // **Switching vote**
          await instance
            .from("answers_votes")
            .update({ vote_type: type })
            .eq("user_id", user_id)
            .eq("answer_id", answer_id);

          if (type === "upvote") {
            updatedUpvotes += 1;
            updatedDownvotes = Math.max(0, updatedDownvotes - 1);
          } else {
            updatedDownvotes += 1;
            updatedUpvotes = Math.max(0, updatedUpvotes - 1);
          }
        }
      } else {
        // **New vote**
        await instance
          .from("answers_votes")
          .insert([{ user_id, answer_id, vote_type: type }]);
        if (type === "upvote") updatedUpvotes += 1;
        else updatedDownvotes += 1;
      }

      // Update the `post_answers` table with new vote counts
      const { error: updateError } = await instance
        .from("post_answers")
        .update({ upvote: updatedUpvotes, downvote: updatedDownvotes })
        .eq("id", answer_id);

      if (updateError) {
        toast.error("Error updating answer votes.");
        return;
      }

      // Update UI state
      setVotes(updatedUpvotes - updatedDownvotes);
      setUserVote(newVoteType);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-row gap-4 items-start">
      <div className="flex flex-col gap-4 items-center">
        <button
          type="button"
          className={cn(
            "p-2 flex-shrink-0 cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100  hover:dark:bg-stone-700 hover:bg-stone-200 rounded-md",
            userVote === "upvote"
              ? "bg-green-500 text-white"
              : "bg-stone-50 shadow dark:shadow-none dark:bg-stone-800"
          )}
          onClick={() => handleAnswerVote(answer.id, "upvote")}
        >
          <MdArrowUpward size={24} />
        </button>
        <p className="font-black text-3xl">{votes ?? 0}</p>
        <button
          type="button"
          className={cn(
            "p-2 flex-shrink-0 cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100  hover:dark:bg-stone-700 hover:bg-stone-200 rounded-md",
            userVote === "downvote"
              ? "bg-red-500 text-white"
              : "bg-stone-50 shadow dark:shadow-none dark:bg-stone-800"
          )}
          onClick={() => handleAnswerVote(answer.id, "downvote")}
        >
          <MdArrowDownward size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-between gap-6 p-4 rounded-xl bg-stone-50 shadow dark:bg-stone-800 w-full">
        <EditorProvider
          content={answer.answer}
          extensions={[StarterKit]}
          editable={false}
          immediatelyRender={false}
        />
        <div className="flex flex-row justify-between items-end">
          <div className="flex flex-col gap-1">
            <h1 className="dark:text-stone-500">Answered by</h1>
            <div className="flex flex-row gap-2 items-center">
              <MdAccountCircle size={36} />
              <p>{answer!.user.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserPostedAnswers = ({ answers }: { answers: any[] | null }) => {
  if (Array.isArray(answers)) {
    return (
      <>
        {answers.map((answer) => (
          <UserPostedAnswer answer={answer} key={answer.id} />
        ))}
      </>
    );
  }
};

export const PostAnswer = ({
  post,
  user,
}: {
  post: any[] | null;
  user: any | null;
}) => {
  const instance = createClient();
  const [answerContent, setAnswerContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "dark:bg-stone-800 bg-stone-50 shadow dark:shadow-none p-4 min-h-[30vh] max-h-[30vh] rounded-md focus:outline-none overflow-y-scroll",
      },
    },
    extensions: [StarterKit.configure({})],
    content: answerContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setAnswerContent(html);
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!answerContent) return;

    setIsPosting(true);

    const { status } = await instance.from("post_answers").insert({
      user_id: (await user).data.session?.user.id,
      post_id: post![0].post_id,
      answer: answerContent,
    });

    if (status === 201) {
      toast.success("Posted.");
      setIsPosting(false);
      editor?.commands.setContent("");
      router.refresh();
    } else {
      toast.error("Post failed. Try again.");
      setIsPosting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="w-full h-1 dark:bg-stone-900 rounded-full"></div>
      <h1 className="text-xl">Post your answer!</h1>
      {editor && (
        <div className="hidden lg:flex flex-row gap-4 bg-stone-50 shadow dark:shadow-none dark:bg-stone-800 rounded-md h-fit p-2">
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
      <EditorContent editor={editor} />
      <button
        className="p-4 dark:bg-stone-700 transition-all shadow dark:shadow-none bg-stone-100 hover:bg-stone-200 delay-0 duration-200 dark:hover:bg-stone-600 flex-1 rounded-md disabled:dark:bg-stone-900 disabled:dark:text-stone-700"
        type="submit"
        disabled={isPosting}
      >
        {!isPosting ? "Post your answer" : "Posting..."}
      </button>
    </form>
  );
};
