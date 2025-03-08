"use client";
import { FloatingDock } from "@/components/ui/floating-dock";
import { createClient } from "@/supabase/client";
import links from "@/types/Links";
import {
  PostAnswer,
  UserPost,
  UserPostedAnswers,
  UserPostHeading,
} from "./components";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ClientSideLayout({
  post,
  answers,
}: {
  post: any[] | null;
  answers: any[] | null;
}) {
  const instance = createClient();
  const user = instance.auth.getSession();

  return (
    <div className="flex relative flex-col lg:py-4 py-6 px-8 gap-6 mb-[3vw] flex-1 lg:max-w-3xl lg:mx-auto w-full min-h-screen">
      <UserPostHeading post={post} />
      <UserPost post={post} user={user} />
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-4xl">Answers</h1>
        {/* PUT SORTING/FILTER DROPDOWN here*/}
      </div>
      <div className="flex flex-col gap-8">
        <UserPostedAnswers answers={answers} />
      </div>
      <PostAnswer post={post} user={user} />
      <FloatingDock
        items={links}
        mobileClassName="fixed bottom-0"
        desktopClassName="z-10 fixed bottom-0 justify-center inset-x-0 max-w-fit"
      />
    </div>
  );
}
