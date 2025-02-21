import Link from "next/link";
import login from "./(auth)/login/actions";

export default async function Home() {
  return (
    <main className="flex flex-col 2xl:py-24 2xl:max-w-[50vw] mx-auto gap-4 min-h-screen justify-center">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:gap-12">
        <div className="flex flex-col basis-[50%] lg:items-start items-center lg:justify-start justify-center">
          <h1 className="font-black xl:text-7xl text-5xl">etudier</h1>
          <p className="hidden lg:block">
            Your tasks, notes, and quizzes are waiting. Sign in to pick up where
            you left off—or join thousands of learners and doers who organize
            smarter every day.
          </p>
        </div>
        <form
          className="grid grid-flow-row gap-4 basis-[50%] p-4 lg:m-0 m-4 dark:bg-stone-900 rounded-md"
          action={login}
        >
          <div className="flex flex-col gap-2">
            <h1>Email</h1>
            <input
              type="email"
              name="email"
              className="border-none bg-zinc-200 dark:bg-stone-700 p-4 text-sm rounded-lg ps-2.5 outline-none dark:focus:ring-stone-700"
              placeholder="john@etudier.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1>Password</h1>
            <input
              type="password"
              name="password"
              className="border-none bg-zinc-200 dark:bg-stone-700 p-4 text-sm rounded-lg ps-2.5 outline-none dark:focus:ring-stone-700"
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
        </form>
        <p className="block lg:hidden p-4 text-center">
          Your tasks, notes, and quizzes are waiting. Sign in to pick up where
          you left off—or join thousands of learners and doers who organize
          smarter every day.
        </p>
      </div>
    </main>
  );
}
