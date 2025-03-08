/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FloatingDock } from "@/components/ui/floating-dock";
import { cn } from "@/lib/utils";
import links from "@/types/Links";
import { useEffect, useState } from "react";
import {
  MdAccountCircle,
  MdHub,
  MdImage,
  MdPoll,
  MdUploadFile,
} from "react-icons/md";
import { CreatePostModal, Posts } from "./components";
import { createClient } from "@/supabase/client";

export default function ClientSideLayout({
  serverPosts,
}: {
  serverPosts: any;
}) {
  const instance = createClient();
  const [posts, setPosts] = useState(serverPosts);

  const [isCreatePostModalVisible, setCreatePostModalVisibility] =
    useState(false);

  useEffect(() => {
    const channel = instance
      .channel("post_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "post",
          schema: "public",
        },
        async (payload: any) => {
          const postId = payload.new?.post_id || payload.old?.post_id;

          if (payload.eventType === "DELETE") {
            setPosts((prevPosts: any[]) =>
              prevPosts.filter(
                (post: { post_id: any }) => post.post_id !== postId
              )
            );
            return;
          }

          try {
            const { data: fullPost, error } = await instance
              .from("post")
              .select("*, user (username)")
              .eq("post_id", postId)
              .single();

            if (error || !fullPost) {
              console.error("Error fetching full post:", error);
              return;
            }

            setPosts((prevPosts: any[]) => {
              if (payload.eventType === "INSERT") {
                return [...prevPosts, fullPost];
              }

              return prevPosts.map((post: { post_id: any }) =>
                post.post_id === postId ? fullPost : post
              );
            });
          } catch (err) {
            console.error("Failed to fetch related post data", err);
          }
        }
      )
      .subscribe();

    return () => {
      instance.removeChannel(channel);
    };
  }, [instance, posts]);

  return (
    <>
      <div className="flex relative flex-col lg:py-4 py-2 px-8 gap-2 flex-1 lg:max-w-3xl lg:mx-auto w-full min-h-screen">
        <div className="flex flex-col gap-4 p-4 dark:bg-stone-800 rounded-md sticky ">
          <div className="flex flex-row gap-2">
            <MdAccountCircle size={32} className="flex-shrink-0 self-center" />
            <button
              type="button"
              onClick={() => setCreatePostModalVisibility(true)}
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl pl-6 py-2",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "overflow-y-auto resize-none text-left",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "transition-[height] duration-100 ease-out",
                "min-h-fit w-full dark:hover:bg-stone-600"
              )}
            >
              <p className="self-center dark:text-stone-400">
                What&apos;s on your mind?
              </p>
            </button>
          </div>
          <div className="hidden flex-row gap-2">
            <button
              type="button"
              className="md:flex md:flex-row hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2 w-full"
            >
              <MdUploadFile size={24} className="flex-shrink-0" />
              <p className="text-sm">Documents/PDF</p>
            </button>
            <button
              type="button"
              className="md:flex md:flex-row hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2 w-full"
            >
              <MdImage size={24} className="flex-shrink-0" />
              <p className="text-sm">Images</p>
            </button>
            <button
              type="button"
              className="md:flex md:flex-row hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2 w-full"
            >
              <MdPoll size={24} className="flex-shrink-0" />
              <p className="text-sm">Create a poll</p>
            </button>
            <button
              type="button"
              className="md:flex md:flex-row hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-600 rounded-md px-4 py-2 items-center gap-2 w-full"
            >
              <MdHub size={24} className="flex-shrink-0" />
              <p className="text-sm">Hub</p>
            </button>
          </div>
        </div>
        <Posts posts={posts} />
      </div>
      <FloatingDock
        items={links}
        mobileClassName="z-10 fixed bottom-0"
        desktopClassName="z-10 fixed bottom-0 justify-center inset-x-0 max-w-fit"
      />
      <CreatePostModal
        modalVisibility={isCreatePostModalVisible}
        setModalVisibility={setCreatePostModalVisibility}
      />
    </>
  );
}
