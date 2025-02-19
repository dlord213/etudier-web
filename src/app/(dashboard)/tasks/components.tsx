import { Dispatch, SetStateAction } from "react";
import { addTask, deleteTask, toggleCheckTask, updateTask } from "./actions";
import {
  MdCheckCircle,
  MdCheckCircleOutline,
  MdClose,
  MdDelete,
} from "react-icons/md";
import { TaskProps } from "@/types/Task";
import dayjs from "dayjs";

interface TaskModalProps {
  modalVisibility: boolean;
  setModalVisibility: Dispatch<SetStateAction<boolean>>;
  form?: {
    task_id: number;
    title: string;
    description: string;
    deadline: string;
  };
  setForm?:
    | Dispatch<
        SetStateAction<{
          task_id: number;
          title: string;
          description: string;
          deadline: string;
        }>
      >
    | undefined;
}

interface TaskItemComponentProps {
  task: TaskProps;
  onEdit: () => void;
}

export const AddTaskModal = ({
  modalVisibility,
  setModalVisibility,
}: TaskModalProps) => {
  if (modalVisibility) {
    return (
      <form
        className="fixed inset-0 bg-black/70 rounded-md z-50 flex flex-col justify-center items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setModalVisibility(false);
          }
        }}
        action={(e) => {
          addTask(e);
          setModalVisibility(false);
        }}
      >
        <div className="relative dark:bg-stone-800 2xl:w-[30vw] 2xl:h-[39vh] xl:w-[50vw] xl:h-[50vh] mx-auto my-auto lg:w-[70vw] lg:h-[50vh] md:h-[50vh] md:w-[90vw] h-[90vh] w-[90vw] rounded-md p-4 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2">
            <MdClose
              size={32}
              onClick={() => setModalVisibility(false)}
              className="cursor-pointer"
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              required
              className="pt-2 dark:bg-stone-800 outline-none text-3xl font-bold"
            />
            <textarea
              className="outline-none dark:bg-stone-800 h-auto resize-none"
              wrap="hard"
              name="description"
              placeholder="Description"
              contentEditable
              rows={5}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row">
              <input
                type="date"
                name="deadline"
                className="outline-none p-2 dark:bg-stone-900 delay-0 duration-200 transition-all dark:hover:bg-stone-700 rounded-md cursor-pointer"
                onClick={(e) => {
                  e.currentTarget.showPicker();
                }}
                placeholder="Date"
                required
              />
            </div>
            <div className="flex flex-row gap-4 rounded-md justify-between">
              <button
                className="p-4 dark:bg-stone-700 transition-all delay-0 duration-200 dark:hover:bg-stone-900 flex-1 rounded-md"
                onClick={() => {
                  setModalVisibility(false);
                }}
              >
                Cancel
              </button>
              <button className="p-4 dark:bg-stone-700 transition-all delay-0 duration-200 dark:hover:bg-stone-900 flex-1 rounded-md">
                Add task
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
};

export const UpdateTaskModal = ({
  modalVisibility,
  setModalVisibility,
  form,
  setForm,
}: TaskModalProps) => {
  if (modalVisibility) {
    return (
      <form
        className="fixed inset-0 bg-black/70 rounded-md z-50 flex flex-col justify-center items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setModalVisibility(false);
          }
        }}
      >
        <div className="relative dark:bg-stone-800 2xl:w-[30vw] 2xl:h-[39vh] xl:w-[50vw] xl:h-[50vh] mx-auto my-auto lg:w-[70vw] lg:h-[50vh] md:h-[50vh] md:w-[90vw] h-[90vh] w-[90vw] rounded-md p-4 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <MdClose
                size={32}
                onClick={() => setModalVisibility(false)}
                className="cursor-pointer"
              />
              <button
                type="submit"
                formAction={(e) => {
                  deleteTask(e);
                  setModalVisibility(false);
                }}
              >
                <MdDelete size={32} />
              </button>
            </div>

            <input type="hidden" name="id" value={form!.task_id} />
            <input
              type="text"
              name="title"
              placeholder="Title"
              required
              value={form!.title}
              onChange={(e) => setForm({ ...form!, title: e.target.value })}
              className="pt-2 dark:bg-stone-800 outline-none text-3xl font-bold"
            />
            <textarea
              className="outline-none dark:bg-stone-800 h-auto resize-none"
              wrap="hard"
              name="description"
              placeholder="Description"
              value={form!.description}
              onChange={(e) =>
                setForm({ ...form!, description: e.target.value })
              }
              rows={5}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row">
              <input
                type="date"
                name="deadline"
                className="outline-none p-2 dark:bg-stone-900 delay-0 duration-200 transition-all dark:hover:bg-stone-700 rounded-md cursor-pointer"
                value={form!.deadline}
                onChange={(e) =>
                  setForm({ ...form!, deadline: e.target.value })
                }
                onClick={(e) => e.currentTarget.showPicker()}
                required
              />
            </div>
            <div className="flex flex-row gap-4 rounded-md justify-between">
              <button
                type="button"
                className="p-4 dark:bg-stone-700 transition-all delay-0 duration-200 dark:hover:bg-stone-900 flex-1 rounded-md"
                onClick={() => setModalVisibility(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-4 dark:bg-stone-700 transition-all delay-0 duration-200 dark:hover:bg-stone-900 flex-1 rounded-md"
                formAction={(e) => {
                  updateTask(e);
                  setModalVisibility(false);
                }}
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
};

export const TaskItem = ({ task, onEdit }: TaskItemComponentProps) => {
  return (
    <div className="flex gap-2 rounded-md">
      <form
        action={(e) => {
          toggleCheckTask(e);
        }}
      >
        <input type="hidden" name="id" value={task.task_id} />
        <input type="hidden" name="completed" value={String(task.completed)} />
        <button type="submit" className="cursor-pointer">
          {task.completed ? (
            <MdCheckCircle
              size={24}
              className="transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md flex-shrink-0"
            />
          ) : (
            <MdCheckCircleOutline
              size={24}
              className="transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md flex-shrink-0"
            />
          )}
        </button>
      </form>
      <div
        className="flex flex-col w-full px-2 hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 rounded-md cursor-pointer"
        onClick={onEdit}
      >
        <h1 className="text-lg">{task.title}</h1>
        {task.description && <p className="text-sm">{task.description}</p>}
        <p className="text-sm rounded-md w-fit mt-2">
          {dayjs(task.created_at).add(6, "day").format("MMM DD YYYY")}
        </p>
      </div>
    </div>
  );
};
