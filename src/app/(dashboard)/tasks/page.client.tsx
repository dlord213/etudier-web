"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { TaskProps } from "@/types/Task";
import { createClient } from "@/supabase/client";
import { AddTaskModal, TaskItem, UpdateTaskModal } from "./components";
import { MdAdd, MdCheck, MdError, MdListAlt, MdMenu } from "react-icons/md";

import { FloatingDock } from "@/components/ui/floating-dock";
import links from "@/types/Links";
import {
  isIndexBtnStyle,
  isMenuIndexBtnStyle,
  isMenuNotIndexBtnStyle,
  isMenuNotVisibleStyle,
  isMenuVisibleStyle,
  isNotIndexBtnStyle,
} from "./page.styles";

export default function ClientSideLayout({
  tasks: serverTasks,
}: {
  tasks: TaskProps[];
}) {
  const instance = createClient();
  const [isMenuVisible, setMenuVisibility] = useState(false);

  const [isAddModalVisible, setAddModalVisilibity] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisibility] = useState(false);

  const [tasks, setTasks] = useState(serverTasks);
  const [form, setForm] = useState({
    task_id: 0,
    title: "",
    description: "",
    deadline: "",
  });

  const [filter, setFilter] = useState<
    "all" | "today" | "week" | "month" | "overdues" | "nextWeek" | "nextMonth"
  >("all");

  const filterByDate = (task: TaskProps) => {
    if (filter === "all") return true;

    const deadline = dayjs(task.deadline);
    const now = dayjs();

    switch (filter) {
      case "today":
        return deadline.isSame(now, "day");
      case "week":
        return deadline.isSame(now, "week");
      case "month":
        return deadline.isSame(now, "month");
      case "nextWeek":
        return deadline.isAfter(now, "week");
      case "nextMonth":
        return deadline.isAfter(now, "month");
      case "overdues":
        return deadline.isBefore(now);
      default:
        return true;
    }
  };

  const [index, setIndex] = useState(0); // 0 - completed | 1 - incompleted | 2 - all
  const pages = [
    <>
      {tasks
        ?.filter((task: TaskProps) => task.completed && filterByDate(task))
        .map((task: TaskProps, index: number) => (
          <TaskItem
            key={index}
            task={task}
            onEdit={() => {
              setForm({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
              });
              setUpdateModalVisibility(true);
            }}
          />
        ))}
    </>,
    <>
      {tasks
        ?.filter((task: TaskProps) => !task.completed && filterByDate(task))
        .map((task: TaskProps, index: number) => (
          <TaskItem
            key={index}
            task={task}
            onEdit={() => {
              setForm({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
              });
              setUpdateModalVisibility(true);
            }}
          />
        ))}
    </>,
    <>
      {tasks
        ?.filter((task: TaskProps) => filterByDate(task))
        .map((task: TaskProps, index: number) => (
          <TaskItem
            key={index}
            task={task}
            onEdit={() => {
              setForm({
                task_id: task.task_id,
                title: task.title,
                description: task.description,
                deadline: task.deadline,
              });
              setUpdateModalVisibility(true);
            }}
          />
        ))}
    </>,
  ];

  useEffect(() => {
    const channel = instance
      .channel("tasks_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          table: "task",
          schema: "public",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setTasks((prevTasks: any[]) => {
            const task_id = payload.new?.task_id || payload.old?.task_id;

            switch (payload.eventType) {
              case "DELETE":
                return prevTasks.filter(
                  (task: TaskProps) => task.task_id !== task_id
                );
              case "UPDATE":
                return prevTasks.map((task: TaskProps) =>
                  task.task_id === task_id ? payload.new : task
                );
              case "INSERT":
                return [...prevTasks, payload.new];
              default:
                return prevTasks;
            }
          });
        }
      )
      .subscribe();

    return () => {
      instance.removeChannel(channel);
    };
  }, [instance]);

  return (
    <>
      <section className="flex flex-col lg:p-8 py-2 px-8 gap-2 flex-1 lg:max-w-3xl lg:mx-auto w-full">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div className="flex flex-row gap-4 items-center">
            <MdAdd
              size={28}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              onClick={() => setAddModalVisilibity(true)}
            />
            <h1 className="font-bold lg:text-3xl text-xl">Tasks</h1>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <button
              onClick={() => {
                setIndex(1);
              }}
              type="button"
              className={index == 1 ? isIndexBtnStyle : isNotIndexBtnStyle}
            >
              <MdError size={24} />
            </button>
            <button
              onClick={() => {
                setIndex(0);
              }}
              type="button"
              className={index == 0 ? isIndexBtnStyle : isNotIndexBtnStyle}
            >
              <MdCheck size={24} />
            </button>
            <button
              onClick={() => {
                setIndex(2);
              }}
              type="button"
              className={index == 2 ? isIndexBtnStyle : isNotIndexBtnStyle}
            >
              <MdListAlt size={24} />
            </button>
            <div
              onClick={() => {
                setMenuVisibility((state) => !state);
              }}
              className={
                isMenuVisible ? isMenuVisibleStyle : isMenuNotVisibleStyle
              }
            >
              <MdMenu size={24} />
              {isMenuVisible && (
                <div className="absolute flex flex-col gap-1 my-4 p-4 right-0 w-56 bg-white dark:bg-stone-800 shadow-lg rounded-md z-10">
                  <div className="flex flex-row justify-between">
                    <button
                      onClick={() => {
                        setIndex(1);
                      }}
                      type="button"
                      className={
                        index == 1
                          ? isMenuIndexBtnStyle
                          : isMenuNotIndexBtnStyle
                      }
                    >
                      <MdError size={24} />
                    </button>
                    <button
                      onClick={() => {
                        setIndex(0);
                      }}
                      type="button"
                      className={
                        index == 0
                          ? isMenuIndexBtnStyle
                          : isMenuNotIndexBtnStyle
                      }
                    >
                      <MdCheck size={24} />
                    </button>
                    <button
                      onClick={() => {
                        setIndex(2);
                      }}
                      type="button"
                      className={
                        index == 2
                          ? isMenuIndexBtnStyle
                          : isMenuNotIndexBtnStyle
                      }
                    >
                      <MdListAlt size={24} />
                    </button>
                  </div>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("today")}
                  >
                    Today
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("week")}
                  >
                    This Week
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("nextWeek")}
                  >
                    Next Week
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("month")}
                  >
                    This Month
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("nextMonth")}
                  >
                    Next Month
                  </button>
                  <button
                    className="text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-md"
                    onClick={() => setFilter("overdues")}
                  >
                    Overdues
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {pages[index]}
      </section>
      <AddTaskModal
        modalVisibility={isAddModalVisible}
        setModalVisibility={setAddModalVisilibity}
      />
      <UpdateTaskModal
        modalVisibility={isUpdateModalVisible}
        setModalVisibility={setUpdateModalVisibility}
        form={form}
        setForm={setForm}
      />
      <FloatingDock items={links} />
    </>
  );
}
