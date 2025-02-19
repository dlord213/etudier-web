import { logout } from "@/app/(auth)/login/actions";
import { ReactElement, ReactNode } from "react";
import { IconType } from "react-icons/lib";
import {
  MdTaskAlt,
  MdNote,
  MdQuiz,
  MdQuestionAnswer,
  MdLibraryBooks,
  MdLogout,
  MdSummarize,
} from "react-icons/md";

type LinkProps = {
  title: string;
  icon: ReactNode;
  href?: string;
  onClickFunction?: () => void;
};

const links: LinkProps[] = [
  {
    title: "Tasks",
    icon: <MdTaskAlt size={24} className="flex-shrink-0" />,
    href: "/tasks",
  },
  {
    title: "Notes",
    icon: <MdNote size={24} className="flex-shrink-0" />,
    href: "/notes",
  },
  {
    title: "Flashcards",
    icon: <MdQuiz size={24} className="flex-shrink-0" />,
    href: "/flashcards",
  },
  {
    title: "Quiz",
    icon: <MdQuestionAnswer size={24} className="flex-shrink-0" />,
    href: "/quiz",
  },
  {
    title: "Summarize",
    icon: <MdSummarize size={24} className="flex-shrink-0" />,
    href: "/summarize",
  },
  {
    title: "Logout",
    icon: <MdLogout size={24} className="flex-shrink-0" />,
    onClickFunction: () => logout(),
  },
];

export default links;
