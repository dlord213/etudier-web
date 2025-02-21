"use server";

import { createClient } from "@/supabase/server";

export async function addNote(formData: FormData) {
  const instance = await createClient();
  const user = (await instance.auth.getSession()).data.session?.user;

  const form = {
    title: formData.get("title") as string,
    html: formData.get("note") as string,
  };

  const { error } = await instance
    .from("note")
    .insert({ ...form, user_id: user?.id });

  if (error) {
    console.error("Error adding note:", error);
  }
}

export async function updateNote(formData: FormData) {
  const instance = await createClient();

  const form = {
    title: formData.get("title") as string,
    html: formData.get("note") as string,
    note_id: formData.get("note_id") as string,
  };

  const { error } = await instance
    .from("note")
    .update({ title: form.title, html: form.html })
    .eq("note_id", form.note_id);

  if (error) {
    console.error("Error adding note:", error);
  }
}
