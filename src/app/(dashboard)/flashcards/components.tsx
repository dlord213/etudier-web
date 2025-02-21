/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardProps } from "@/types/Card";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import {
  MdAdd,
  MdArrowLeft,
  MdArrowRight,
  MdClose,
  MdDelete,
  MdError,
  MdList,
  MdPlayCircle,
  MdSave,
  MdSend,
  MdStayCurrentLandscape,
} from "react-icons/md";
import { addFlashcard, deleteFlashcard } from "./actions";
import { FlashcardProps } from "@/types/Flashcard";
import model from "@/lib/ai";
import { ThreeDot } from "react-loading-indicators";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

export const Flashcard = ({
  frontContent,
  backContent,
  className = "",
}: {
  frontContent: string;
  backContent: string;
  className?: string;
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`relative w-full lg:h-[25vh] md:h-[35vh] h-[50vh] cursor-pointer ${className}`}
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateX(180deg)" : "none",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300"
          style={{
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <p className="break-words whitespace-normal overflow-hidden">
            {frontContent}
          </p>
        </div>
        {/* Back Side */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300"
          style={{
            transform: "rotateX(180deg)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          <p className="break-words whitespace-normal overflow-hidden">
            {backContent}
          </p>
        </div>
      </div>
    </div>
  );
};

export const FlashcardModalSheet = ({
  setJSON,
  setIndex,
  json,
  user_id,
}: {
  setJSON: Dispatch<SetStateAction<any>>;
  setIndex: Dispatch<SetStateAction<number>>;
  json: any;
  user_id: string;
}) => {
  const [modalIndex, setModalIndex] = useState<number | null>(0);
  const [isListVisible, setIsListVisible] = useState(true);

  const handleClose = () => {
    setIndex(0);
    setModalIndex(null);
    setJSON([]);
  };

  const {
    cards: card,
    user_id: flashcard_user_id,
    flashcard_id,
    title,
    description,
  } = json;

  return (
    <div className="flex flex-col gap-4">
      <form
        action={async (e) => {
          await deleteFlashcard(e);
          handleClose();
        }}
        className="flex flex-row justify-between"
      >
        <input type="hidden" value={flashcard_id} name="flashcard_id" />
        <MdClose
          size={28}
          className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
          onClick={handleClose}
        />
        <div className="flex flex-row gap-4 items-center">
          {!isListVisible ? (
            <MdList
              size={28}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              onClick={() => setIsListVisible(true)}
            />
          ) : (
            <MdStayCurrentLandscape
              size={28}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              onClick={() => setIsListVisible(false)}
            />
          )}
          {flashcard_user_id == user_id && (
            <button type="submit">
              <MdDelete
                size={28}
                className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
              />
            </button>
          )}
        </div>
      </form>
      <h1 className="lg:text-4xl text-2xl font-bold">{title}</h1>
      {description && <p className="lg:text-xl">{description}</p>}
      {isListVisible ? (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-2 lg:h-full lg:max-h-none max-h-[20vh] lg:overflow-y-auto overflow-y-scroll">
            <p>Cards</p>
            {card.length > 0 ? (
              card.map((card: CardProps, index: number) => (
                <div
                  key={index}
                  className="flex flex-row gap-2 p-4 dark:bg-stone-800 rounded-md bg-stone-100"
                >
                  <div className="flex flex-row gap-4 items-center">
                    <MdPlayCircle
                      size={24}
                      className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                      onClick={() => {
                        setModalIndex(index);
                      }}
                    />
                    <span>{card.question}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No cards available.</p>
            )}
          </div>
          {modalIndex !== null && card[modalIndex] ? (
            <Flashcard
              frontContent={card[modalIndex].question}
              backContent={card[modalIndex].answer}
            />
          ) : (
            <div className="flex lg:h-[25vh] md:h-[35vh] h-[50vh] items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300">
              <h1>Select a card</h1>
            </div>
          )}
        </div>
      ) : (
        <>
          {modalIndex !== null && card[modalIndex] ? (
            <Flashcard
              frontContent={card[modalIndex].question}
              backContent={card[modalIndex].answer}
            />
          ) : (
            <div className="flex lg:h-[25vh] md:h-[35vh] h-[50vh] items-center justify-center rounded-md bg-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300">
              <h1>Flashcards done.</h1>
            </div>
          )}
          <div className="flex flex-row gap-4">
            <button
              className="w-full flex flex-row gap-2 px-4 py-2 rounded-md justify-center dark:bg-stone-700 items-center"
              onClick={() => {
                if (modalIndex != 0) {
                  setModalIndex((prevIndex) => prevIndex! - 1);
                }
              }}
            >
              <MdArrowLeft size={24} />
            </button>
            <button
              className="w-full flex flex-row gap-2 px-4 py-2 rounded-md justify-center dark:bg-stone-700 items-center"
              onClick={() => {
                if (modalIndex! != card.length) {
                  setModalIndex((prevIndex) => prevIndex! + 1);
                }
              }}
            >
              <MdArrowRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export const GenerateFlashcardModalSheet = ({
  setJSON,
  setIndex,
}: {
  setJSON: Dispatch<SetStateAction<FlashcardProps | CardProps[]>>;
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });

  const [modalIndex, setModalIndex] = useState<number | null>(0);
  const [isGenerating, setIsGenerating] = useState<number>(0); // 0 - default page | 1 - generating page | 2 - generated page | 3 - error page
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<
    [
      {
        description: string;
        title: string;
        cards: CardProps[];
      }
    ] & { error: string }
  >();
  const [isListVisible, setIsListVisible] = useState(false);

  const handleClose = () => {
    setIndex(0);
    setModalIndex(null);
    setJSON([]);
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    const predefinedPrompt = `I wanna generate a flashcard and the generated data must be formatted into something like this.\n [ cards: [{question: '', answer: ''}], title: "", description: ""]. Don't return any text, simply return an array with the object format I gave. If the prompt isn't related to generating flashcards or subjects then return an appropriate result that's formatted like this {error: put an appropriate string here saying that the prompt isn't valid or isn't related on generating flashcards.}. \n\nPrompt: ${prompt}`;

    setIsGenerating(1);
    const result = await model.generateContent(predefinedPrompt);
    const trimmedString = result.response
      .text()
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
    const parsed = JSON.parse(trimmedString);

    if (parsed.error) {
      setResult(parsed);
      setIsGenerating(3);
    } else {
      setResult(parsed);
      setPrompt("");
      setIsGenerating(2);
    }
  };

  return (
    <>
      {isGenerating == 0 && (
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex flex-col gap-4">
            <MdClose
              size={28}
              className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
              onClick={handleClose}
            />
            <div className="flex flex-col gap-4">
              <h1 className="lg:text-4xl font-bold text-2xl">
                Generate flashcards
              </h1>
              <div className="flex flex-row gap-2">
                <Textarea
                  id="prompt-default-input"
                  placeholder="Subjects? Topics? Type it here!"
                  className={cn(
                    "max-w-xl bg-black/5 dark:bg-white/5 rounded-3xl pl-6 pr-16",
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
                    "max-w-xl bg-black/5 dark:bg-white/5 rounded-3xl px-6",
                    "placeholder:text-black/50 dark:placeholder:text-white/50",
                    "border-none ring-black/20 dark:ring-white/20",
                    "text-black dark:text-white text-wrap"
                  )}
                  id="generateBtn"
                  onClick={async () => {
                    await handleGenerate();
                  }}
                >
                  <MdSend size={24} className="flex-shrink-0" />
                </button>
              </div>
              <p>
                Note: This is in beta version, results might not be what you
                want.
              </p>
            </div>
          </div>
        </div>
      )}
      {isGenerating == 1 && (
        <div className="flex flex-col items-center justify-center gap-6 lg:min-h-[75vh] min-h-[50vh] ">
          <ThreeDot color="#484848" size="large" />
          <h1 className="font-bold lg:text-3xl">Generating...</h1>
        </div>
      )}
      {isGenerating == 2 && (
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-row justify-between">
            <MdClose
              size={28}
              className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
              onClick={handleClose}
            />
            {!isListVisible ? (
              <MdList
                size={28}
                className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                onClick={() => setIsListVisible(true)}
              />
            ) : (
              <MdStayCurrentLandscape
                size={28}
                className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                onClick={() => setIsListVisible(false)}
              />
            )}
          </div>
          <h1 className="lg:text-4xl text-2xl font-bold">{result![0].title}</h1>
          {result![0].description && (
            <p className="lg:text-xl">{result![0].description}</p>
          )}
          {isListVisible ? (
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="flex flex-col gap-2 lg:h-full lg:max-h-none max-h-[20vh] lg:overflow-y-auto overflow-y-scroll">
                <p>Cards</p>
                {result![0].cards.length > 0 ? (
                  result![0].cards.map((card: CardProps, index: number) => (
                    <div
                      key={index}
                      className="flex flex-row gap-2 p-4 dark:bg-stone-800 rounded-md"
                    >
                      <div className="flex flex-row gap-4 items-center">
                        <MdPlayCircle
                          size={24}
                          className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
                          onClick={() => {
                            setModalIndex(index);
                          }}
                        />
                        <span>{card.question}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No cards available.</p>
                )}
              </div>
              {modalIndex !== null && result![0].cards[modalIndex] ? (
                <Flashcard
                  frontContent={result![0].cards[modalIndex].question}
                  backContent={result![0].cards[modalIndex].answer}
                />
              ) : (
                <div className="flex lg:h-[25vh] md:h-[35vh] h-[50vh] items-center justify-center rounded-md bg-gray-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300">
                  <h1>Select a card</h1>
                </div>
              )}
            </div>
          ) : (
            <>
              {modalIndex !== null && result![0].cards[modalIndex] ? (
                <Flashcard
                  frontContent={result![0].cards[modalIndex].question}
                  backContent={result![0].cards[modalIndex].answer}
                />
              ) : (
                <div className="flex lg:h-[25vh] md:h-[35vh] h-[50vh] items-center justify-center rounded-md bg-gray-100 dark:bg-stone-800 hover:dark:bg-stone-700 p-4 transition-all delay-0 duration-300">
                  <h1>Flashcards done.</h1>
                </div>
              )}
              <div className="flex flex-row gap-4">
                <button
                  className="w-full flex flex-row gap-2 px-4 py-2 rounded-md justify-center dark:bg-stone-700 items-center"
                  onClick={() => {
                    if (modalIndex != 0) {
                      setModalIndex((prevIndex) => prevIndex! - 1);
                    }
                  }}
                >
                  <MdArrowLeft size={24} />
                </button>
                <button
                  className="w-full flex flex-row gap-2 px-4 py-2 rounded-md justify-center dark:bg-stone-700 items-center"
                  onClick={() => {
                    if (modalIndex! != result![0].cards.length) {
                      setModalIndex((prevIndex) => prevIndex! + 1);
                    }
                  }}
                >
                  <MdArrowRight size={24} />
                </button>
              </div>
            </>
          )}
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
        </div>
      )}
      {isGenerating == 3 && (
        <div className="flex flex-col items-center justify-center gap-4 ">
          <div className="flex flex-col gap-4">
            <MdClose
              size={28}
              className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
              onClick={handleClose}
            />
            <div className=" flex flex-col gap-4">
              <h1 className="lg:text-4xl font-bold">Generate flashcards</h1>
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
              <p>
                Note: This is in beta version, results might not be what you
                want.
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center p-4 dark:bg-stone-700 rounded-md">
              <MdError size={36} className="flex-shrink-0" />
              <h1 className="font-bold">{result!.error}</h1>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const FlashcardAddPage = ({
  setJSON,
  setError,
  error,
  json,
  setPageIndex,
}: {
  setError: Dispatch<SetStateAction<string>>;
  setJSON: Dispatch<SetStateAction<any>>;
  error: string;
  json?: any;
  setPageIndex: Dispatch<SetStateAction<number>>;
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [index, setIndex] = useState(0);

  const handleAddFlashcard = () => {
    if (question.trim() && answer.trim()) {
      const newFlashcard = { question: question.trim(), answer: answer.trim() };
      setJSON((prev: any) => [...prev, newFlashcard]);
      setQuestion("");
      setAnswer("");
    }
  };

  const handleCancel = () => {
    setIndex(0);
    setJSON([]);
    setQuestion("");
    setAnswer("");
  };

  const handleDelete = (delIndex: number) => {
    setJSON((prev: any) => {
      if (Array.isArray(json)) {
        return prev.filter((_, i: number) => i !== delIndex);
      }
    });
    setIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (json!.length < 2) {
      setError("Add at least two flashcards.");
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const status = await addFlashcard(formData);
      if (status === 200) {
        setPageIndex(0);
        setJSON([]);
        setQuestion("");
        setAnswer("");
      } else {
        setError("Error saving flashcards. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form
      className="flex flex-col gap-4 lg:max-w-3xl lg:min-w-3xl lg:mx-auto"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-row gap-4 items-center">
        {json!.length >= 1 ? (
          <button type="submit">
            <MdSave
              size={28}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            />
          </button>
        ) : (
          <MdClose
            size={28}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => setPageIndex(0)}
          />
        )}
        <input
          type="text"
          placeholder="Title of the flashcard..."
          name="title"
          className="outline-none lg:text-3xl w-full"
          required
          maxLength={150}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <input type="hidden" value={JSON.stringify(json)} name="cards" />
          <input
            type="text"
            placeholder="Question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="outline-none lg:text-xl"
            maxLength={150}
          />
          <textarea
            placeholder="Answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="p-4 rounded-lg outline-none bg-stone-100 dark:bg-stone-700 resize-none"
            draggable={false}
            maxLength={150}
          />
          <button
            type="button"
            onClick={handleAddFlashcard}
            className="flex flex-row justify-center gap-2 cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 rounded-md px-4 py-2 bg-stone-100 hover:bg-stone-200"
          >
            <MdAdd size={24} />
            <p>Add card</p>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {json!.length >= 1 && (
            <>
              <div className="relative">
                {/* Delete button */}
                <p className="absolute top-4 left-4 z-10 text-white">
                  {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(index);
                    setIndex((prev) => (prev - 1 + json.length) % json.length);
                  }}
                  className="absolute top-4 right-4 z-10 dark:bg-stone-700 text-white rounded-full p-1 dark:hover:bg-stone-600"
                >
                  <MdClose size={16} />
                </button>
                <Flashcard
                  frontContent={json[index].question}
                  backContent={json[index].answer}
                />
              </div>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row lg:gap-4 gap-2">
                  <button
                    type="button"
                    className="cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-stone-200 hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-800 rounded-md px-4 py-2"
                    onClick={() =>
                      setIndex((prev) => (prev - 1 + json.length) % json.length)
                    }
                  >
                    <MdArrowLeft size={24} />
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-stone-200 hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-800 rounded-md px-4 py-2"
                    onClick={() => setIndex((prev) => (prev + 1) % json.length)}
                  >
                    <MdArrowRight size={24} />
                  </button>
                </div>
                <button
                  type="button"
                  className="cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:bg-stone-200 hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-800 rounded-md px-4 py-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="p-4 flex flex-row gap-4 items-center dark:bg-stone-700 rounded-md">
          <MdError size={24} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </form>
  );
};
