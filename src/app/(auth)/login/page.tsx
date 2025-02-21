"use client";
import Link from "next/link";
import login from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MdInfo } from "react-icons/md";

function MainPage() {
  const params = useSearchParams();
  const server_error_msg = params.get("message");

  return (
    <main className="lg:grid lg:grid-cols-2 flex flex-col content-center 2xl:max-w-[70vw] xl:max-w-[80vw] max-w-[90vw] mx-auto gap-8 py-8 min-h-screen">
      <Link
        href="/"
        className="flex-1 flex flex-col bg-[#d75c77] hover:bg-[#c13d60] dark:bg-stone-800 rounded-md items-center justify-center transition-all delay-0 duration-300 hover:dark:bg-stone-700"
      >
        <h1 className="font-black text-3xl lg:text-6xl text-white">etudier</h1>
      </Link>
      <form className="grid grid-flow-row gap-4" action={login}>
        <p className="text-lg lg:text-2xl font-medium">
          Your tasks, notes, and quizzes are waiting. Sign in to pick up where
          you left off—or join thousands of learners and doers who organize
          smarter every day.
        </p>
        <div className="flex flex-col gap-2">
          <h1>Email</h1>
          <input
            type="email"
            name="email"
            className="border dark:border-none dark:bg-stone-700 p-4 text-sm rounded-lg ps-2.5 outline-none dark:focus:ring-stone-700"
            placeholder="john@etudier.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1>Password</h1>
          <input
            type="password"
            name="password"
            className="border dark:border-none dark:bg-stone-700 p-4 text-sm rounded-lg ps-2.5 outline-none dark:focus:ring-stone-700"
            placeholder="***********"
            required
          />
        </div>
        <div className="flex flex-row justify-between">
          <Link href="/register">Don&apos;t have an account?</Link>
        </div>
        <button
          type="submit"
          className="text-white dark:bg-stone-700 bg-[#d75c77] hover:bg-[#c13d60] dark:hover:bg-stone-800 focus:ring-4 focus:outline-none focus:ring-stone-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Login
        </button>
        {server_error_msg && (
          <div className="flex flex-row gap-3 p-4 items-center bg-[#d75c77] dark:bg-stone-800 rounded-md">
            <MdInfo className="" size={24} />
            <p>{server_error_msg}</p>
          </div>
        )}
      </form>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <MainPage />
    </Suspense>
  );
}
