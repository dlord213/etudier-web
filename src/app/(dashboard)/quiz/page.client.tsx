/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { Fragment } from "react";
import { createClient } from "@/supabase/client";
import { QuizDataProps } from "@/types/Quiz";
import { useEffect, useState } from "react";
import { MdAdd, MdGeneratingTokens } from "react-icons/md";
import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";
import {
  AddQuizComponent,
  AnswerUserQuizComponent,
  GenerateQuizComponent,
} from "./components";

export default function ClientSideLayout({
  serverQuizzes,
}: {
  serverQuizzes: any;
}) {
  const instance = createClient();

  const [index, setIndex] = useState(0);
  const [quizzes, setQuizzes] = useState(serverQuizzes);
  const [json, setJSON] = useState<QuizDataProps>();

  useEffect(() => {
    const channel = instance
      .channel("quizzes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "quiz",
          schema: "public",
        },
        (payload: any) => {
          setQuizzes((prevQuizzes: any[]) => {
            const quizId = payload.new?.quiz_id || payload.old?.quiz_id;

            switch (payload.eventType) {
              case "DELETE":
                return prevQuizzes.filter(
                  (quiz: QuizDataProps) => quiz.quiz_id !== quizId
                );
              case "UPDATE":
                return prevQuizzes.map((quiz: QuizDataProps) =>
                  quiz.quiz_id === quizId ? payload.new : quiz
                );
              case "INSERT":
                return [...prevQuizzes, payload.new];
              default:
                return prevQuizzes;
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
    <Fragment key="main">
      {/* Page 0: Quiz list */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          <MdAdd
            size={28}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => setIndex(3)}
          />
          <div className="flex flex-col">
            <h1 className="font-bold lg:text-3xl text-xl">Quiz</h1>
            <p className="text-stone-400 dark:text-stone-600 text-sm">
              Note: Any quiz published is public.
            </p>
          </div>
        </div>
        <input
          type="text"
          className="hidden bg-stone-100 dark:bg-stone-700 p-4 text-sm rounded-3xl outline-none dark:focus:ring-stone-700 lg:w-fit w-full"
          placeholder="Search for quiz"
        />
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {quizzes?.map((quiz: QuizDataProps, quizIndex: number) => (
          <div
            key={quiz.quiz_id ? quiz.quiz_id : `quiz-${quizIndex}`}
            className="flex flex-col gap-4 w-fit h-fit lg:max-w-[160px] p-3 bg-stone-100 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer dark:shadow-none shadow"
            onClick={() => {
              setJSON(quiz);
              setIndex(1);
            }}
          >
            <h1>{quiz.title}</h1>
          </div>
        ))}
        <div
          className="flex flex-row gap-2 items-center w-fit h-fit lg:max-w-[160px] p-3 bg-stone-100 hover:bg-[#d75c77] hover:text-white dark:bg-stone-800 hover:dark:bg-stone-600 transition-colors rounded-md cursor-pointer dark:shadow-none shadow"
          onClick={() => {
            setIndex(2);
            setJSON(undefined);
          }}
        >
          <MdGeneratingTokens className="flex-shrink-0" size={24} />
          <h1>Generate</h1>
        </div>
      </div>
    </Fragment>,
    <AnswerUserQuizComponent
      key="answer_quiz"
      setIndex={setIndex}
      quiz={json}
    />,
    <GenerateQuizComponent key="generate_quiz" setIndex={setIndex} />,
    <AddQuizComponent key="add_quiz" setIndex={setIndex} />,
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
