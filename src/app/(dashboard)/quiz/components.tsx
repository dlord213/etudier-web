/* eslint-disable @typescript-eslint/no-explicit-any */
import { LinkPreview } from "@/components/ui/link-preview";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import model from "@/lib/ai";
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/client";
import { QuizDataProps, QuizProps } from "@/types/Quiz";
import { Dispatch, SetStateAction, useState } from "react";
import {
  MdAdd,
  MdArrowLeft,
  MdCheck,
  MdClose,
  MdDelete,
  MdError,
  MdGeneratingTokens,
  MdRestartAlt,
  MdSave,
  MdSend,
  MdStart,
} from "react-icons/md";
import { ThreeDot } from "react-loading-indicators";
import { toast } from "sonner";

export const AddQuizComponent = ({
  setIndex,
}: {
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const instance = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quiz, setQuiz] = useState<QuizProps[]>([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const handleAddQuestion = () => {
    if (!question.trim() || answers.some((ans) => !ans.trim())) return;

    setQuiz((prev) => [
      ...prev,
      { question, answers, correct_answer: correctAnswer },
    ]);
    setQuestion("");
    setAnswers(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const handleSubmit = async () => {
    if (quiz.length === 0) return;

    const { error } = await instance.from("quiz").insert({
      title: title,
      description: description,
      quizzes: quiz,
    });
    setIndex(0);
    if (error) console.error("Error uploading quiz:", error);
    else {
      setQuiz([]);
    }
  };

  const handleDeleteQuiz = (index: number) => {
    setQuiz((prevQuiz) => prevQuiz.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        {title ? (
          <button type="submit">
            <MdSave
              size={32}
              className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
              onClick={handleSubmit}
            />
          </button>
        ) : (
          <MdClose
            size={32}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
            onClick={() => setIndex(0)}
          />
        )}
        <input
          type="text"
          className="font-bold outline-none lg:text-4xl w-full"
          placeholder="Put your title here..."
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <input
        type="text"
        placeholder="Put your description here..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="outline-none lg:text-xl"
        maxLength={150}
      />
      <div className="flex flex-col gap-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-md">
        <input
          type="text"
          placeholder="Put your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="outline-none lg:text-xl bg-stone-100 dark:bg-stone-800"
          maxLength={150}
        />
        <div className="flex flex-row gap-4">
          {answers.map((answer, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="radio"
                name="correctAnswer"
                checked={correctAnswer === idx}
                onChange={() => setCorrectAnswer(idx)}
              />
              <input
                type="text"
                placeholder={`Answer ${idx + 1}`}
                value={answer}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[idx] = e.target.value;
                  setAnswers(newAnswers);
                }}
                className="w-full p-2 rounded-md outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddQuestion}
        className="flex flex-row justify-center gap-2 cursor-pointer transition-all delay-0 duration-200 bg-stone-100 hover:dark:text-stone-100 dark:bg-stone-800 hover:dark:bg-stone-700 rounded-md px-4 py-2 "
      >
        <MdAdd size={24} />
        <p>Add question</p>
      </button>

      <h2 className="text-lg font-bold mb-2">Quiz Preview</h2>
      {quiz.map((q, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 p-4 bg-stone-100 dark:bg-stone-800 rounded-md"
        >
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-2xl">{q.question}</h1>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteQuiz(idx)}
            >
              <MdDelete size={24} className="flex-shrink-0" />
            </button>
          </div>
          <ul className="flex flex-row items-center gap-4">
            {q.answers.map((ans, aIdx) => (
              <li
                key={aIdx}
                className={q.correct_answer === aIdx ? "text-green-500" : ""}
              >
                {ans}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const GenerateQuizComponent = ({
  setIndex,
}: {
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const [result, setResult] = useState<any>();

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  });

  const [isQuizDone, setIsQuizDone] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(0);
  const [state, setState] = useState(0);

  const calculateScore = () => {
    return userAnswers.reduce(
      (score, answer, index) =>
        answer === result![0]!.quizzes[index].correct_answer
          ? score + 1
          : score,
      0
    );
  };

  const handleClose = () => {
    setIsQuizDone(false);
    setUserAnswers([]);
    setIndex(0);
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    const predefinedPrompt = `I wanna generate a quiz and the generated data must be formatted into something like this. {title: "", description:"", quizzes:[{userAnswers: ["", "", "", ""], question: "", correct_answer: number index in userAnswers}], resources: [{title: "", link: ""}]}. And provide a quite long but summarized description, atleast 10 quizzes. Don't return any text, simply return an array with the object format I gave. If the prompt isn't related to generating quiz or subjects then return an appropriate result that's formatted like this {error: put an appropriate string here saying that the prompt isn't valid or isn't related on generating quiz.}.
  
    Prompt: ${prompt}`;

    setIsGenerating(1);
    const resultResponse = await model.generateContent(predefinedPrompt);
    let parsed: any;
    try {
      const trimmedString = resultResponse.response
        .text()
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
      parsed = JSON.parse(trimmedString);
    } catch (error) {
      parsed = { error: "Failed to parse generated quiz data." + error };
    }

    if (parsed.error) {
      setResult(parsed);
      setIsGenerating(3);
    } else {
      setResult(parsed);
      setPrompt("");
      setIsGenerating(2);
    }
  };

  const handleAnswerClick = (questionIndex: number, answerIndex: number) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  if (isGenerating === 0)
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex flex-col gap-4">
          <MdClose
            size={28}
            className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
            onClick={handleClose}
          />
          <div className="flex flex-col gap-4">
            <h1 className="lg:text-4xl font-bold text-2xl">Generate quiz</h1>
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
              Note: This is in beta version, results might not be what you want.
            </p>
          </div>
        </div>
      </div>
    );

  if (isGenerating === 1)
    return (
      <div className="flex flex-col items-center justify-center gap-6 lg:min-h-[75vh] min-h-[50vh]">
        <ThreeDot color="#484848" size="large" />
        <h1 className="font-bold lg:text-3xl">Generating...</h1>
      </div>
    );

  if (isGenerating === 2)
    return (
      <>
        {state == 0 && (
          <>
            <div className="flex flex-row gap-4 justify-between">
              <div className="flex flex-row gap-4 items-center">
                <MdArrowLeft
                  size={28}
                  color={"#fefefe"}
                  className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md flex-shrink-0"
                  onClick={() => {
                    setIndex(0);
                  }}
                />
                <div className="flex flex-col">
                  <h1 className="font-bold lg:text-3xl text-xl">
                    {result![0]!.title}
                  </h1>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md lg:p-4 px-4 py-2"
                  onClick={() => {
                    setUserAnswers([]);
                    setIsQuizDone(false);
                    setIsGenerating(0);
                    setResult([]);
                  }}
                >
                  <MdGeneratingTokens size={28} />
                </button>
                <button
                  type="button"
                  className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md lg:p-4 px-4 py-2"
                  onClick={() => {
                    setState(1);
                  }}
                  disabled={isQuizDone}
                >
                  <MdStart size={28} />
                  <p className="lg:block hidden">Start</p>
                </button>
              </div>
            </div>
            <div className="flex flex-col">{result![0]!.description}</div>
            <div className="flex flex-col gap-2">
              <p className="dark:text-stone-600 text-sm my-2">Resources</p>
              {Array.isArray(result![0]!.resources) &&
                result![0]!.resources.map(
                  (item: {
                    title: string;
                    description: string;
                    link: string;
                  }) => (
                    <LinkPreview
                      url={item.link}
                      className="flex flex-col bg-stone-100 p-4 rounded-md dark:bg-stone-700"
                      key={item.link}
                    >
                      <h1 className="font-bold text-lg">{item.title}</h1>
                    </LinkPreview>
                  )
                )}
            </div>
          </>
        )}
        {state == 1 && (
          <>
            <div className="flex flex-row gap-4 justify-between">
              <div className="flex flex-row gap-4 items-center">
                <MdArrowLeft
                  size={28}
                  color={"#fefefe"}
                  className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md flex-shrink-0"
                  onClick={() => {
                    setIndex(0);
                  }}
                />
                <div className="flex flex-col">
                  <h1 className="font-bold lg:text-3xl text-xl">
                    {result![0]!.title}
                  </h1>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                {isQuizDone && (
                  <button
                    type="button"
                    className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md bg-stone-100 hover:bg-stone-200 lg:p-4 px-4 py-2"
                    onClick={() => {
                      setUserAnswers([]);
                      setIsQuizDone(false);
                    }}
                  >
                    <MdRestartAlt size={28} />
                  </button>
                )}
                <button
                  type="button"
                  className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md bg-stone-100 hover:bg-stone-200 lg:p-4 px-4 py-2"
                  onClick={() => {
                    setIsQuizDone(true);
                    const score = calculateScore();
                    toast(
                      `Your score is ${score} out of ${
                        result[0]!.quizzes.length
                      }`
                    );
                  }}
                  disabled={isQuizDone}
                >
                  <MdCheck size={28} />
                  <p className="lg:block hidden">Done</p>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="dark:text-stone-600 text-sm my-2">Quizzes</p>
              {result![0]!.quizzes.map((quiz: any, quizIndex: number) => (
                <div
                  key={`result-question-${quizIndex}`}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-row">
                    <p>{quiz.question}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quiz.userAnswers.map(
                      (answer: any, answerIndex: number) => (
                        <button
                          key={`result-answer-${quizIndex}-${answerIndex}`}
                          type="button"
                          className={`px-2 py-4 dark:bg-stone-700 dark:hover:bg-stone-800 transition-all duration-200 rounded-md ${
                            userAnswers[quizIndex] === answerIndex
                              ? "bg-green-500 dark:bg-stone-800"
                              : "disabled:dark:bg-stone-900"
                          }`}
                          onClick={() =>
                            handleAnswerClick(quizIndex, answerIndex)
                          }
                          disabled={isQuizDone}
                        >
                          <p>{answer}</p>
                        </button>
                      )
                    )}
                  </div>
                  {isQuizDone && (
                    <div className="flex p-4 items-center dark:bg-stone-800 rounded-md gap-4">
                      {userAnswers[quizIndex] === quiz.correct_answer ? (
                        <>
                          <MdCheck size={28} color="#fefefe" />
                          <p>Your answer is correct.</p>
                        </>
                      ) : (
                        <>
                          <MdError size={28} color="#fefefe" />
                          <p>
                            Your answer is incorrect. The correct answer was{" "}
                            {quiz.userAnswers[quiz.correct_answer]}.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );

  if (isGenerating === 3)
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-4">
          <MdClose
            size={28}
            className="cursor-pointer transition-all duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 rounded-md"
            onClick={handleClose}
          />
          <div className="flex flex-col gap-4">
            <h1 className="lg:text-4xl font-bold">Generate quiz</h1>
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
              Note: This is in beta version, results might not be what you want.
            </p>
          </div>
          <div className="flex flex-row gap-2 items-center p-4 dark:bg-stone-700 rounded-md">
            <MdError size={36} className="flex-shrink-0" />
            <h1 className="font-bold">{result!.error}</h1>
          </div>
        </div>
      </div>
    );
};

export const AnswerUserQuizComponent = ({
  setIndex,
  quiz,
}: {
  setIndex: Dispatch<SetStateAction<number>>;
  quiz?: QuizDataProps;
}) => {
  const [isQuizDone, setIsQuizDone] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [state, setState] = useState(0);

  const handleAnswerClick = (questionIndex: number, answerIndex: number) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const calculateScore = () => {
    return userAnswers.reduce(
      (score, answer, index) =>
        answer === quiz!.quizzes[index].correct_answer ? score + 1 : score,
      0
    );
  };

  const pages = [
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center">
          <MdArrowLeft
            size={28}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => {
              setIndex(0);
            }}
          />
          <div className="flex flex-col">
            <h1 className="font-bold lg:text-3xl text-xl">{quiz!.title}</h1>
            <p className="dark:text-stone-600 text-sm">
              {quiz!.user_id!.username}
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md bg-stone-100 hover:bg-stone-200 lg:p-4 px-4 py-2"
            onClick={() => setState(1)}
          >
            <MdStart size={28} />
            <p className="lg:block hidden">Start</p>
          </button>
        </div>
      </div>
      <div className="flex flex-col">{quiz!.description}</div>
    </>,
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center">
          <MdArrowLeft
            size={28}
            className="cursor-pointer transition-all delay-0 duration-200 hover:dark:text-stone-100 hover:dark:bg-stone-800 hover:bg-stone-200 rounded-md"
            onClick={() => setState(0)}
          />
          <div className="flex flex-col">
            <h1 className="font-bold lg:text-3xl text-xl">{quiz!.title}</h1>
            <p className="dark:text-stone-600 text-sm">
              {quiz!.user_id!.username}
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {isQuizDone && (
            <button
              type="button"
              className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md bg-stone-100 hover:bg-stone-200 lg:p-4 px-4 py-2"
              onClick={() => {
                setUserAnswers([]);
                setIsQuizDone(false);
              }}
            >
              <MdRestartAlt size={28} />
            </button>
          )}
          <button
            type="button"
            className="flex flex-row gap-2 items-center disabled:cursor-default disabled:dark:bg-stone-900 cursor-pointer transition-all duration-200 hover:dark:text-stone-100 dark:bg-stone-700 hover:dark:bg-stone-800 rounded-md bg-stone-100 hover:bg-stone-200 lg:p-4 px-4 py-2"
            onClick={() => {
              setIsQuizDone(true);
              const score = calculateScore();
              toast(`Your score is ${score} out of ${quiz!.quizzes.length}`);
            }}
            disabled={isQuizDone}
          >
            <MdCheck size={28} />
            <p className="lg:block hidden">Done</p>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {quiz!.quizzes.map((quiz, quizIndex: number) => (
          <div key={`question-${quizIndex}`} className="flex flex-col gap-2">
            <div className="flex flex-row">
              <p>{quiz.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quiz.answers.map((answer, answerIndex) => (
                <button
                  key={`answer-${quizIndex}-${answerIndex}`}
                  type="button"
                  className={`px-2 py-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-800 transition-all duration-200 rounded-md ${
                    userAnswers[quizIndex] === answerIndex
                      ? "bg-green-500 dark:bg-stone-800"
                      : "disabled:dark:bg-stone-900"
                  }`}
                  onClick={() => handleAnswerClick(quizIndex, answerIndex)}
                  disabled={isQuizDone}
                >
                  <p>{answer}</p>
                </button>
              ))}
            </div>
            {isQuizDone && (
              <div className="flex p-4 items-center bg-stone-100 dark:bg-stone-800 rounded-md gap-4">
                {userAnswers[quizIndex] === quiz.correct_answer ? (
                  <>
                    <MdCheck size={28} />
                    <p>Your answer is correct.</p>
                  </>
                ) : (
                  <>
                    <MdError size={28} />
                    <p>
                      Your answer is incorrect. The correct answer was{" "}
                      {quiz.answers[quiz.correct_answer]}.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>,
  ];

  if (quiz) return <>{pages[state]}</>;
};
