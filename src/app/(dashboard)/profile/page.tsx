import { createClient } from "@/supabase/server";
import { Metadata } from "next";
import ClientSideLayout from "./page.client";

export const metadata: Metadata = {
  title: "etudier / Profile",
  description: "Generated by create next app",
};

export default async function Page() {
  const instance = await createClient();
  const user = (await instance.auth.getSession()).data.session?.user;
  const profile = await instance.from("user").select("*").eq("id", user?.id);

  return (
    <main className="flex flex-col lg:grid 2xl:grid-cols-[20vw_1fr] xl:grid-cols-[30vw_1fr] lg:grid-cols-[40vw_1fr] min-h-screen">
      <ClientSideLayout user={user} profile={profile} />
    </main>
  );
}
