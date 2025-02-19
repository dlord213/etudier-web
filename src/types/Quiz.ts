export interface QuizProps {
  question: string;
  answers: string[];
  correct_answer: number;
}

export interface QuizDataProps {
  quiz_id?: string;
  user_id?: string & { id: string; username: string };
  title: string;
  description: string;
  quizzes: QuizProps[];
  correct_answers: number[];
}
