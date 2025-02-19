/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useState } from "react";
import { MdAccountCircle, MdArrowDropDown, MdLogout } from "react-icons/md";
import { logout } from "@/app/(auth)/login/actions";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/useMediaQuery";
import links from "@/types/Links";

export const AsideComponent = ({ user }: { user: any }) => {
  const [isDropDownVisible, setDropdownVisibility] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <motion.aside
        animate={{
          width: isOpen ? "100%" : "20%",
          padding: isOpen ? "1rem" : "0",
        }}
        className={cn(
          "sticky top-4 left-0 flex flex-col gap-4 my-4 mx-8 lg:m-4 rounded-md bg-stone-50 dark:border-r dark:border-stone-800 dark:bg-stone-800 overflow-hidden justify-between max-h-[97vh]"
        )}
        onHoverEnd={() => setIsOpen(false)}
        onHoverStart={() => setIsOpen(true)}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex flex-col gap-4">
          <div className="hidden lg:flex flex-row relative gap-2 items-center">
            <button
              onClick={() => setDropdownVisibility(!isDropDownVisible)}
              className="flex flex-row gap-2 items-center w-full transition-all duration-200 hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 p-4 rounded-md"
            >
              <MdAccountCircle size={32} className="flex-shrink-0" />
              {isOpen && (
                <div className="text-left flex-1">
                  <p className="text-sm">{user.data.user?.email}</p>
                </div>
              )}
            </button>
          </div>
          <div className="hidden lg:flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-row gap-4 items-center hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 p-4 rounded-md"
              >
                {link.icon}
                {isOpen && <p>{link.title}</p>}
              </Link>
            ))}
          </div>
        </div>
        <button
          className="flex flex-row gap-4 items-center hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 p-4 rounded-md"
          onClick={() => logout()}
        >
          <MdLogout size={24} className="flex-shrink-0" />
          {isOpen && <p>Sign-out</p>}
        </button>
      </motion.aside>
    );
  }

  return (
    <aside className="flex flex-col gap-4 my-4 mx-8 lg:m-4 rounded-md bg-stone-50 dark:border-r dark:border-stone-800 dark:bg-stone-800 p-4 relative">
      <div className="flex lg:hidden flex-col gap-2">
        <button
          onClick={() => setDropdownVisibility(!isDropDownVisible)}
          className="flex flex-row gap-2 items-center w-full transition-all duration-200 hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 p-4 rounded-md"
        >
          <MdAccountCircle size={24} className="flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm">{user.data.user?.email}</p>
          </div>
          <MdArrowDropDown
            size={20}
            className={`transform transition-transform ${
              isDropDownVisible ? "rotate-180" : ""
            }`}
          />
        </button>
        {isDropDownVisible && (
          <div className="absolute top-full left-0 w-full bg-stone-50 border-2 dark:bg-stone-700 dark:border-none rounded-md shadow-lg z-10 mt-1">
            <div className="p-2 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-row gap-4 items-center hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-700 p-4 rounded-md"
                >
                  {link.icon}
                  {isOpen && <p>{link.title}</p>}
                </Link>
              ))}
              <button
                className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-[#d75c77] hover:text-white hover:dark:bg-stone-800 transition-colors"
                onClick={() => logout()}
              >
                <MdLogout size={24} />
                <span>Log Out</span>
              </button>
            </div>
            {/* Dropdown arrow */}
            <div className="absolute -top-1.5 left-4 w-3 h-3 rotate-45 dark:bg-stone-700"></div>
          </div>
        )}
      </div>
    </aside>
  );
};
