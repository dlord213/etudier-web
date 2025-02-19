"use server";

import { createClient } from "@/supabase/server";

export async function addTask(formData: FormData) {
  const instance = await createClient();
  const { data } = await instance.auth.getUser();

  const form = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    deadline: formData.get("deadline") as string,
  };

  const { error } = await instance
    .from("task")
    .insert({ ...form, user_id: data.user.id });

  if (error) {
    console.error("Error inserting task:", error);
    return 400;
  } else return 200;
}

export async function updateTask(formData: FormData) {
  const instance = await createClient();
  const { data } = await instance.auth.getUser();

  const form = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    deadline: formData.get("deadline") as string,
    task_id: formData.get("id") as string,
  };

  const { error } = await instance
    .from("task")
    .update({
      title: form.title,
      description: form.description,
      deadline: form.deadline,
    })
    .eq("task_id", form.task_id);
  if (error) {
    console.error("Error updating task:", error);
    return 400;
  } else return 200;
}

export async function toggleCheckTask(formData: FormData) {
  const instance = await createClient();

  const task_id = formData.get("id") as string;
  const currentCompleted = formData.get("completed") === "true";
  const newCompleted = !currentCompleted;

  const { error } = await instance
    .from("task")
    .update({ completed: newCompleted })
    .eq("task_id", task_id);

  if (error) {
    console.error("Error updating task:", error);
    return 400;
  } else return 200;
}

export async function deleteTask(formData: FormData) {
  const instance = await createClient();
  const task_id = formData.get("id") as string;

  const { error } = await instance.from("task").delete().eq("task_id", task_id);
  if (error) {
    console.error("Error updating task:", error);
    return 400;
  } else return 200;
}
