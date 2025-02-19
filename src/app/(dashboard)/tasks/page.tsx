import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import ClientSideLayout from "./page.client";

export const metadata: Metadata = {
  title: "etudier / Tasks",
  description: "Generated by create next app",
};

export default async function Page() {
  const instance = await createClient();
  const user = await instance.auth.getUser();
  const tasks = await instance
    .from("task")
    .select("*")
    .eq("user_id", user.data.user?.id);

  return (
    <main className="flex flex-col min-h-screen">
      <ClientSideLayout user={user} tasks={tasks.data ?? []} />
    </main>
  );
}
