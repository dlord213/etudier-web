/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdGeneratingTokens } from "react-icons/md";

import { FlashcardProps } from "@/types/Flashcard";

import { createClient } from "@/supabase/client";
import {
  FlashcardAddPage,
  FlashcardModalSheet,
  GenerateFlashcardModalSheet,
} from "./components";
import { CardProps } from "@/types/Card";
import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";

export default function ClientSideLayout({
  user,
  serverFlashcards,
}: {
  user: any;
  serverFlashcards: any;
}) {
  const [flashcards, setFlashcards] = useState(serverFlashcards);
  const [json, setJSON] = useState<CardProps[] | FlashcardProps>([]);
  const [index, setIndex] = useState(0);

  const [error, setError] = useState("");

  const instance = createClient();

  const pages = [
    // 0 - default | 1 - flashcard | 2 - adding | 3 - generate
    <>
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          <MdAdd
            size={28}
            color={"#fefefe"}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md flex-shrink-0"
            onClick={() => setIndex(2)}
          />
          <div className="flex flex-col">
            <h1 className="font-bold lg:text-3xl text-xl">Flashcards</h1>
            <p className="dark:text-stone-600 text-sm">
              Note: Any flashcards published is public.
            </p>
          </div>
        </div>
        <input
          type="text"
          className="border dark:border-none dark:bg-stone-700 p-4 text-sm rounded-3xl outline-none dark:focus:ring-stone-700 lg:w-fit w-full"
          placeholder="Search for flashcard"
        />
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {flashcards?.map((card: FlashcardProps) => (
          <div
            className="flex flex-col gap-4 w-fit lg:max-w-[160px] p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
            key={card.flashcard_id}
            onClick={() => {
              setJSON(card);
              setIndex(1);
            }}
          >
            <h1>{card.title}</h1>
            {card.description && <p>{card.description}</p>}
          </div>
        ))}
        <div
          className="flex flex-row gap-2 items-center w-fit lg:max-w-[160px] p-3 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer"
          onClick={() => {
            setIndex(3);
            setJSON([]);
          }}
        >
          <MdGeneratingTokens className="flex-shrink-0" size={24} />
          <h1>Generate</h1>
        </div>
      </div>
    </>,
    <>
      <FlashcardModalSheet
        setIndex={setIndex}
        json={json}
        setJSON={setJSON}
        user_id={user.data.user.id}
      />
    </>,
    <>
      <FlashcardAddPage
        error={error}
        json={json}
        setError={setError}
        setJSON={setJSON}
        setPageIndex={setIndex}
      />
    </>,
    <>
      <GenerateFlashcardModalSheet setIndex={setIndex} setJSON={setJSON} />
    </>,
  ];

  useEffect(() => {
    const channel = instance
      .channel("flashcard_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "flashcard",
          schema: "public",
        },
        (payload) => {
          setFlashcards((prevFlashcards: any[]) => {
            const cardId =
              payload.new?.flashcard_id || payload.old?.flashcard_id;

            switch (payload.eventType) {
              case "DELETE":
                return prevFlashcards.filter(
                  (card: FlashcardProps) => card.flashcard_id !== cardId
                );

              case "UPDATE":
                return prevFlashcards.map((card: FlashcardProps) =>
                  card.flashcard_id === cardId ? payload.new : card
                );

              case "INSERT":
                return [...prevFlashcards, payload.new];

              default:
                return prevFlashcards;
            }
          });
        }
      )
      .subscribe();

    return () => {
      instance.removeChannel(channel);
    };
  }, [instance, user.data.user.id]);

  useEffect(() => {
    setTimeout(() => {
      setError("");
    }, 2000);
  }, [error]);

  return (
    <>
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-4 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        {pages[index]}
      </section>
      <FloatingDock items={links} />
    </>
  );
}
