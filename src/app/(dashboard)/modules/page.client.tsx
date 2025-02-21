"use client";
import { createClient } from "@/supabase/client";
import { AddModule, SearchModule, SummarizePDF } from "./components";
import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";
import { useEffect, useState } from "react";
import {
  MdAdd,
  MdList,
  MdNoAccounts,
  MdNoBackpack,
  MdNoCell,
  MdOutlineSummarize,
  MdSearch,
} from "react-icons/md";
import { ModuleProps } from "@/types/Module";
import { LinkPreview } from "@/components/ui/link-preview";

export default function ClientSideLayout({
  user,
  serverModules,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serverModules: any;
}) {
  const instance = createClient();
  const [index, setIndex] = useState(0);
  const [modules, setModules] = useState(serverModules);
  const user_id = user.id;

  useEffect(() => {
    const channel = instance
      .channel("module_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "module",
          schema: "public",
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setModules((prevModules: any[]) => {
            const module_id = payload.new?.module_id || payload.old?.module_id;

            switch (payload.eventType) {
              case "DELETE":
                return prevModules.filter(
                  (_module: ModuleProps) => _module.module_id !== module_id
                );
              case "UPDATE":
                return prevModules.map((_module: ModuleProps) =>
                  _module.module_id === module_id ? payload.new : _module
                );
              case "INSERT":
                return [...prevModules, payload.new];
              default:
                return prevModules;
            }
          });
        }
      )
      .subscribe();

    return () => {
      instance.removeChannel(channel);
    };
  }, [instance]);

  const pages = [
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4 items-center">
          <MdAdd
            size={24}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => setIndex(2)}
          />
          <h1 className="font-bold lg:text-3xl text-xl">Modules</h1>
        </div>
        <div className="flex flex-row gap-2">
          <button
            className="md:block hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-800 rounded-md px-4 py-2"
            onClick={() => setIndex(1)}
          >
            <MdOutlineSummarize size={24} />
          </button>
          <button
            className="md:block hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-800 rounded-md px-4 py-2"
            onClick={() => setIndex(3)}
          >
            <MdSearch size={24} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {modules.length >= 1 ? (
          modules.map(
            (module: { link: string; title: string; description: string }) => (
              <LinkPreview
                url={module.link}
                className="flex flex-col bg-stone-100 p-4 rounded-md dark:bg-stone-700"
                key={module.link}
              >
                <h1 className="font-bold text-2xl">{module.title}</h1>
                <h1 className="text-sm">{module.description}</h1>
              </LinkPreview>
            )
          )
        ) : (
          <div className="flex flex-col h-[50vh] justify-center items-center gap-2">
            <MdNoBackpack size={"7vw"} />
            <h1 className="font-bold text-2xl">No modules.</h1>
          </div>
        )}
      </div>
    </>,
    <>
      <SummarizePDF setIndex={setIndex} />
    </>,
    <>
      <AddModule setIndex={setIndex} user_id={user_id} />
    </>,
    <>
      <SearchModule setIndex={setIndex} />
    </>,
  ];

  return (
    <>
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-4 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        {pages[index]}
      </section>
      <FloatingDock items={links} />
    </>
  );
}
