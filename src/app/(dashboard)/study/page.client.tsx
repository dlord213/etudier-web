/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { AsideComponent } from "@/components/Aside";
import { createClient } from "@/supabase/client";
import {
  MdGeneratingTokens,
  MdNote,
  MdSummarize,
  MdTimer,
} from "react-icons/md";

export default function ClientSideLayout({ user }: { user: any }) {
  const instance = createClient();
  const [index, setIndex] = useState(0);

  const pages = [
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-col">
            <h1 className="font-bold lg:text-3xl text-xl">Study</h1>
          </div>
        </div>
        <input
          type="text"
          className="border dark:border-none dark:bg-stone-700 p-4 text-sm rounded-3xl outline-none dark:focus:ring-stone-700 lg:w-fit w-full"
          placeholder="Search for resources"
        />
      </div>
      <div className="flex lg:flex-row flex-col gap-2">
        <button
          className="flex flex-row gap-2 p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
          type="button"
        >
          <MdTimer size={24} className="flex-shrink-0" />
          Pomodoro
        </button>
        <button
          className="flex flex-row gap-2 p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
          type="button"
        >
          <MdGeneratingTokens size={24} className="flex-shrink-0" />
          Ask AI
        </button>
        <button
          className="flex flex-row gap-2 p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
          type="button"
        >
          <MdNote size={24} className="flex-shrink-0" />
          Notes
        </button>
        <button
          className="flex flex-row gap-2 p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
          type="button"
          onClick={() => setIndex(4)}
        >
          <MdSummarize size={24} className="flex-shrink-0" />
          Summarize Module/PDF
        </button>
      </div>
    </>,
    <></>,
    <></>,
    <></>,
    <>
      <SummarizePDFPage setIndex={setIndex} />
    </>,
  ];

  return (
    <>
      <AsideComponent user={user} />
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-4 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        {pages[index]}
      </section>
    </>
  );
}
