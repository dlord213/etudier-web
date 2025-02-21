import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import ClientSideLayout from "./page.client";

export const metadata: Metadata = {
  title: "etudier / Quiz",
  description: "Generated by create next app",
};

export default async function Page() {
  const instance = await createClient();
  const quizzes = await instance
    .from("quiz")
    .select("title, description, user_id ( id, username ), quizzes");

  return (
    <main className="flex flex-col min-h-screen">
      <ClientSideLayout serverQuizzes={quizzes.data ?? []} />
    </main>
  );
}
