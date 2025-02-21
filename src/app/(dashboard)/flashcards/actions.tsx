"use server";
import { createClient } from "@/supabase/server";

export async function addFlashcard(formData: FormData) {
  const instance = await createClient();
  const user = (await instance.auth.getSession()).data.session?.user;

  const form = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    cards: JSON.parse(formData.get("cards") as string),
  };

  const { error } = await instance.from("flashcard").insert({
    ...form,
    user_id: user?.id,
  });

  if (error) {
    console.error("Error:", error);
    return 400;
  } else {
    return 200;
  }
}

export async function deleteFlashcard(formData: FormData) {
  const instance = await createClient();

  const id = formData.get("flashcard_id");

  const { error } = await instance
    .from("flashcard")
    .delete()
    .eq("flashcard_id", id);

  if (error) {
    console.error("Error:", error);
    return 400;
  } else {
    return 200;
  }
}
