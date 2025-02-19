"use server";
import { createClient } from "@/supabase/server";
import FormSchema from "@/types/FormSchema";
import { redirect } from "next/navigation";

export default async function register(formData: FormData) {
  const instance = await createClient();
  const data = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validation = FormSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = validation.error.issues
      .map((issue) => issue.message)
      .join(", ");
    redirect(`/register?message=${encodeURIComponent(errorMessages)}`);
  }

  const { email, password, username } = validation.data;
  try {
    const { error: authError, data } = await instance.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const { error: profileError } = await instance.from("user").insert({
      id: data.user?.id,
      username,
    });
    if (profileError) throw profileError;
  } catch (error) {
    console.error("Registration error:", error);
    redirect(
      `/register?message=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );
  }

  redirect("/dashboard/tasks");
}
