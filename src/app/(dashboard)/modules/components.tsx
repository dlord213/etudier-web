/* eslint-disable @typescript-eslint/no-explicit-any */
import { SummarizeDropzone } from "@/components/ui/file-upload";
import { LinkPreview } from "@/components/ui/link-preview";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import model from "@/lib/ai";
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/client";
import { Dispatch, SetStateAction, useState } from "react";
import {
  MdAdd,
  MdArrowLeft,
  MdClose,
  MdError,
  MdSave,
  MdSearch,
  MdSend,
} from "react-icons/md";
import { ThreeDot } from "react-loading-indicators";

export const SummarizePDF = ({
  setIndex,
}: {
  setIndex?: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <MdArrowLeft
          size={28}
          className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
          onClick={() => setIndex!(0)}
        />
        <div className="flex flex-col">
          <h1 className="font-bold lg:text-3xl text-xl">Summarize Module</h1>
          <p className="text-stone-400 dark:text-stone-600 text-sm">
            Note: No files larger than 10 MB.
          </p>
        </div>
      </div>
      <SummarizeDropzone />
    </div>
  );
};

export const SearchModule = ({
  setIndex,
  user_id,
}: {
  setIndex?: Dispatch<SetStateAction<number>>;
  user_id: any;
}) => {
  const instance = createClient();

  const date = new Date().toISOString().split("T")[0];
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });

  const [prompt, setPrompt] = useState("");
  const [yearFilter, setYearFilter] = useState("2020-01-01");
  const [isGenerating, setIsGenerating] = useState(0);
  const [results, setResults] = useState<
    { title: string; description: string; link: string }[] | { error: string }
  >([]);

  const handleGenerate = async () => {
    if (!prompt) return;

    const predefinedPrompt = `I wanna get academic articles/papers/modules and the generated data must be formatted into something like this {title: str, description: str, link: str, author: str}, must be atleast 30 data. Make sure it's from a reliable academic databases such as Google Scholar/PubMed. Don't return any links that redirects to a search engine, links must be that's redirected directly to an article/paper. Don't return any text, simply return an array with the object format I gave. If the prompt isn't related to searching paper/modules/subjects then return an appropriate result that's formatted like this {error: put an appropriate string here saying that the prompt isn't valid or isn't related on generating paper/modules/subjects or there aren't any academic papers/modules/articles.}.

    Prompt: ${prompt}
    Filter: Date of the article/paper/module above ${yearFilter}`;

    setIsGenerating(1);
    const resultResponse = await model.generateContent(predefinedPrompt);
    let parsed:
      | { title: string; description: string; link: string }[]
      | { error: string };
    try {
      const trimmedString = resultResponse.response
        .text()
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      parsed = JSON.parse(trimmedString);
    } catch (error) {
      parsed = { error: "Failed to parse generated data." + error };
    }

    if ("error" in parsed) {
      setResults(parsed);
      setIsGenerating(3);
    } else {
      setResults(parsed);
      setIsGenerating(2);
    }
  };

  const handleAddModule = async ({
    title,
    description,
    link,
  }: {
    title: string;
    description: string;
    link: string;
  }) => {
    await instance.from("module").insert({
      title: title,
      description: description,
      link: link,
      user_id: user_id,
    });
  };

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <MdArrowLeft
          size={28}
          className="cursor-pointer transition-all delay-0 duration-200 bg-stone-50 shadow dark:shadow-none hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
          onClick={() => setIndex!(0)}
        />
        <h1 className="font-bold lg:text-3xl text-xl">Search Module</h1>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div className="hidden flex-row gap-2 items-center">
          <button
            type="button"
            className="cursor-pointer transition-all delay-0 duration-200 bg-stone-100 px-8 py-2 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-xl"
          >
            Articles
          </button>
          <button
            type="button"
            className="cursor-pointer transition-all delay-0 duration-200 bg-stone-100 px-8 py-2 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-xl"
          >
            Papers
          </button>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <input
            type="date"
            max={date}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="outline-none p-2 dark:bg-stone-900 bg-stone-100 shadow dark:shadow-none hover:bg-stone-200 delay-0 duration-200 transition-all dark:hover:bg-stone-700 rounded-md cursor-pointer"
          />
        </div>
      </div>
      {isGenerating == 0 && (
        <>
          <div className="flex flex-row gap-2">
            <Textarea
              placeholder="Subjects? Topics?"
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-wrap",
                "overflow-y-auto resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "transition-[height] duration-100 ease-out",
                "leading-[1.2] py-[16px]",
                "min-h-[52px]",
                "max-h-[200px]"
              )}
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl px-6",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-nowrap"
              )}
              id="generateBtn"
              onClick={async () => {
                await handleGenerate();
              }}
            >
              <MdSend size={24} className="flex-shrink-0" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <MdSearch size="10vw" />
            <h1 className="font-black text-2xl">Find articles...</h1>
          </div>
        </>
      )}
      {isGenerating == 1 && (
        <div className="flex flex-col items-center justify-center gap-6 lg:min-h-[75vh] min-h-[50vh]">
          <ThreeDot color="#484848" size="large" />
          <h1 className="font-bold lg:text-3xl">Searching...</h1>
        </div>
      )}
      {isGenerating == 2 && (
        <>
          <div className="flex flex-row gap-2">
            <Textarea
              placeholder="Subjects? Topics?"
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-wrap",
                "overflow-y-auto resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "transition-[height] duration-100 ease-out",
                "leading-[1.2] py-[16px]",
                "min-h-[52px]",
                "max-h-[200px]"
              )}
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl px-6",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-nowrap"
              )}
              id="generateBtn"
              onClick={async () => {
                await handleGenerate();
              }}
            >
              <MdSend size={24} className="flex-shrink-0" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {Array.isArray(results) &&
              results.map(
                (item: {
                  title: string;
                  description: string;
                  link: string;
                }) => (
                  <div className="flex flex-row gap-2" key={item.link}>
                    <LinkPreview
                      url={item.link}
                      className="flex flex-col shadow dark:shadow-none bg-stone-100 p-4 rounded-md dark:bg-stone-700"
                    >
                      <h1 className="font-bold text-2xl">{item.title}</h1>
                      <h1 className="text-sm">{item.description}</h1>
                    </LinkPreview>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddModule({
                          description: item.description,
                          link: item.link,
                          title: item.title,
                        });
                      }}
                      className="md:block hidden cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-[#d75c77] hover:text-stone-100 shadow dark:shadow-none hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 rounded-md px-4 py-2"
                    >
                      <MdAdd size={28} />
                    </button>
                  </div>
                )
              )}
          </div>
        </>
      )}
      {isGenerating == 3 && (
        <>
          <div className="flex flex-row gap-2">
            <Textarea
              placeholder="Subjects? Topics?"
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-wrap",
                "overflow-y-auto resize-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "transition-[height] duration-100 ease-out",
                "leading-[1.2] py-[16px]",
                "min-h-[52px]",
                "max-h-[200px]"
              )}
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button
              className={cn(
                "bg-black/5 dark:bg-white/5 rounded-3xl px-6",
                "placeholder:text-black/50 dark:placeholder:text-white/50",
                "border-none ring-black/20 dark:ring-white/20",
                "text-black dark:text-white text-nowrap"
              )}
              id="generateBtn"
              onClick={async () => {
                await handleGenerate();
              }}
            >
              <MdSend size={24} className="flex-shrink-0" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <MdSearch size="10vw" />
            <h1 className="font-black text-2xl">Find articles...</h1>
          </div>
        </>
      )}
    </>
  );
};

export const AddModule = ({
  setIndex,
  user_id,
}: {
  setIndex: Dispatch<SetStateAction<number>>;
  user_id: string;
}) => {
  const instance = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);

    if (!title || title.trim() === "") {
      setError("Error: What's the title of your module?");
      setIsProcessing(false);
      return;
    }
    if (!description || description.trim() === "") {
      setError("Error: Your module has no description or overview.");
      setIsProcessing(false);
      return;
    }
    if (!link || link.trim() === "") {
      setError("Error: Please enter the link of your module.");
      setIsProcessing(false);
      return;
    }
    if (!link.startsWith("https://") && !link.startsWith("http://")) {
      setError("Error: Link must start with either https:// or http://");
      setIsProcessing(false);
      return;
    }

    try {
      await instance.from("module").insert({
        title: title,
        description: description,
        link: link,
        user_id: user_id,
      });
      setIsProcessing(false);
      setIndex!(0);
    } catch (err) {
      setIsProcessing(false);
      setError(`Error: ${err}`);
    }
  };

  return (
    <form className="flex flex-col gap-4" action={handleSubmit}>
      <div className="flex flex-row gap-4 items-center">
        {title ? (
          <button type="submit" disabled={isProcessing}>
            <MdSave
              size={28}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            />
          </button>
        ) : (
          <MdClose
            size={28}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => setIndex(0)}
          />
        )}
        <input
          type="text"
          placeholder="Title"
          name="title"
          className="outline-none lg:text-3xl w-full"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
        />
      </div>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-4 rounded-lg outline-none bg-stone-100 dark:bg-stone-700 resize-none"
        draggable={false}
        maxLength={150}
        name="description"
      />
      <div className="flex flex-col gap-2">
        {link.startsWith("https://") ? (
          <LinkPreview url={link} className="w-full">
            <input
              type="text"
              placeholder="Link"
              name="link"
              className="p-4 rounded-lg outline-none w-full bg-stone-100 dark:bg-stone-700"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={150}
            />
          </LinkPreview>
        ) : (
          <input
            type="text"
            placeholder="Link"
            name="link"
            className="p-4 rounded-lg outline-none w-full bg-stone-100 dark:bg-stone-700"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            maxLength={150}
          />
        )}
        <p className="text-stone-400 dark:text-stone-600 text-sm">
          Note: The link must start with &apos;https://&apos; and hover on the
          input area to preview the link.
        </p>
      </div>
      {error && (
        <div className="p-4 bg-stone-100 dark:shadow-none shadow flex flex-row gap-4 items-center rounded-md  ">
          <MdError size={24} />
          <p>{error}</p>
        </div>
      )}
    </form>
  );
};
