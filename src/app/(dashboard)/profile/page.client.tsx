"use client";

import { MdAccountCircle } from "react-icons/md";
import { AsideComponent } from "../../components/Aside";
import { createClient } from "@/supabase/client";
import { useEffect } from "react";

export default function ClientSideLayout({
  user,
  profile,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
}) {
  const instance = createClient();

  const { username } = profile.data[0];

  return (
    <>
      <AsideComponent user={user} />
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-2 lg:max-w-3xl lg:mx-auto lg:w-full">
        <div className="flex flex-row gap-4 items-center">
          <MdAccountCircle size={96} className="flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <h1 className="lg:text-4xl font-bold text-2xl">{username}</h1>
            <div className="flex flex-row gap-2">
              <button className="flex flex-col gap-4 w-fit lg:max-w-[160px] p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer">
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
