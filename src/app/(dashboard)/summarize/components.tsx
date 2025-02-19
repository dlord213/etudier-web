import { FileUpload } from "@/components/ui/file-upload";
import { Dispatch, SetStateAction } from "react";
import { MdArrowLeft } from "react-icons/md";

export const SummarizePDFPage = ({
  setIndex,
}: {
  setIndex?: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <MdArrowLeft
          size={28}
          className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
          onClick={() => setIndex!(0)}
        />
        <div className="flex flex-col">
          <h1 className="font-bold lg:text-3xl text-xl">Summarize Module</h1>
          <p className="dark:text-stone-600 text-sm">
            Note: No files larger than 10 MB.
          </p>
        </div>
      </div>
      <FileUpload />
    </div>
  );
};
