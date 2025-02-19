"use server";
import { createClient } from "@/supabase/server";
import FormSchema from "@/types/FormSchema";
import { redirect } from "next/navigation";

export async function logout() {
  const instance = await createClient();
  await instance.auth.signOut();
  redirect("/");
}

export default async function login(formData: FormData) {
  const instance = await createClient();
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = FormSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    redirect(`/login?message=${encodeURIComponent(errorMessages)}`);
  }

  const { email, password } = validation.data;
  try {
    const { error: authError } = await instance.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
  } catch (error) {
    console.error("Login error:", error);
    redirect(
      `/login?message=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );
  }

  redirect("/tasks");
}
