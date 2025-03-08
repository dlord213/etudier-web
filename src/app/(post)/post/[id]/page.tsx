import { createClient } from "@/supabase/client";
import ClientSideLayout from "./page.client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Page({ params }: { params: Promise<any> }) {
  const instance = createClient();
  const { id } = await params;

  const { data: post } = await instance
    .from("post")
    .select("*, user (username)")
    .eq("post_id", id);

  const { data: answers } = await instance
    .from("post_answers")
    .select("*, user (username)")
    .eq("post_id", id);

  return (
    <div className="flex flex-col min-h-screen">
      <ClientSideLayout answers={answers} post={post} />
    </div>
  );
}
