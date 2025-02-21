import { createClient } from "@/supabase/server";
import ClientSideLayout from "./page.client";

export default async function Page() {
  const instance = await createClient();
  const user = (await instance.auth.getSession()).data.session?.user;

  const modules = await instance
    .from("module")
    .select("*")
    .eq("user_id", user?.id);

  return (
    <main className="flex flex-col min-h-screen">
      <ClientSideLayout user={user} serverModules={modules.data} />
    </main>
  );
}
